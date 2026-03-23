import { Injectable, OnModuleInit, Logger, BadRequestException } from "@nestjs/common";
import { Telegraf, Context, Telegram } from "telegraf";
import { PrismaService } from "../prisma/prisma.service";
import { TelegramLoggerService } from "./telegram-logger.service";

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bots: Map<string, Telegraf> = new Map();
  // carts[companyId][chatId][productId] = qty
  private carts: Map<string, Map<string, Map<string, number>>> = new Map();

  constructor(
    private prisma: PrismaService,
    private loggerBot: TelegramLoggerService,
  ) {}

  async onModuleInit() {
    try {
      await this.initializeBots();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error("Failed to initialize bots: " + message);
    }
  }

  async initializeBots() {
    const bots = await this.prisma.customBot.findMany({
      where: { isActive: true, deletedAt: null },
      include: { company: true },
    });
    this.logger.log("Found " + bots.length + " active bots to initialize");
    for (const bot of bots) {
      await this.initBot(bot.companyId, bot.token, bot.company.name);
    }
  }

  private translations = {
    uz: {
      welcome: "Assalomu alaykum! Botga xush kelibsiz.\nIltimos, telefon raqamingizni yuboring:",
      sendPhone: "📞 Telefon raqamni yuborish",
      suspended: "⚠️ Ushbu bot xizmati vaqtinchalik to'xtatilgan. Iltimos, menejer bilan bog'laning.",
      notRegistered: "❌ Siz diler sifatida ro'yxatdan o'tmagansiz.\nIltimos, kompaniya menejeri bilan bog'laning.",
      loginSuccess: " muvaffaqiyatli tizimga kirdingiz!",
      commands: "\n\n📋 Buyruqlar:\n/debt — Qarzni ko'rish\n/payments — To'lovlar tarixi\n/products — Mahsulotlarni ko'rish\n/orders — Buyurtmalar tarixi\n/help — Yordam",
      kbdDebt: "💰 Qarzim",
      kbdPayments: "💸 To'lovlarim",
      kbdProducts: "📦 Mahsulotlar",
      kbdOrders: "📋 Buyurtmalarim",
      kbdHelp: "ℹ️ Yordam",
      debtTitle: "Joriy qarz",
      limitTitle: "Kredit limiti",
      overLimit: "⚠️ Kredit limitidan oshgan!",
      withinLimit: "✅ Limitda",
      noProducts: "📭 Hozircha mahsulotlar mavjud emas.",
      productList: "📦 *Mahsulotlar ro'yxati:*",
      noOrders: "📭 Hali buyurtmalar yo'q.",
      recentOrders: "📋 *So'nggi buyurtmalar:*",
      noPayments: "📭 Hali to'lovlar yo'q.",
      recentPayments: "💸 *Oxirgi to'lovlar:*",
      startOver: "⚠️ Avval /start orqali ro'yxatdan o'ting va telefon raqamingizni yuboring.",
      helpTitle: "Yordam",
      helpCommands: "📋 Buyruqlar:\n\n/debt — Qarzingizni ko'ring\n/payments — To'lovlar tarixi\n/products — Mahsulotlar ro'yxati\n/orders — Buyurtmalar tarixi\n/cart — Savat\n/checkout — Buyurtma berish\n/help — Yordam\n\n📞 Muammo bo'lsa: kompaniya menejeriga murojaat qiling.",
      addToCart: "🛒 Savatga",
      cartEmpty: "🛒 Savat bo'sh.\n/products orqali mahsulot qo'shing.",
      cartTitle: "🛒 *Savatingiz:*",
      cartTotal: "💰 *Jami:*",
      cartCheckout: "✅ Buyurtma berish",
      cartClear: "🗑 Tozalash",
      cartCleared: "🗑 Savat tozalandi.",
      cartUpdated: "✅ Savatga qo'shildi!",
      cartRemoved: "❌ O'chirildi.",
      checkoutSuccess: "✅ Buyurtma qabul qilindi!\n\n*Buyurtma #",
      checkoutFail: "❌ Buyurtma berishda xatolik. Iltimos, qayta urinib ko'ring.",
      checkoutEmpty: "🛒 Savat bo'sh. Avval /products orqali mahsulot tanlang.",
      limitExceeded: "⚠️ Kredit limiti yetarli emas! Avval qarzni to'lang.",
      kbdCart: "🛒 Savat",
    },
    ru: {
      welcome: "Здравствуйте! Добро пожаловать.\nПожалуйста, отправьте ваш номер телефона:",
      sendPhone: "📞 Отправить номер",
      suspended: "⚠️ Сервис временно приостановлен. Свяжитесь с менеджером.",
      notRegistered: "❌ Вы не зарегистрированы как дилер. Свяжитесь с менеджером компании.",
      loginSuccess: ", вы успешно вошли в систему!",
      commands: "\n\n📋 Команды:\n/debt — Мой долг\n/payments — История платежей\n/products — Список продуктов\n/orders — История заказов\n/cart — Корзина\n/checkout — Оформить заказ\n/help — Помощь",
      kbdDebt: "💰 Мой долг",
      kbdPayments: "💸 Платежи",
      kbdProducts: "📦 Продукты",
      kbdOrders: "📋 Заказы",
      kbdHelp: "ℹ️ Помощь",
      debtTitle: "Текущий долг",
      limitTitle: "Кредитный лимит",
      overLimit: "⚠️ Превышен лимит!",
      withinLimit: "✅ В лимите",
      noProducts: "📭 Продуктов пока нет.",
      productList: "📦 *Список продуктов:*",
      noOrders: "📭 Заказов пока нет.",
      recentOrders: "📋 *Последние заказы:*",
      noPayments: "📭 Платежей пока нет.",
      recentPayments: "💸 *Последние платежи:*",
      startOver: "⚠️ Сначала отправьте /start и ваш номер телефона.",
      helpTitle: "Помощь",
      helpCommands: "📋 Команды:\n\n/debt — Узнать долг\n/payments — История платежей\n/products — Список товаров\n/orders — Список заказов\n/cart — Корзина\n/checkout — Оформить заказ\n/help — Помощь\n\n📞 Проблемы? Свяжитесь с менеджером.",
      addToCart: "🛒 В корзину",
      cartEmpty: "🛒 Корзина пуста.\nДобавьте товары через /products.",
      cartTitle: "🛒 *Ваша корзина:*",
      cartTotal: "💰 *Итого:*",
      cartCheckout: "✅ Оформить заказ",
      cartClear: "🗑 Очистить",
      cartCleared: "🗑 Корзина очищена.",
      cartUpdated: "✅ Добавлено в корзину!",
      cartRemoved: "❌ Удалено.",
      checkoutSuccess: "✅ Заказ принят!\n\n*Заказ #",
      checkoutFail: "❌ Ошибка при оформлении. Попробуйте ещё раз.",
      checkoutEmpty: "🛒 Корзина пуста. Сначала добавьте товары через /products.",
      limitExceeded: "⚠️ Недостаточно кредитного лимита! Сначала погасите долг.",
      kbdCart: "🛒 Корзина",
    }
  };

  private getT(lang: string = 'uz') {
    return this.translations[lang] || this.translations['uz'];
  }

  /** Detect language from Telegram ctx.from.language_code and return translations */
  private getLangFromCtx(ctx: Context) {
    const code = (ctx.from as any)?.language_code ?? 'uz';
    const lang = code.startsWith('ru') ? 'ru' : 'uz';
    return this.translations[lang] ?? this.translations['uz'];
  }

  async initBot(companyId: string, token: string, companyName: string) {
    try {
      const existing = this.bots.get(companyId);
      if (existing) {
        existing.stop("reinitializing");
        this.bots.delete(companyId);
      }

      const bot = new Telegraf(token);

      bot.start(async (ctx) => {
        const company = await this.prisma.company.findUnique({ where: { id: companyId } });
        const t = this.getLangFromCtx(ctx);

        if (company?.subscriptionStatus === "LOCKED" || (company?.subscriptionStatus === "TRIAL" && new Date() > company.trialExpiresAt)) {
          return ctx.reply(t.suspended);
        }

        // Check if this user is already registered — skip phone prompt
        const chatId = String(ctx.chat.id);
        const existingDealer = await this.prisma.dealer.findFirst({
          where: { telegramChatId: chatId, companyId, deletedAt: null },
        });

        if (existingDealer) {
          const storeUrl = `${process.env.FRONTEND_URL || 'https://supplio.uz'}/store/${company?.slug || companyId}`;
          await ctx.reply(`👋 ${existingDealer.name}${t.loginSuccess}${t.commands}`, {
            reply_markup: {
              keyboard: [
                [{ text: t.kbdDebt }, { text: t.kbdPayments }],
                [{ text: t.kbdProducts }, { text: t.kbdOrders }],
                [{ text: t.kbdCart }, { text: t.kbdHelp }],
              ],
              resize_keyboard: true,
            },
          });
          await ctx.reply(`🛍 ${companyName}`, {
            reply_markup: {
              inline_keyboard: [[{ text: '🛍 Do\'konni ochish', web_app: { url: storeUrl } }]],
            },
          });
          return;
        }

        await ctx.reply(`🏢 ${companyName}\n\n${t.welcome}`, {
          reply_markup: {
            keyboard: [[{ text: t.sendPhone, request_contact: true }]],
            resize_keyboard: true, one_time_keyboard: true,
          },
        });
      });

      bot.on("contact", async (ctx) => {
        const contact = ctx.message.contact;
        let phone = contact.phone_number.replace("+", "");
        if (!phone.startsWith("998")) phone = "998" + phone;

        const dealer = await this.prisma.dealer.findFirst({
          where: { phone: { contains: phone.slice(-9) }, companyId, deletedAt: null },
        });

        const t = this.getLangFromCtx(ctx);

        if (!dealer) return ctx.reply(t.notRegistered);

        const chatId = String(ctx.chat.id);
        await this.prisma.dealer.update({ where: { id: dealer.id }, data: { telegramChatId: chatId } });

        const company = await this.prisma.company.findUnique({ where: { id: companyId } });
        const storeUrl = `${process.env.FRONTEND_URL || 'https://supplio.uz'}/store/${company?.slug || companyId}`;

        await ctx.reply(`✅ ${dealer.name}${t.loginSuccess}${t.commands}`, {
          reply_markup: {
            keyboard: [
              [{ text: t.kbdDebt }, { text: t.kbdPayments }],
              [{ text: t.kbdProducts }, { text: t.kbdOrders }],
              [{ text: t.kbdCart }, { text: t.kbdHelp }],
            ],
            resize_keyboard: true,
          },
        });

        // Send WebApp button as inline keyboard
        await ctx.reply(`🛍 ${companyName}`, {
          reply_markup: {
            inline_keyboard: [[
              { text: '🛍 Do\'konni ochish', web_app: { url: storeUrl } },
            ]],
          },
        });
      });

      bot.command("debt", async (ctx) => await this.handleDebt(ctx, companyId));
      bot.hears(["💰 Qarzim", "💰 Мой долг"], async (ctx) => await this.handleDebt(ctx, companyId));

      bot.command("products", async (ctx) => await this.handleProducts(ctx, companyId));
      bot.hears(["📦 Mahsulotlar", "📦 Продукты"], async (ctx) => await this.handleProducts(ctx, companyId));

      bot.command("payments", async (ctx) => await this.handlePayments(ctx, companyId));
      bot.hears(["💸 To'lovlarim", "💸 Платежи"], async (ctx) => await this.handlePayments(ctx, companyId));

      bot.command("orders", async (ctx) => await this.handleOrders(ctx, companyId));
      bot.hears(["📋 Buyurtmalarim", "📋 Заказы"], async (ctx) => await this.handleOrders(ctx, companyId));

      bot.command("cart", async (ctx) => await this.handleCart(ctx, companyId));
      bot.hears(["🛒 Savat", "🛒 Корзина"], async (ctx) => await this.handleCart(ctx, companyId));

      bot.command("checkout", async (ctx) => await this.handleCheckout(ctx, companyId));

      bot.command("help", async (ctx) => await this.handleHelp(ctx, companyName));
      bot.hears(["ℹ️ Yordam", "ℹ️ Помощь"], async (ctx) => await this.handleHelp(ctx, companyName));

      bot.on("callback_query", async (ctx) => await this.handleCallback(ctx, companyId));

      if (process.env.NODE_ENV === "production" && (process.env.BOT_WEBHOOK_URL || process.env.APP_URL)) {
        const baseUrl = process.env.BOT_WEBHOOK_URL || (process.env.APP_URL + "/webhook");
        // Ensure the URL is properly formed: {baseUrl}/{companyId}
        const webhookUrl = baseUrl.endsWith("/") ? `${baseUrl}${companyId}` : `${baseUrl}/${companyId}`;
        await bot.telegram.setWebhook(webhookUrl);
        this.logger.log(`✅ Webhook set for ${companyName}: ${webhookUrl}`);
      } else {
        bot.launch().catch((e) => this.logger.warn(`Polling launch failed for ${companyName}: ${e.message}`));
        this.logger.log(`✅ Bot launched (polling) for ${companyName}`);
      }

      this.bots.set(companyId, bot);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      this.logger.error(`❌ Bot init failed for ${companyId}: ${message}`);
    }
  }

  private async handleDebt(ctx: Context, companyId: string) {
    const dealer = await this.getDealerByChatId(ctx, companyId);
    if (!dealer) return;

    const t = this.getLangFromCtx(ctx);
    const debt = dealer.currentDebt || 0;
    const limit = dealer.creditLimit || 0;
    const ratio = limit > 0 ? Math.round((debt / limit) * 100) : 0;
    const bar = this.progressBar(ratio);

    const cashback = (dealer as any).cashbackBalance ?? 0;
    const cashbackLine = cashback > 0 ? `\n🎁 Cashback: *${cashback.toLocaleString()} so'm*` : '';

    await ctx.reply(
      `💰 *${dealer.name}*\n\n` +
        `${t.debtTitle}: *${debt.toLocaleString()} so'm*\n` +
        `${t.limitTitle}: *${limit > 0 ? limit.toLocaleString() + " so'm" : 'Cheksiz'}*\n\n` +
        `${limit > 0 ? bar + ' ' + ratio + '%\n\n' : ''}` +
        `${debt > 0 && limit > 0 && debt > limit ? t.overLimit : limit > 0 ? t.withinLimit : ''}` +
        cashbackLine,
      { parse_mode: "Markdown" }
    );
  }

  private async handleProducts(ctx: Context, companyId: string) {
    const dealer = await this.getDealerByChatId(ctx, companyId);
    if (!dealer) return;

    const t = this.getLangFromCtx(ctx);
    const products = await this.prisma.product.findMany({
      where: { companyId, deletedAt: null, stock: { gt: 0 } },
      take: 20,
      orderBy: { name: "asc" },
    });

    if (products.length === 0) {
      return ctx.reply(t.noProducts);
    }

    // Send each product as a separate message with an inline "Add to cart" button
    await ctx.reply(t.productList, { parse_mode: "Markdown" });

    for (const p of products) {
      const effectivePrice = (p as any).discountPrice ?? p.price;
      const isPromo = (p as any).isPromo && (p as any).discountPrice;
      const priceStr = isPromo
        ? `~~${p.price.toLocaleString()}~~ → *${effectivePrice.toLocaleString()} so'm* 🔥`
        : `*${p.price.toLocaleString()} so'm*`;
      const msg =
        `${isPromo ? '🏷 *AKSIYA!* ' : ''}*${p.name}*\n` +
        `💵 ${priceStr} / ${p.unit}\n` +
        `📦 ${p.stock} ${p.unit} mavjud`;

      await ctx.reply(msg, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[
            { text: `${t.addToCart} (+1)`, callback_data: `add:${p.id}:1` },
            { text: "+5", callback_data: `add:${p.id}:5` },
            { text: "+10", callback_data: `add:${p.id}:10` },
          ]],
        },
      });
    }

    await ctx.reply(`/cart — ${t.cartTitle.replace(/\*/g, '')}`, { parse_mode: "Markdown" });
  }

  private async handleOrders(ctx: Context, companyId: string) {
    const dealer = await this.getDealerByChatId(ctx, companyId);
    if (!dealer) return;

    const t = this.getLangFromCtx(ctx);
    const orders = await this.prisma.order.findMany({
      where: { dealerId: dealer.id, companyId, deletedAt: null },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    if (orders.length === 0) {
      return ctx.reply(t.noOrders);
    }

    let msg = `${t.recentOrders}\n\n`;
    for (const order of orders) {
      const date = order.createdAt.toLocaleDateString("uz-UZ");
      const statusIcon = order.status === "DELIVERED" ? "✅" : order.status === "PENDING" ? "⏳" : "📦";

      msg += `${statusIcon} *#${order.id.slice(-6).toUpperCase()}*\n`;
      msg += `   📅 ${date} | 💰 ${order.totalAmount.toLocaleString()} so'm\n`;
      msg += `   📊 ${order.status}\n\n`;
    }

    await ctx.reply(msg, { parse_mode: "Markdown" });
  }

  private async handlePayments(ctx: Context, companyId: string) {
    const dealer = await this.getDealerByChatId(ctx, companyId);
    if (!dealer) return;

    const t = this.getLangFromCtx(ctx);
    const payments = await this.prisma.payment.findMany({
      where: { dealerId: dealer.id, companyId, deletedAt: null },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    if (payments.length === 0) {
      return ctx.reply(t.noPayments);
    }

    let msg = `${t.recentPayments}\n\n`;
    for (const p of payments) {
      const date = p.createdAt.toLocaleDateString("uz-UZ");
      msg += `🔹 *${p.amount.toLocaleString()} so'm*\n`;
      msg += `   📅 ${date} | 💳 ${p.method}\n\n`;
    }

    await ctx.reply(msg, { parse_mode: "Markdown" });
  }

  // ─── Cart helpers ─────────────────────────────────────────────────────────

  private getCart(companyId: string, chatId: string): Map<string, number> {
    if (!this.carts.has(companyId)) this.carts.set(companyId, new Map());
    const companyCart = this.carts.get(companyId)!;
    if (!companyCart.has(chatId)) companyCart.set(chatId, new Map());
    return companyCart.get(chatId)!;
  }

  private clearCart(companyId: string, chatId: string) {
    this.carts.get(companyId)?.get(chatId)?.clear();
  }

  private async handleCallback(ctx: Context, companyId: string) {
    const query = (ctx as any).callbackQuery;
    if (!query?.data) return;

    await (ctx as any).answerCbQuery();

    const data: string = query.data;
    const chatId = String(query.from.id);
    const t = this.getLangFromCtx(ctx);

    if (data.startsWith('add:')) {
      const [, productId, qtyStr] = data.split(':');
      const qty = parseInt(qtyStr, 10) || 1;

      const product = await this.prisma.product.findFirst({
        where: { id: productId, companyId, deletedAt: null },
      });
      if (!product) return;

      const cart = this.getCart(companyId, chatId);
      cart.set(productId, (cart.get(productId) || 0) + qty);

      const cartTotal = Array.from(cart.values()).reduce((s, q) => s + q, 0);
      await (ctx as any).reply(
        `${t.cartUpdated} *${product.name}* ×${cart.get(productId)}\n🛒 Savatda jami: ${cartTotal} ta mahsulot`,
        { parse_mode: "Markdown" }
      );
      return;
    }

    if (data.startsWith('remove:')) {
      const productId = data.split(':')[1];
      const cart = this.getCart(companyId, chatId);
      cart.delete(productId);
      await (ctx as any).reply(t.cartRemoved);
      return;
    }

    if (data === 'clear_cart') {
      this.clearCart(companyId, chatId);
      await (ctx as any).reply(t.cartCleared);
      return;
    }

    if (data === 'checkout') {
      await this.handleCheckoutByChat(ctx, companyId, chatId);
      return;
    }
  }

  private async handleCart(ctx: Context, companyId: string) {
    const dealer = await this.getDealerByChatId(ctx, companyId);
    if (!dealer) return;

    const chatId = String(ctx.chat!.id);
    const t = this.getLangFromCtx(ctx);
    const cart = this.getCart(companyId, chatId);

    if (cart.size === 0) {
      return ctx.reply(t.cartEmpty);
    }

    const productIds = Array.from(cart.keys());
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, companyId, deletedAt: null },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    let msg = `${t.cartTitle}\n\n`;
    let total = 0;
    const removeButtons: { text: string; callback_data: string }[] = [];

    for (const [productId, qty] of cart.entries()) {
      const p = productMap.get(productId);
      if (!p) { cart.delete(productId); continue; }
      const lineTotal = p.price * qty;
      total += lineTotal;
      msg += `• *${p.name}* × ${qty}\n`;
      msg += `  💵 ${lineTotal.toLocaleString()} so'm\n\n`;
      removeButtons.push({ text: `❌ ${p.name}`, callback_data: `remove:${productId}` });
    }

    msg += `${t.cartTotal} *${total.toLocaleString()} so'm*`;

    await ctx.reply(msg, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          ...removeButtons.map((btn) => [btn]),
          [
            { text: t.cartClear, callback_data: "clear_cart" },
            { text: t.cartCheckout, callback_data: "checkout" },
          ],
        ],
      },
    });
  }

  private async handleCheckout(ctx: Context, companyId: string) {
    const dealer = await this.getDealerByChatId(ctx, companyId);
    if (!dealer) return;
    await this.handleCheckoutByChat(ctx, companyId, String(ctx.chat!.id));
  }

  private async handleCheckoutByChat(ctx: Context, companyId: string, chatId: string) {
    const t = this.getLangFromCtx(ctx);
    const cart = this.getCart(companyId, chatId);

    if (cart.size === 0) {
      return (ctx as any).reply(t.checkoutEmpty);
    }

    const dealer = await this.prisma.dealer.findFirst({
      where: { telegramChatId: chatId, companyId, deletedAt: null },
    });
    if (!dealer) return (ctx as any).reply(t.startOver);

    // Check dealer approval and block status
    if (!dealer.isApproved) {
      return (ctx as any).reply('⛔ Siz hali distributor tomonidan tasdiqlanmagansiz. Menejer bilan bog\'laning.');
    }
    if (dealer.isBlocked) {
      return (ctx as any).reply('🚫 Hisobingiz bloklangan. Buyurtma berish mumkin emas. Menejer bilan bog\'laning.');
    }

    const productIds = Array.from(cart.keys());
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, companyId, deletedAt: null },
    });

    if (products.length === 0) {
      this.clearCart(companyId, chatId);
      return (ctx as any).reply(t.checkoutEmpty);
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    let totalAmount = 0;
    // Always include `name` field so orders render correctly in admin panel
    const orderItems: { productId: string; name: string; qty: number; unit: string; price: number; total: number }[] = [];

    for (const [productId, qty] of cart.entries()) {
      const p = productMap.get(productId);
      if (!p) continue;
      const lineTotal = p.price * qty;
      totalAmount += lineTotal;
      orderItems.push({ productId, name: p.name, qty, unit: p.unit || 'pcs', price: p.price, total: lineTotal });
    }

    // Check credit limit
    const newDebt = (dealer.currentDebt || 0) + totalAmount;
    if (dealer.creditLimit && newDebt > dealer.creditLimit) {
      return (ctx as any).reply(t.limitExceeded);
    }

    try {
      const order = await this.prisma.$transaction(async (tx) => {
        // Create order - items is a JSON field, pass array directly
        const created = await tx.order.create({
          data: {
            companyId,
            dealerId: dealer.id,
            branchId: dealer.branchId,
            totalAmount,
            totalCost: 0,
            status: 'PENDING',
            items: orderItems as any,
          },
        });

        // Deduct stock for each product
        for (const item of orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.qty } },
          });
        }

        // Update dealer current debt
        await tx.dealer.update({
          where: { id: dealer.id },
          data: { currentDebt: { increment: totalAmount } },
        });

        // Ledger entry - type ORDER is correct TxType
        await tx.ledgerTransaction.create({
          data: {
            companyId,
            dealerId: dealer.id,
            type: 'ORDER',
            amount: totalAmount,
            note: `Telegram buyurtma #${created.id.slice(-6).toUpperCase()}`,
          },
        });

        return created;
      });

      this.clearCart(companyId, chatId);

      // Cashback + log (fire and forget)
      this.prisma.company.findUnique({ where: { id: companyId }, select: { name: true, cashbackPercent: true } })
        .then(async (company) => {
          // Cashback
          const cashbackPct = (company as any)?.cashbackPercent ?? 0;
          if (cashbackPct > 0) {
            const earned = Math.floor(totalAmount * cashbackPct / 100);
            if (earned > 0) {
              await this.prisma.dealer.update({
                where: { id: dealer.id },
                data: { cashbackBalance: { increment: earned } },
              }).catch(() => {});
            }
          }
          // Logger
          this.loggerBot.sendOrderNotification({
            id: order.id,
            companyName: company?.name || companyId,
            dealerName: dealer.name,
            totalAmount,
            itemCount: orderItems.length,
          }).catch(() => {});
        })
        .catch(() => {});

      // Build invoice receipt
      const orderNum = order.id.slice(-6).toUpperCase();
      const itemLines = orderItems
        .map(item => `▪ ${item.name} — ${item.qty} ${item.unit} × ${item.price.toLocaleString()} = *${item.total.toLocaleString()} so'm*`)
        .join('\n');
      const newDebtAfter = (dealer.currentDebt || 0) + totalAmount;

      await (ctx as any).reply(
        `✅ *BUYURTMA QABUL QILINDI*\n` +
        `━━━━━━━━━━━━━━━\n` +
        `📋 Buyurtma: *#${orderNum}*\n` +
        `👤 Diler: ${dealer.name}\n` +
        `━━━━━━━━━━━━━━━\n` +
        `${itemLines}\n` +
        `━━━━━━━━━━━━━━━\n` +
        `💰 Jami: *${totalAmount.toLocaleString()} so'm*\n` +
        `📊 Holat: ⏳ Kutilmoqda\n` +
        `💳 Joriy qarz: *${newDebtAfter.toLocaleString()} so'm*\n` +
        `\n/orders orqali kuzatib boring.`,
        { parse_mode: "Markdown" }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Checkout failed for dealer ${dealer.id}: ${msg}`);
      await (ctx as any).reply(t.checkoutFail);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────

  async sendMessage(companyId: string, chatId: string, message: string) {
    const bot = this.bots.get(companyId);
    if (!bot) return;

    try {
      await bot.telegram.sendMessage(chatId, message, { parse_mode: "Markdown" });
    } catch (e) {
      this.logger.error(`Failed to send external message for ${companyId}: ${e.message}`);
    }
  }

  /** Broadcast a message to all dealers in a company that have a Telegram chatId */
  async broadcast(companyId: string, message: string): Promise<{ sent: number; failed: number }> {
    const bot = this.bots.get(companyId);
    if (!bot) return { sent: 0, failed: 0 };

    const dealers = await this.prisma.dealer.findMany({
      where: { companyId, deletedAt: null, telegramChatId: { not: null } },
      select: { telegramChatId: true },
    });

    let sent = 0;
    let failed = 0;
    for (const dealer of dealers) {
      if (!dealer.telegramChatId) continue;
      try {
        await bot.telegram.sendMessage(dealer.telegramChatId, message, { parse_mode: "Markdown" });
        sent++;
      } catch {
        failed++;
      }
    }
    return { sent, failed };
  }

  /** Send order status update notification to the dealer */
  async sendOrderStatusUpdate(companyId: string, orderId: string, newStatus: string, dealerId: string) {
    const bot = this.bots.get(companyId);
    if (!bot) return;

    const dealer = await this.prisma.dealer.findFirst({
      where: { id: dealerId, companyId },
      select: { telegramChatId: true, name: true },
    });
    if (!dealer?.telegramChatId) return;

    const statusEmoji: Record<string, string> = {
      PENDING: '⏳',
      ACCEPTED: '✅',
      PREPARING: '🔧',
      SHIPPED: '🚚',
      DELIVERED: '📦',
      COMPLETED: '✅',
      CANCELLED: '❌',
      RETURNED: '↩️',
    };

    const emoji = statusEmoji[newStatus] ?? '📋';
    const msg =
      `${emoji} *Buyurtma holati yangilandi*\n\n` +
      `📋 Buyurtma: *#${orderId.slice(-6).toUpperCase()}*\n` +
      `📊 Yangi holat: *${newStatus}*`;

    try {
      await bot.telegram.sendMessage(dealer.telegramChatId, msg, { parse_mode: "Markdown" });
    } catch (e) {
      this.logger.warn(`Could not notify dealer ${dealerId} of status update: ${e.message}`);
    }
  }

  private async handleHelp(ctx: Context, companyName: string) {
    const company = await this.prisma.company.findFirst({
      where: { name: companyName },
    });
    const t = this.getLangFromCtx(ctx);
    const isPremium = company?.subscriptionPlan === "PREMIUM";
    const watermark = isPremium ? "" : "\n\n⚡️ _Supplio.uz_";

    await ctx.reply(
      `ℹ️ *${companyName} Bot - ${t.helpTitle}*\n\n` + t.helpCommands + watermark,
      { parse_mode: "Markdown" }
    );
  }

  private async getDealerByChatId(ctx: Context, companyId: string) {
    const chatId = String(ctx.chat?.id);
    const dealer = await this.prisma.dealer.findFirst({
      where: { telegramChatId: chatId, companyId, deletedAt: null },
    });

    if (!dealer) {
      const t = this.getLangFromCtx(ctx);
      await ctx.reply(t.startOver);
      return null;
    }

    if (dealer.isBlocked) {
      await ctx.reply('🚫 Hisobingiz bloklangan. Menejer bilan bog\'laning.');
      return null;
    }

    return dealer;
  }

  private progressBar(percent: number): string {
    const filled = Math.min(Math.round(percent / 10), 10);
    const empty = 10 - filled;
    return "█".repeat(filled) + "░".repeat(empty);
  }

  getBot(companyId: string): Telegraf | undefined {
    return this.bots.get(companyId);
  }

  async validateToken(token: string): Promise<{ valid: boolean; botInfo?: { id: number; username: string; first_name: string } }> {
    try {
      const tempBot = new Telegram(token);
      const botInfo = await tempBot.getMe();
      return { 
        valid: true, 
        botInfo: { 
          id: botInfo.id, 
          username: botInfo.username || '', 
          first_name: botInfo.first_name 
        } 
      };
    } catch (err: any) {
      this.logger.warn(`Token validation failed for token ${token.slice(0, 5)}...: ${err.message}`);
      return { valid: false };
    }
  }

  getBotStatus(companyId: string): 'connected' | 'stopped' | 'not_found' {
    const bot = this.bots.get(companyId);
    if (!bot) return 'not_found';
    return 'connected';
  }

  async getBotsForCompany(companyId: string) {
    return this.prisma.customBot.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  async createBot(companyId: string, data: { token: string; botName?: string; description?: string }) {
    // Validate token before saving
    const validation = await this.validateToken(data.token);
    if (!validation.valid) {
      throw new BadRequestException('Invalid Telegram bot token. Please check the token from @BotFather.');
    }
    const username = validation.botInfo?.username;
    const resolvedName = data.botName || validation.botInfo?.first_name || 'Store Bot';

    try {
      this.logger.log(`Creating bot for company: ${companyId}`);
      const bot = await this.prisma.customBot.create({
        data: { 
          companyId, 
          token: data.token, 
          botName: resolvedName, 
          username, 
          description: data.description,
          isActive: true
        },
      });
      
      this.logger.log(`Bot record created in DB: ${bot.id}. Initializing instance...`);
      
      try {
        const company = await this.prisma.company.findUnique({ where: { id: companyId } });
        if (!company) {
          this.logger.error(`Company not found after creating bot record! ID: ${companyId}`);
        } else {
          await this.initBot(companyId, bot.token, company.name);
        }
      } catch (initErr: any) {
        this.logger.error(`Failed to execute initBot during creation: ${initErr.message}`);
        // We don't throw here, the record is already created. 
        // Admin can re-enable later if init failed.
      }
      
      return { ...bot, botInfo: validation.botInfo };
    } catch (e: any) {
      this.logger.error(`Error in createBot: ${e.message}`, e.stack);
      if (e.code === 'P2002') {
        throw new BadRequestException('This bot token is already registered to another company.');
      }
      if (e.code === 'P2003') {
        throw new BadRequestException('Foreign key constraint failed. Check if companyId is valid.');
      }
      throw e;
    }
  }

  async updateBot(id: string, companyId: string, data: { token?: string; botName?: string; description?: string; isActive?: boolean }) {
    const bot = await this.prisma.customBot.findFirst({ where: { id, companyId, deletedAt: null } });
    if (!bot) throw new Error("Bot not found");
    const updated = await this.prisma.customBot.update({ where: { id }, data });
    if (data.isActive === true || data.token) {
      const company = await this.prisma.company.findUnique({ where: { id: companyId } });
      await this.initBot(companyId, updated.token, company?.name ?? companyId);
    } else if (data.isActive === false) {
      const existing = this.bots.get(companyId);
      if (existing) { existing.stop("disabled"); this.bots.delete(companyId); }
    }
    return updated;
  }

  async removeBot(id: string, companyId: string) {
    const bot = await this.prisma.customBot.findFirst({ where: { id, companyId, deletedAt: null } });
    if (!bot) throw new Error("Bot not found");
    const existing = this.bots.get(companyId);
    if (existing) { existing.stop("deleted"); this.bots.delete(companyId); }
    return this.prisma.customBot.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async stopAll() {
    for (const [id, bot] of this.bots) {
      bot.stop("shutdown");
    }
    this.bots.clear();
  }
}
