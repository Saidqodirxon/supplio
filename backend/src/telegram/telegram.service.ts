import {
  Injectable,
  OnModuleInit,
  Logger,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { Telegraf, Context, Telegram } from "telegraf";
import { PrismaService } from "../prisma/prisma.service";
import { TelegramLoggerService } from "./telegram-logger.service";
import { PlanLimitsService } from "../common/services/plan-limits.service";

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bots: Map<string, Telegraf> = new Map(); // Key is botId (UUID)
  // carts[companyId][chatId][productId] = qty
  private carts: Map<string, Map<string, Map<string, number>>> = new Map();
  private chatLangPrefs: Map<string, string> = new Map();

  constructor(
    private prisma: PrismaService,
    private loggerBot: TelegramLoggerService,
    private planLimits: PlanLimitsService
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
      await this.initBot(bot.id, bot.companyId, bot.token, bot.company.name);
    }
  }

  private translations = {
    uz: {
      welcome:
        "Assalomu alaykum!\nBuyurtma berishni boshlash uchun telefon raqamingizni yuboring.",
      sendPhone: "📞 Telefon raqamimni yuborish",
      suspended:
        "⚠️ Ushbu bot xizmati vaqtinchalik to'xtatilgan. Iltimos, menejer bilan bog'laning.",
      notRegistered:
        "❌ Siz diler sifatida ro'yxatdan o'tmagansiz.\nIltimos, kompaniya menejeri bilan bog'laning.",
      loginSuccess: " botga ulandi.",
      pendingApproval:
        "⏳ Sizning so'rovingiz ko'rib chiqilmoqda. Distributor tasdiqlashini kuting.",
      approvalSent:
        "✅ Ro'yxatdan o'tish so'rovingiz distributorga yuborildi.\n⏳ Tasdiqlash kutilyapti. Xabar beriladi.",
      accessDenied:
        "⛔ Sizda bu botdan foydalanish huquqi yo'q.\nDistributor bilan bog'laning.",
      blocked: "🚫 Hisobingiz bloklangan. Menejer bilan bog'laning.",
      commands: "\n\n📋 Quyidagi tugmalar orqali ishlang.",
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
      startOver: "⚠️ Avval /start bosing va telefon raqamingizni yuboring.",
      helpTitle: "Yordam",
      helpCommands:
        "📋 Buyruqlar:\n\n💰 Qarzim — qarzni ko'rish\n💸 To'lovlarim — to'lovlar tarixi\n📦 Mahsulotlar — mahsulotlar ro'yxati\n📋 Buyurtmalarim — buyurtmalar tarixi\n🛒 Savat — savatni ko'rish\n\n📞 Muammo bo'lsa: kompaniya menejeriga murojaat qiling.",
      addToCart: "🛒 Savatga",
      cartEmpty:
        "🛒 Savat bo'sh.\nMahsulotlarni 📦 Mahsulotlar tugmasi orqali qo'shing.",
      cartTitle: "🛒 *Savatingiz:*",
      cartTotal: "💰 *Jami:*",
      cartCheckout: "✅ Buyurtma berish",
      cartClear: "🗑 Tozalash",
      cartCleared: "🗑 Savat tozalandi.",
      cartUpdated: "✅ Savatga qo'shildi!",
      cartRemoved: "❌ O'chirildi.",
      checkoutSuccess: "✅ Buyurtma qabul qilindi!\n\n*Buyurtma #",
      checkoutFail:
        "❌ Buyurtma berishda xatolik. Iltimos, qayta urinib ko'ring.",
      checkoutEmpty: "🛒 Savat bo'sh. Avval mahsulot tanlang.",
      limitExceeded: "⚠️ Kredit limiti yetarli emas! Avval qarzni to'lang.",
      kbdCart: "🛒 Savat",
    },
    oz: {
      welcome:
        "Ассалому алайкум! Ботга хуш келибсиз.\nИлтимос, телефон рақамингизни юборинг:",
      sendPhone: "📞 Телефон рақамни юбориш",
      suspended:
        "⚠️ Ушбу бот хизмати вақтинча тўхтатилган. Менежер билан боғланинг.",
      notRegistered:
        "❌ Сиз дилер сифатида рўйхатдан ўтмагансиз.\nКомпания менежери билан боғланинг.",
      loginSuccess: " муваффақиятли тизимга кирдингиз!",
      pendingApproval:
        "⏳ Сизнинг сўровингиз кўриб чиқилмоқда. Дистрибьютор тасдиқлашини кутинг.",
      approvalSent:
        "✅ Рўйхатдан ўтиш сўровингиз дистрибьюторга юборилди.\n⏳ Тасдиқлаш кутиляпти.",
      accessDenied:
        "⛔ Сизда бу ботдан фойдаланиш ҳуқуқи йўқ.\nДистрибьютор билан боғланинг.",
      blocked: "🚫 Ҳисобингиз блокланган. Менежер билан боғланинг.",
      commands: "\n\n📋 Асосий менюдан фойдаланинг.",
      kbdDebt: "💰 Қарзим",
      kbdPayments: "💸 Тўловларим",
      kbdProducts: "📦 Маҳсулотлар",
      kbdOrders: "📋 Буюртмаларим",
      kbdHelp: "ℹ️ Ёрдам",
      debtTitle: "Жорий қарз",
      limitTitle: "Кредит лимити",
      overLimit: "⚠️ Кредит лимитидан ошган!",
      withinLimit: "✅ Лимитда",
      noProducts: "📭 Ҳозирча маҳсулотлар мавжуд эмас.",
      productList: "📦 *Маҳсулотлар рўйхати:*",
      noOrders: "📭 Ҳали буюртмалар йўқ.",
      recentOrders: "📋 *Сўнгги буюртмалар:*",
      noPayments: "📭 Ҳали тўловлар йўқ.",
      recentPayments: "💸 *Охирги тўловлар:*",
      startOver: "⚠️ Аввал /start босинг ва телефон рақамингизни юборинг.",
      helpTitle: "Ёрдам",
      helpCommands:
        "📋 Буйруқлар:\n\n💰 Қарзим — қарзни кўриш\n💸 Тўловларим — тўловлар тарихи\n📦 Маҳсулотлар — маҳсулотлар рўйхати\n📋 Буюртмаларим — буюртмалар тарихи\n🛒 Сават — саватни кўриш\n\n📞 Муаммо бўлса: компания менежерига мурожаат қилинг.",
      addToCart: "🛒 Саватга",
      cartEmpty:
        "🛒 Сават бўш.\nМаҳсулотларни 📦 Маҳсулотлар тугмаси орқали қўшинг.",
      cartTitle: "🛒 *Савatingиз:*",
      cartTotal: "💰 *Жами:*",
      cartCheckout: "✅ Буюртма бериш",
      cartClear: "🗑 Тозалаш",
      cartCleared: "🗑 Сават тозаланди.",
      cartUpdated: "✅ Саватга қўшилди!",
      cartRemoved: "❌ Ўчирилди.",
      checkoutSuccess: "✅ Буюртма қабул қилинди!\n\n*Буюртма #",
      checkoutFail: "❌ Буюртма беришда хатолик. Қайта уриниб кўринг.",
      checkoutEmpty: "🛒 Сават бўш. Аввал маҳсулот танланг.",
      limitExceeded: "⚠️ Кредит лимити етарли эмас! Аввал қарзни тўланг.",
      kbdCart: "🛒 Сават",
    },
    ru: {
      welcome:
        "Здравствуйте!\nЧтобы начать оформление заказа, отправьте номер телефона.",
      sendPhone: "📞 Отправить мой номер",
      suspended: "⚠️ Сервис временно приостановлен. Свяжитесь с менеджером.",
      notRegistered:
        "❌ Вы не зарегистрированы как дилер. Свяжитесь с менеджером компании.",
      loginSuccess: " бот подключен.",
      pendingApproval:
        "⏳ Ваша заявка рассматривается. Ожидайте подтверждения от дистрибьютора.",
      approvalSent:
        "✅ Заявка на регистрацию отправлена дистрибьютору.\n⏳ Ожидайте подтверждения.",
      accessDenied:
        "⛔ У вас нет доступа к этому боту.\nСвяжитесь с дистрибьютором.",
      blocked: "🚫 Ваш аккаунт заблокирован. Свяжитесь с менеджером.",
      commands: "\n\n📋 Используйте кнопки ниже.",
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
      startOver: "⚠️ Сначала нажмите /start и отправьте ваш номер телефона.",
      helpTitle: "Помощь",
      helpCommands:
        "📋 Команды:\n\n💰 Мой долг — узнать долг\n💸 Платежи — история платежей\n📦 Продукты — список товаров\n📋 Заказы — история заказов\n🛒 Корзина — ваша корзина\n\n📞 Проблемы? Свяжитесь с менеджером.",
      addToCart: "🛒 В корзину",
      cartEmpty: "🛒 Корзина пуста.\nДобавьте товары через 📦 Продукты.",
      cartTitle: "🛒 *Ваша корзина:*",
      cartTotal: "💰 *Итого:*",
      cartCheckout: "✅ Оформить заказ",
      cartClear: "🗑 Очистить",
      cartCleared: "🗑 Корзина очищена.",
      cartUpdated: "✅ Добавлено в корзину!",
      cartRemoved: "❌ Удалено.",
      checkoutSuccess: "✅ Заказ принят!\n\n*Заказ #",
      checkoutFail: "❌ Ошибка при оформлении. Попробуйте ещё раз.",
      checkoutEmpty: "🛒 Корзина пуста. Сначала выберите товары.",
      limitExceeded:
        "⚠️ Недостаточно кредитного лимита! Сначала погасите долг.",
      kbdCart: "🛒 Корзина",
    },
    tr: {
      welcome: "Merhaba!\nSipariş vermek için telefon numaranızı gönderin.",
      sendPhone: "📞 Numaramı gönder",
      suspended:
        "⚠️ Bu bot geçici olarak askıya alınmıştır. Yöneticiyle iletişime geçin.",
      notRegistered:
        "❌ Bayi olarak kayıtlı değilsiniz.\nŞirket yöneticisiyle iletişime geçin.",
      loginSuccess: " bot bağlı.",
      pendingApproval:
        "⏳ Başvurunuz inceleniyor. Distribütörün onayını bekleyin.",
      approvalSent:
        "✅ Kayıt başvurunuz distribütöre gönderildi.\n⏳ Onay bekleniyor.",
      accessDenied:
        "⛔ Bu botu kullanma izniniz yok.\nDistribütörünüzle iletişime geçin.",
      blocked: "🚫 Hesabınız engellendi. Yöneticiyle iletişime geçin.",
      commands: "\n\n📋 Aşağıdaki düğmeleri kullanın.",
      kbdDebt: "💰 Borcum",
      kbdPayments: "💸 Ödemelerim",
      kbdProducts: "📦 Ürünler",
      kbdOrders: "📋 Siparişlerim",
      kbdHelp: "ℹ️ Yardım",
      debtTitle: "Mevcut borç",
      limitTitle: "Kredi limiti",
      overLimit: "⚠️ Limit aşıldı!",
      withinLimit: "✅ Limit dahilinde",
      noProducts: "📭 Henüz ürün yok.",
      productList: "📦 *Ürün listesi:*",
      noOrders: "📭 Henüz sipariş yok.",
      recentOrders: "📋 *Son siparişler:*",
      noPayments: "📭 Henüz ödeme yok.",
      recentPayments: "💸 *Son ödemeler:*",
      startOver: "⚠️ Önce /start'a basın ve telefon numaranızı gönderin.",
      helpTitle: "Yardım",
      helpCommands:
        "📋 Komutlar:\n\n💰 Borcum — borç görüntüle\n💸 Ödemelerim — ödeme geçmişi\n📦 Ürünler — ürün listesi\n📋 Siparişlerim — sipariş geçmişi\n🛒 Sepet — sepetiniz\n\n📞 Sorun mu var? Yöneticiyle iletişime geçin.",
      addToCart: "🛒 Sepete ekle",
      cartEmpty: "🛒 Sepet boş.\n📦 Ürünler butonundan ürün ekleyin.",
      cartTitle: "🛒 *Sepetiniz:*",
      cartTotal: "💰 *Toplam:*",
      cartCheckout: "✅ Sipariş ver",
      cartClear: "🗑 Temizle",
      cartCleared: "🗑 Sepet temizlendi.",
      cartUpdated: "✅ Sepete eklendi!",
      cartRemoved: "❌ Kaldırıldı.",
      checkoutSuccess: "✅ Sipariş alındı!\n\n*Sipariş #",
      checkoutFail: "❌ Sipariş hatası. Lütfen tekrar deneyin.",
      checkoutEmpty: "🛒 Sepet boş. Önce ürün seçin.",
      limitExceeded: "⚠️ Kredi limiti yetersiz! Önce borcunuzu ödeyin.",
      kbdCart: "🛒 Sepet",
    },
    en: {
      welcome: "Hello!\nTo start ordering, please share your phone number.",
      sendPhone: "📞 Share my number",
      suspended:
        "⚠️ This bot is temporarily suspended. Please contact the manager.",
      notRegistered:
        "❌ You are not registered as a dealer.\nPlease contact the company manager.",
      loginSuccess: " bot connected.",
      pendingApproval:
        "⏳ Your request is under review. Please wait for the distributor's approval.",
      approvalSent:
        "✅ Your registration request has been sent to the distributor.\n⏳ Awaiting approval.",
      accessDenied:
        "⛔ You don't have permission to use this bot.\nContact your distributor.",
      blocked: "🚫 Your account is blocked. Please contact the manager.",
      commands: "\n\n📋 Use the buttons below.",
      kbdDebt: "💰 My Debt",
      kbdPayments: "💸 Payments",
      kbdProducts: "📦 Products",
      kbdOrders: "📋 Orders",
      kbdHelp: "ℹ️ Help",
      debtTitle: "Current debt",
      limitTitle: "Credit limit",
      overLimit: "⚠️ Credit limit exceeded!",
      withinLimit: "✅ Within limit",
      noProducts: "📭 No products available yet.",
      productList: "📦 *Product list:*",
      noOrders: "📭 No orders yet.",
      recentOrders: "📋 *Recent orders:*",
      noPayments: "📭 No payments yet.",
      recentPayments: "💸 *Recent payments:*",
      startOver: "⚠️ Press /start first and send your phone number.",
      helpTitle: "Help",
      helpCommands:
        "📋 Commands:\n\n💰 My Debt — view debt\n💸 Payments — payment history\n📦 Products — product list\n📋 Orders — order history\n🛒 Cart — view cart\n\n📞 Need help? Contact the company manager.",
      addToCart: "🛒 Add to cart",
      cartEmpty: "🛒 Cart is empty.\nAdd products via 📦 Products.",
      cartTitle: "🛒 *Your cart:*",
      cartTotal: "💰 *Total:*",
      cartCheckout: "✅ Place order",
      cartClear: "🗑 Clear",
      cartCleared: "🗑 Cart cleared.",
      cartUpdated: "✅ Added to cart!",
      cartRemoved: "❌ Removed.",
      checkoutSuccess: "✅ Order placed!\n\n*Order #",
      checkoutFail: "❌ Order failed. Please try again.",
      checkoutEmpty: "🛒 Cart is empty. Please select products first.",
      limitExceeded:
        "⚠️ Insufficient credit limit! Please pay your debt first.",
      kbdCart: "🛒 Cart",
    },
  };

  private getT(lang: string = "uz") {
    return this.translations[lang] ?? this.translations["uz"];
  }

  private getPublicStoreBaseUrl() {
    return (
      process.env.PUBLIC_STORE_URL ||
      process.env.LANDING_URL ||
      process.env.APP_URL ||
      process.env.PUBLIC_SITE_URL ||
      process.env.FRONTEND_URL ||
      "https://supplio.uz"
    ).replace(/\/+$/, "");
  }

  private isCompanyAccessBlocked(
    company: {
      subscriptionStatus?: string | null;
      trialExpiresAt?: Date | null;
    } | null
  ) {
    if (!company) return true;
    if (company.subscriptionStatus === "LOCKED") return true;
    if (
      company.trialExpiresAt &&
      ["TRIAL", "ACTIVE"].includes(String(company.subscriptionStatus || "")) &&
      new Date() > new Date(company.trialExpiresAt)
    ) {
      return true;
    }
    return false;
  }

  public async sendToAdmins(companyId: string, message: string) {
    try {
      const admins = await this.prisma.user.findMany({
        where: {
          companyId,
          roleType: { in: ["OWNER", "MANAGER"] },
          deletedAt: null,
        },
      });
      if (admins.length === 0) return;
      const adminPhones = admins.map((a) => `${a.phone.slice(-9)}`);

      const adminDealers = await this.prisma.dealer.findMany({
        where: { companyId, telegramChatId: { not: null } },
      });
      // Filter manually to catch endsWith/contains match
      const targetDealers = adminDealers.filter((d) =>
        adminPhones.some((p) => d.phone.includes(p))
      );

      const botRecord = await this.prisma.customBot.findFirst({
        where: { companyId, isActive: true },
      });
      if (!botRecord) return;
      const bot = this.bots.get(botRecord.id);
      if (!bot) return;

      for (const dealer of targetDealers) {
        if (dealer.telegramChatId) {
          bot.telegram
            .sendMessage(dealer.telegramChatId, message, {
              parse_mode: "Markdown",
            })
            .catch(() => {});
        }
      }
    } catch (e) {
      this.logger.error("Failed to send to Company Admins: " + e);
    }
  }

  /** Detect language from Telegram ctx.from.language_code and return translations */
  private getLangFromCtx(ctx: Context) {
    const chatId = String(ctx.chat?.id ?? (ctx.from as any)?.id ?? "");
    const preferred = chatId ? this.chatLangPrefs.get(chatId) : undefined;
    if (preferred && this.translations[preferred]) {
      return this.translations[preferred];
    }

    const code = (ctx.from as any)?.language_code ?? "uz";
    let lang = "uz";
    if (code.startsWith("ru")) lang = "ru";
    else if (code.startsWith("tr")) lang = "tr";
    else if (code.startsWith("en")) lang = "en";
    return this.translations[lang] ?? this.translations["uz"];
  }

  private buildLanguageKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: "🇺🇿 O'zbek", callback_data: "lang:set:uz" },
          { text: "🇷🇺 Русский", callback_data: "lang:set:ru" },
        ],
        [
          { text: "🇹🇷 Türkçe", callback_data: "lang:set:tr" },
          { text: "🇬🇧 English", callback_data: "lang:set:en" },
        ],
      ],
    };
  }

  /** Build main menu keyboard for a given translation */
  /** Build main menu inline keyboard */
  private buildMainMenuKeyboard(t: ReturnType<typeof this.getLangFromCtx>) {
    return {
      inline_keyboard: [
        [
          {
            text: t.kbdProducts || "📦 Mahsulotlar",
            callback_data: "menu:products",
          },
          { text: t.kbdCart || "🛒 Savat", callback_data: "menu:cart" },
        ],
        [
          {
            text: t.kbdOrders || "📋 Buyurtmalar",
            callback_data: "menu:orders",
          },
          { text: t.kbdDebt || "💰 Qarzim", callback_data: "menu:debt" },
        ],
        [
          {
            text: t.kbdPayments || "💸 To'lovlar",
            callback_data: "menu:payments",
          },
          { text: "⚙️ Til / Язык", callback_data: "menu:lang" },
        ],
      ],
    };
  }

  private buildAdminMenuKeyboard() {
    return {
      inline_keyboard: [
        [
          {
            text: "📊 Do'kon Holati (On/Off)",
            callback_data: "admin:toggle_store",
          },
        ],
        [
          {
            text: "🌐 Web Do'kon (QR & URL)",
            callback_data: "admin:store_link",
          },
        ],
        [
          {
            text: "👥 Yangi dilerlar (Tasdiqlash)",
            callback_data: "admin:dealers",
          },
        ],
      ],
    };
  }

  private isWithinWorkingHours(
    workingHoursJson: string | null | undefined,
    botPaused: boolean | null | undefined,
    botAutoSchedule: boolean | null | undefined
  ): boolean {
    if (botPaused) return false;
    if (!botAutoSchedule || !workingHoursJson) return true;
    try {
      const schedule = JSON.parse(workingHoursJson);
      // Use Tashkent UTC+5 offset
      const tzDate = new Date(Date.now() + 5 * 60 * 60 * 1000);
      const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      const dayKey = days[tzDate.getUTCDay()];
      const day = schedule[dayKey];
      if (!day || !day.active) return false;
      const h = tzDate.getUTCHours().toString().padStart(2, "0");
      const m = tzDate.getUTCMinutes().toString().padStart(2, "0");
      const now = `${h}:${m}`;
      return now >= day.open && now < day.close;
    } catch {
      return true;
    }
  }

  private buildWorkingHoursText(
    workingHoursJson: string | null | undefined,
    lang: string
  ): string {
    if (!workingHoursJson) return "";
    try {
      const schedule = JSON.parse(workingHoursJson);
      const days = [
        { key: "mon", uz: "Dushanba", ru: "Понедельник", en: "Monday" },
        { key: "tue", uz: "Seshanba", ru: "Вторник", en: "Tuesday" },
        { key: "wed", uz: "Chorshanba", ru: "Среда", en: "Wednesday" },
        { key: "thu", uz: "Payshanba", ru: "Четверг", en: "Thursday" },
        { key: "fri", uz: "Juma", ru: "Пятница", en: "Friday" },
        { key: "sat", uz: "Shanba", ru: "Суббота", en: "Saturday" },
        { key: "sun", uz: "Yakshanba", ru: "Воскресенье", en: "Sunday" },
      ];
      const off =
        lang === "ru" ? "Выходной" : lang === "en" ? "Closed" : "Dam olish";
      return days
        .map((d) => {
          const day = schedule[d.key];
          if (!day) return null;
          const label = lang === "ru" ? d.ru : lang === "en" ? d.en : d.uz;
          return day.active
            ? `${label}: ${day.open} – ${day.close}`
            : `${label}: ${off}`;
        })
        .filter(Boolean)
        .join("\n");
    } catch {
      return workingHoursJson;
    }
  }

  private buildClosedMessage(company: any, lang: string): string {
    const title =
      lang === "ru"
        ? "🔒 *Магазин временно закрыт*"
        : lang === "en"
          ? "🔒 *Store is temporarily closed*"
          : "🔒 *Do'kon vaqtincha yopiq*";
    let msg = title;
    const hoursText = this.buildWorkingHoursText(company?.workingHours, lang);
    if (hoursText) {
      const label =
        lang === "ru"
          ? "🕐 *Ish vaqti:*"
          : lang === "en"
            ? "🕐 *Working hours:*"
            : "🕐 *Ish vaqti:*";
      msg += "\n\n" + label + "\n" + hoursText;
    }
    if (company?.contactPhone) {
      msg +=
        "\n\n" +
        (lang === "ru"
          ? "📞 Telefon: "
          : lang === "en"
            ? "📞 Phone: "
            : "📞 Telefon: ") +
        company.contactPhone;
    }
    if (company?.contactAddress) {
      msg +=
        "\n" +
        (lang === "ru"
          ? "📍 Адрес: "
          : lang === "en"
            ? "📍 Address: "
            : "📍 Manzil: ") +
        company.contactAddress;
    }
    return msg;
  }

  async initBot(
    botId: string,
    companyId: string,
    token: string,
    companyName: string
  ) {
    try {
      const existing = this.bots.get(botId);
      if (existing) {
        try {
          existing.stop();
        } catch {}
        this.bots.delete(botId);
      }

      const bot = new Telegraf(token);

      // Working-hours / bot-pause middleware
      // Admins (system users) always pass through.
      // Skip for /start, /info and language selection so dealers can always see info.
      bot.use(async (ctx, next) => {
        const text: string = (ctx as any).message?.text ?? "";
        const callbackData: string = (ctx as any).callbackQuery?.data ?? "";
        if (
          text.startsWith("/start") ||
          text.startsWith("/info") ||
          callbackData.startsWith("lang:") ||
          callbackData.startsWith("admin:")
        ) {
          return next();
        }

        const company = await this.prisma.company.findUnique({
          where: { id: companyId },
        });
        if (
          this.isWithinWorkingHours(
            company?.workingHours,
            (company as any)?.botPaused,
            (company as any)?.botAutoSchedule
          )
        ) {
          return next();
        }

        // Check if this chat belongs to an admin user — let them through
        const chatId = String(ctx.chat?.id ?? "");
        const adminDealer = await this.prisma.dealer.findFirst({
          where: {
            telegramChatId: chatId,
            companyId,
            isApproved: true,
            deletedAt: null,
          },
        });
        if (adminDealer) {
          const isAdmin = await this.prisma.user.findFirst({
            where: {
              phone: {
                contains: adminDealer.phone.replace(/^\+/, "").slice(-9),
              },
              companyId,
              deletedAt: null,
            },
          });
          if (isAdmin) return next();
        }

        const lang = this.chatLangPrefs.get(chatId) ?? "uz";
        return (ctx as any).reply?.(this.buildClosedMessage(company, lang), {
          parse_mode: "Markdown",
        });
      });

      bot.start(async (ctx) => {
        const company = await this.prisma.company.findUnique({
          where: { id: companyId },
        });
        const chatId = String(ctx.chat.id);

        if (!this.chatLangPrefs.has(chatId)) {
          await ctx.reply("Tilni tanlang / Выберите язык / Choose language", {
            reply_markup: this.buildLanguageKeyboard(),
          });
          return;
        }

        const t = this.getLangFromCtx(ctx);

        if (this.isCompanyAccessBlocked(company)) {
          return ctx.reply(t.suspended);
        }

        const existingDealer = await this.prisma.dealer.findFirst({
          where: { telegramChatId: chatId, companyId, deletedAt: null },
        });

        if (existingDealer) {
          if (existingDealer.isBlocked) return ctx.reply(t.blocked);

          if (!existingDealer.isApproved) {
            const pending = await (
              this.prisma as any
            ).dealerApprovalRequest.findFirst({
              where: { dealerId: existingDealer.id, status: "PENDING" },
            });
            return ctx.reply(pending ? t.pendingApproval : t.accessDenied);
          }

          const limits = await this.planLimits.getLimitsForCompany(companyId);
          const storeUrl = `${this.getPublicStoreBaseUrl()}/store/${company?.slug || companyId}`;
          await ctx.reply(
            `👋 *${existingDealer.name}*${t.loginSuccess}${t.commands}`,
            {
              parse_mode: "Markdown",
              reply_markup: this.buildMainMenuKeyboard(t),
            }
          );
          if (limits.allowWebStore) {
            await ctx.reply(`🛍 ${companyName}`, {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🛍 Online do'kon", web_app: { url: storeUrl } }],
                ],
              },
            });
          }
          return;
        }

        await ctx.reply(`🏢 *${companyName}*\n\n${t.welcome}`, {
          parse_mode: "Markdown",
          reply_markup: {
            keyboard: [[{ text: t.sendPhone, request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
      });

      bot.on("contact", async (ctx) => {
        const contact = ctx.message.contact;
        let phone = contact.phone_number.replace("+", "");
        if (!phone.startsWith("998")) phone = "998" + phone;

        const t = this.getLangFromCtx(ctx);
        const chatId = String(ctx.chat.id);

        // Company-scoped lookup: one phone can exist in different companies.
        const dealerMatch = await this.prisma.dealer.findFirst({
          where: {
            companyId,
            phone: { endsWith: phone.slice(-9) },
            deletedAt: null,
          },
        });

        const userMatch = await this.prisma.user.findFirst({
          where: {
            phone: { contains: phone.slice(-9) },
            companyId,
            deletedAt: null,
          },
        });

        let dealer = dealerMatch;

        if (!dealer && userMatch) {
          // Auto-create pseudo-dealer for the Admin to allow bot interaction
          const branchId =
            userMatch.branchId ||
            (await this.prisma.branch.findFirst({ where: { companyId } }))
              ?.id ||
            "";
          try {
            dealer = await this.prisma.dealer.create({
              data: {
                companyId,
                branchId,
                name: userMatch.fullName || "Admin",
                phone: `+${phone}`,
                isApproved: true,
                telegramChatId: chatId,
              },
            });
          } catch (err: any) {
            if (err?.code === "P2002") {
              const existing = await this.prisma.dealer.findFirst({
                where: { phone: { contains: phone.slice(-9) }, companyId },
              });
              if (existing?.deletedAt) {
                dealer = await this.prisma.dealer.update({
                  where: { id: existing.id },
                  data: {
                    deletedAt: null,
                    isApproved: true,
                    telegramChatId: chatId,
                  },
                });
              } else {
                dealer = existing;
              }
            } else {
              throw err;
            }
          }
        }

        if (!dealer) {
          const branch = await this.prisma.branch.findFirst({
            where: { companyId, deletedAt: null },
            orderBy: { createdAt: "asc" },
          });

          if (!branch?.id) {
            return ctx.reply(
              "Filial topilmadi. Distributor bilan bog'laning.",
              {
                reply_markup: { remove_keyboard: true },
              }
            );
          }

          const suggestedName =
            `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
            `Dealer ${phone.slice(-4)}`;

          try {
            dealer = await this.prisma.dealer.create({
              data: {
                companyId,
                branchId: branch.id,
                name: suggestedName,
                phone: `+${phone}`,
                telegramChatId: chatId,
                isApproved: false,
              },
            });
          } catch (err: any) {
            if (err?.code === "P2002") {
              const existing = await this.prisma.dealer.findFirst({
                where: { phone: { contains: phone.slice(-9) }, companyId },
              });
              if (existing?.deletedAt) {
                dealer = await this.prisma.dealer.update({
                  where: { id: existing.id },
                  data: {
                    deletedAt: null,
                    isApproved: false,
                    telegramChatId: chatId,
                  },
                });
              } else {
                dealer = existing;
              }
            } else {
              throw err;
            }
          }
        }

        // Link chatId to dealer
        await this.prisma.dealer.update({
          where: { id: dealer.id },
          data: { telegramChatId: chatId },
        });

        if (dealer.isBlocked)
          return ctx.reply(t.blocked, {
            reply_markup: { remove_keyboard: true },
          });

        if (!dealer.isApproved) {
          // Avoid duplicate requests
          const existing = await (
            this.prisma as any
          ).dealerApprovalRequest.findFirst({
            where: { dealerId: dealer.id, status: "PENDING" },
          });
          if (!existing) {
            await (this.prisma as any).dealerApprovalRequest.create({
              data: {
                companyId,
                dealerId: dealer.id,
                status: "PENDING",
                requestedAt: new Date(),
              },
            });
            const compInfo = await this.prisma.company.findUnique({
              where: { id: companyId },
            });
            const companyNameLabel = (compInfo as any)?.name || "Kompaniya";

            this.loggerBot
              .sendDealerApprovalRequest({
                name: dealer.name,
                phone: dealer.phone,
                companyName: companyNameLabel,
              })
              .catch(() => {});

            // Notify Distributor Admins
            this.sendToAdmins(
              companyId,
              `🔔 *Yangi diler ro'yxatdan o'tdi!*\n\nIsmi: ${dealer.name}\nTel: ${dealer.phone}\n\nIltimos, bot menyusidan xabardor qiling yoki Admin paneldan tasdiqlang.`
            ).catch(() => {});
          }
          return ctx.reply(`👤 *${dealer.name}*\n\n${t.approvalSent}`, {
            parse_mode: "Markdown",
          });
        }

        const company = await this.prisma.company.findUnique({
          where: { id: companyId },
        });
        if (this.isCompanyAccessBlocked(company)) {
          return ctx.reply(t.suspended, {
            reply_markup: { remove_keyboard: true },
          });
        }
        const limits = await this.planLimits.getLimitsForCompany(companyId);
        const storeUrl = `${this.getPublicStoreBaseUrl()}/store/${company?.slug || companyId}`;

        // Set MenuButton WebApp
        if (limits.allowWebStore) {
          try {
            // @ts-ignore - Telegraf library type versioning can be tricky.
            await bot.telegram.setChatMenuButton({
              chatId: ctx.chat.id,
              menuButton: {
                type: "web_app",
                text: "🌐 Web Do'kon",
                web_app: { url: storeUrl },
              },
            });
          } catch (e) {}
        }

        await ctx.reply(
          `✅ *${dealer.name}*${t.loginSuccess}\n\nQuyidagi tugmalardan foydalaning:`,
          {
            parse_mode: "Markdown",
            reply_markup: { remove_keyboard: true },
          }
        );

        // Show Dealer Menu
        await ctx.reply(`🛍 *${companyName}* - Bosh menyu`, {
          parse_mode: "Markdown",
          reply_markup: this.buildMainMenuKeyboard(t),
        });

        // Show Admin Menu if User
        if (
          userMatch &&
          (userMatch.roleType === "OWNER" || userMatch.roleType === "MANAGER")
        ) {
          await ctx.reply(
            `👨‍💼 *Admin Panel*\nSiz tizim boshqaruvchisi sifatida tanildingiz:`,
            {
              parse_mode: "Markdown",
              reply_markup: this.buildAdminMenuKeyboard(),
            }
          );
        }
      });

      bot.command("debt", async (ctx) => await this.handleDebt(ctx, companyId));
      bot.command(
        "products",
        async (ctx) => await this.handleProducts(ctx, companyId)
      );
      bot.command(
        "payments",
        async (ctx) => await this.handlePayments(ctx, companyId)
      );
      bot.command(
        "orders",
        async (ctx) => await this.handleOrders(ctx, companyId)
      );
      bot.command("cart", async (ctx) => await this.handleCart(ctx, companyId));
      bot.command(
        "checkout",
        async (ctx) => await this.handleCheckout(ctx, companyId)
      );

      bot.command("info", async (ctx) => {
        const lang = this.chatLangPrefs.get(String(ctx.chat.id)) ?? "uz";
        const company = await this.prisma.company.findUnique({
          where: { id: companyId },
        });
        const open = this.isWithinWorkingHours(
          company?.workingHours,
          (company as any)?.botPaused,
          (company as any)?.botAutoSchedule
        );
        const statusLine = open
          ? lang === "ru"
            ? "🟢 Сейчас открыто"
            : lang === "en"
              ? "🟢 Now open"
              : "🟢 Hozir ochiq"
          : lang === "ru"
            ? "🔴 Сейчас закрыто"
            : lang === "en"
              ? "🔴 Currently closed"
              : "🔴 Hozir yopiq";

        let msg = `🏢 *${companyName}*\n${statusLine}`;
        const hoursText = this.buildWorkingHoursText(
          company?.workingHours,
          lang
        );
        if (hoursText) {
          const label =
            lang === "ru"
              ? "🕐 *Часы работы:*"
              : lang === "en"
                ? "🕐 *Working hours:*"
                : "🕐 *Ish vaqti:*";
          msg += "\n\n" + label + "\n" + hoursText;
        }
        if ((company as any)?.contactPhone) {
          msg +=
            "\n\n" +
            (lang === "ru"
              ? "📞 Telefon: "
              : lang === "en"
                ? "📞 Phone: "
                : "📞 Telefon: ") +
            (company as any).contactPhone;
        }
        if ((company as any)?.contactAddress) {
          msg +=
            "\n" +
            (lang === "ru"
              ? "📍 Адрес: "
              : lang === "en"
                ? "📍 Address: "
                : "📍 Manzil: ") +
            (company as any).contactAddress;
        }
        return ctx.reply(msg, { parse_mode: "Markdown" });
      });

      // /chatid — works in groups so admins can find the group chat ID
      bot.command("chatid", async (ctx) => {
        const id = String(ctx.chat.id);
        const type = ctx.chat.type;
        await ctx.reply(
          `🆔 *Chat ID:* \`${id}\`\n📌 Tur: ${type}\n\nBu ID ni bot sozlamalarida "Guruh Chat ID" maydoniga kiriting.`,
          { parse_mode: "Markdown" }
        );
      });

      bot.command("help", async (ctx) => {
        const t = this.getLangFromCtx(ctx);
        ctx.reply(`Bosh menyuni ko'rish uchun quyidagi tugmani bosing:`, {
          reply_markup: this.buildMainMenuKeyboard(t),
        });
      });
      bot.command("menu", async (ctx) => {
        const t = this.getLangFromCtx(ctx);
        const chatId = String(ctx.chat.id);
        const dealer = await this.prisma.dealer.findFirst({
          where: {
            telegramChatId: chatId,
            companyId,
            deletedAt: null,
            isApproved: true,
            isBlocked: false,
          },
        });
        if (!dealer) {
          return ctx.reply(t.startOver);
        }
        await ctx.reply(`🛍 *${companyName}* - Bosh menyu`, {
          parse_mode: "Markdown",
          reply_markup: this.buildMainMenuKeyboard(t),
        });
      });

      bot.on(
        "callback_query",
        async (ctx) => await this.handleCallback(ctx, companyId)
      );

      // Set global default menu button to the web store for all users
      try {
        const [company, limits] = await Promise.all([
          this.prisma.company.findUnique({ where: { id: companyId } }),
          this.planLimits.getLimitsForCompany(companyId),
        ]);
        if (limits.allowWebStore) {
          const storeUrl = `${this.getPublicStoreBaseUrl()}/store/${company?.slug || companyId}`;
          await bot.telegram.setChatMenuButton({
            menuButton: {
              type: "web_app",
              text: "🛍 Web Do'kon",
              web_app: { url: storeUrl },
            },
          } as any);
          this.logger.log(
            `✅ Global menu button set for ${companyName}: ${storeUrl}`
          );
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        this.logger.warn(
          `⚠️ Could not set global menu button for ${companyName}: ${msg}`
        );
      }

      if (
        process.env.NODE_ENV === "production" &&
        (process.env.BOT_WEBHOOK_URL || process.env.APP_URL)
      ) {
        const baseUrl =
          process.env.BOT_WEBHOOK_URL || process.env.APP_URL + "/webhook";
        // Use botId for the webhook to support multiple bots
        const webhookUrl = baseUrl.endsWith("/")
          ? `${baseUrl}${botId}`
          : `${baseUrl}/${botId}`;
        await bot.telegram.setWebhook(webhookUrl);
        this.logger.log(
          `✅ Webhook set for ${companyName} (Bot: ${botId}): ${webhookUrl}`
        );
      } else {
        bot
          .launch()
          .catch((e) =>
            this.logger.warn(
              `Polling launch failed for ${companyName}: ${e.message}`
            )
          );
        this.logger.log(`✅ Bot launched (polling) for ${companyName}`);
      }

      this.bots.set(botId, bot);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      this.logger.error(`❌ Bot init failed for ${botId}: ${message}`);
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
    const cashbackLine =
      cashback > 0 ? `\n🎁 Cashback: *${cashback.toLocaleString()} so'm*` : "";

    await ctx.reply(
      `💰 *${dealer.name}*\n\n` +
        `${t.debtTitle}: *${debt.toLocaleString()} so'm*\n` +
        `${t.limitTitle}: *${limit > 0 ? limit.toLocaleString() + " so'm" : "Cheksiz"}*\n\n` +
        `${limit > 0 ? bar + " " + ratio + "%\n\n" : ""}` +
        `${debt > 0 && limit > 0 && debt > limit ? t.overLimit : limit > 0 ? t.withinLimit : ""}` +
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

    await ctx.reply(t.productList, { parse_mode: "Markdown" });

    const backendUrl = (
      process.env.APP_URL ||
      process.env.FRONTEND_URL ||
      "http://localhost:5000"
    ).replace(/\/$/, "");

    for (const p of products) {
      const effectivePrice = (p as any).discountPrice ?? p.price;
      const isPromo = (p as any).isPromo && (p as any).discountPrice;
      const priceStr = isPromo
        ? `~~${p.price.toLocaleString()}~~ → *${effectivePrice.toLocaleString()} so'm* 🔥`
        : `*${p.price.toLocaleString()} so'm*`;
      const caption =
        `${isPromo ? "🏷 *AKSIYA!* " : ""}*${p.name}*\n` +
        `💵 ${priceStr} / ${p.unit}\n` +
        `📦 ${p.stock} ${p.unit}`;

      const buttons = [
        [
          { text: `${t.addToCart} (+1)`, callback_data: `add:${p.id}:1` },
          { text: "+5", callback_data: `add:${p.id}:5` },
          { text: "+10", callback_data: `add:${p.id}:10` },
        ],
      ];

      if (p.imageUrl) {
        const photoUrl = p.imageUrl.startsWith("http")
          ? p.imageUrl
          : `${backendUrl}${p.imageUrl}`;
        try {
          await (ctx as any).replyWithPhoto(photoUrl, {
            caption,
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: buttons },
          });
          continue;
        } catch {
          // fallback to text if photo fails
        }
      }

      await ctx.reply(caption, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: buttons },
      });
    }

    await ctx.reply(`🛒 ${t.cartTitle.replace(/\*/g, "")}`, {
      parse_mode: "Markdown",
    });
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
      const statusIcon =
        order.status === "DELIVERED"
          ? "✅"
          : order.status === "PENDING"
            ? "⏳"
            : "📦";

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

    if (data.startsWith("lang:set:")) {
      const lang = data.split(":")[2] || "uz";
      const allowed = ["uz", "ru", "tr", "en"];
      const safeLang = allowed.includes(lang) ? lang : "uz";
      this.chatLangPrefs.set(chatId, safeLang);

      await (ctx as any).reply(
        "✅ Til saqlandi. Davom etish uchun /start bosing."
      );
      return;
    }

    if (data.startsWith("menu:")) {
      const action = data.split(":")[1];
      if (action === "products") await this.handleProducts(ctx, companyId);
      if (action === "cart") await this.handleCart(ctx, companyId);
      if (action === "orders") await this.handleOrders(ctx, companyId);
      if (action === "debt") await this.handleDebt(ctx, companyId);
      if (action === "payments") await this.handlePayments(ctx, companyId);
      if (action === "lang") {
        await (ctx as any).reply(
          "Tilni tanlang / Выберите язык / Choose language",
          {
            reply_markup: this.buildLanguageKeyboard(),
          }
        );
      }
      if (action === "help") {
        const companyName =
          (
            await this.prisma.company.findUnique({
              where: { id: companyId },
              select: { name: true },
            })
          )?.name || "Company";
        await this.handleHelp(ctx, companyName);
      }
      return;
    }

    if (data.startsWith("admin:")) {
      const action = data.split(":")[1];
      if (action === "toggle_store") {
        const company = await this.prisma.company.findUnique({
          where: { id: companyId },
        });
        if (company) {
          await this.prisma.company.update({
            where: { id: companyId },
            data: { siteActive: !company.siteActive },
          });
          await (ctx as any).reply(
            `📊 Do'kon hozir: ${!company.siteActive ? "✅ ONLINE (Faol)" : "❌ OFFLINE (Yopiq)"}`
          );
        }
      }
      if (action === "store_link") {
        const limits = await this.planLimits.getLimitsForCompany(companyId);
        if (!limits.allowWebStore) {
          await (ctx as any).reply(
            "⚠️ Joriy tarifda Web do'kon funksiyasi mavjud emas."
          );
          return;
        }
        const company = await this.prisma.company.findUnique({
          where: { id: companyId },
        });
        const storeUrl = `${this.getPublicStoreBaseUrl()}/store/${company?.slug || companyId}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(storeUrl)}`;
        await (ctx as any).replyWithPhoto(qrUrl, {
          caption: `🌐 Do'kon manzili: ${storeUrl}\n\nQuyidagi QR Kodni dilerlaringizga berishingiz mumkin.`,
        });
      }
      if (action === "dealers") {
        const pending = await (
          this.prisma as any
        ).dealerApprovalRequest.findMany({
          where: { companyId, status: "PENDING" },
          include: { dealer: true }, // Assuming relation includes dealer
        });
        if (!pending || pending.length === 0) {
          await (ctx as any).reply(
            `✅ Hozirda tasdiqlash uchun yangi dilerlar yo'q.`
          );
        } else {
          let msg = `👥 Kutilayotgan dilerlar:\n`;
          for (const req of pending) {
            msg += `• ${req.dealer.name} (${req.dealer.phone})\n`;
          }
          msg += `\nUshbu dilerlarni Admin Paneldan tasdiqlashingiz mumkin.`;
          await (ctx as any).reply(msg);
        }
      }
      return;
    }

    if (data.startsWith("add:")) {
      const [, productId, qtyStr] = data.split(":");
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

    if (data.startsWith("remove:")) {
      const productId = data.split(":")[1];
      const cart = this.getCart(companyId, chatId);
      cart.delete(productId);
      await (ctx as any).reply(t.cartRemoved);
      return;
    }

    if (data === "clear_cart") {
      this.clearCart(companyId, chatId);
      await (ctx as any).reply(t.cartCleared);
      return;
    }

    if (data === "checkout") {
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
      if (!p) {
        cart.delete(productId);
        continue;
      }
      const lineTotal = p.price * qty;
      total += lineTotal;
      msg += `• *${p.name}* × ${qty}\n`;
      msg += `  💵 ${lineTotal.toLocaleString()} so'm\n\n`;
      removeButtons.push({
        text: `❌ ${p.name}`,
        callback_data: `remove:${productId}`,
      });
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

  private async handleCheckoutByChat(
    ctx: Context,
    companyId: string,
    chatId: string
  ) {
    const t = this.getLangFromCtx(ctx);

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company?.siteActive) {
      return (ctx as any).reply(
        "⚠️ Do'kon hozirda OFFLINE yopiq holatda. Iltimos, keyinroq urinib ko'ring."
      );
    }

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
      return (ctx as any).reply(t.pendingApproval);
    }
    if (dealer.isBlocked) {
      return (ctx as any).reply(t.blocked);
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
    const orderItems: {
      productId: string;
      name: string;
      qty: number;
      unit: string;
      price: number;
      total: number;
    }[] = [];

    for (const [productId, qty] of cart.entries()) {
      const p = productMap.get(productId);
      if (!p) continue;
      const lineTotal = p.price * qty;
      totalAmount += lineTotal;
      orderItems.push({
        productId,
        name: p.name,
        qty,
        unit: p.unit || "pcs",
        price: p.price,
        total: lineTotal,
      });
    }

    // Check credit limit
    const newDebt = (dealer.currentDebt || 0) + totalAmount;
    if (dealer.creditLimit && newDebt > dealer.creditLimit) {
      return (ctx as any).reply(t.limitExceeded);
    }

    try {
      let lowStockProducts: { name: string; stock: number }[] = [];

      const order = await this.prisma.$transaction(async (tx) => {
        // Create order - items is a JSON field, pass array directly
        const created = await tx.order.create({
          data: {
            companyId,
            dealerId: dealer.id,
            branchId: dealer.branchId,
            totalAmount,
            totalCost: 0,
            status: "PENDING",
            items: orderItems as any,
          },
        });

        // Deduct stock for each product
        for (const item of orderItems) {
          const updatedProduct = await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.qty } },
          });
          if (updatedProduct.stock < 10) {
            lowStockProducts.push({
              name: updatedProduct.name,
              stock: updatedProduct.stock,
            });
          }
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
            type: "ORDER",
            amount: totalAmount,
            note: `Telegram buyurtma #${created.id.slice(-6).toUpperCase()}`,
          },
        });

        return created;
      });

      this.clearCart(companyId, chatId);

      if (lowStockProducts.length > 0) {
        let warnMsg = `⚠️ *Diqqat: Mahsulot kam qolmoqda!*\n\nQuyidagi mahsulotlar zaxirasi tugamoqda:\n`;
        lowStockProducts.forEach(
          (p) => (warnMsg += `• ${p.name}: ${p.stock} ta qoldi\n`)
        );
        this.sendToAdmins(companyId, warnMsg).catch(() => {});
      }

      // Cashback + log (fire and forget)
      this.prisma.company
        .findUnique({
          where: { id: companyId },
          select: { name: true, cashbackPercent: true },
        })
        .then(async (company) => {
          // Cashback
          const cashbackPct = (company as any)?.cashbackPercent ?? 0;
          if (cashbackPct > 0) {
            const earned = Math.floor((totalAmount * cashbackPct) / 100);
            if (earned > 0) {
              await this.prisma.dealer
                .update({
                  where: { id: dealer.id },
                  data: { cashbackBalance: { increment: earned } },
                })
                .catch(() => {});
            }
          }
          // Logger
          this.loggerBot
            .sendOrderNotification({
              id: order.id,
              companyName: company?.name || companyId,
              dealerName: dealer.name,
              totalAmount,
              itemCount: orderItems.length,
            })
            .catch(() => {});
        })
        .catch(() => {});

      // Build invoice receipt
      const orderNum = order.id.slice(-6).toUpperCase();
      const itemLines = orderItems
        .map(
          (item) =>
            `▪ ${item.name} — ${item.qty} ${item.unit} × ${item.price.toLocaleString()} = *${item.total.toLocaleString()} so'm*`
        )
        .join("\n");
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

  async sendMessage(botId: string, chatId: string, message: string) {
    const bot = this.bots.get(botId);
    if (!bot) return;

    try {
      await bot.telegram.sendMessage(chatId, message, {
        parse_mode: "Markdown",
      });
    } catch (e: any) {
      this.logger.error(
        `Failed to send external message for bot ${botId}: ${e.message}`
      );
    }
  }

  /** Broadcast a message to all dealers in a company that have a Telegram chatId */
  async broadcast(
    companyId: string,
    message: string
  ): Promise<{ sent: number; failed: number }> {
    // For broadcast, we use the first active bot found for this company
    const botRecord = await this.prisma.customBot.findFirst({
      where: { companyId, isActive: true, deletedAt: null },
    });
    if (!botRecord) return { sent: 0, failed: 0 };

    const bot = this.bots.get(botRecord.id);
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
        await bot.telegram.sendMessage(dealer.telegramChatId, message, {
          parse_mode: "Markdown",
        });
        sent++;
      } catch {
        failed++;
      }
    }
    return { sent, failed };
  }

  /** Send order status update notification to the dealer */
  async sendOrderStatusUpdate(
    companyId: string,
    orderId: string,
    newStatus: string,
    dealerId: string
  ) {
    const botRecord = await this.prisma.customBot.findFirst({
      where: { companyId, isActive: true, deletedAt: null },
    });
    if (!botRecord) return;

    const bot = this.bots.get(botRecord.id);
    if (!bot) return;

    const dealer = await this.prisma.dealer.findFirst({
      where: { id: dealerId, companyId },
      select: { telegramChatId: true, name: true },
    });
    if (!dealer?.telegramChatId) return;

    const statusEmoji: Record<string, string> = {
      PENDING: "⏳",
      ACCEPTED: "✅",
      PREPARING: "🔧",
      SHIPPED: "🚚",
      DELIVERED: "📦",
      COMPLETED: "✅",
      CANCELLED: "❌",
      RETURNED: "↩️",
    };

    const emoji = statusEmoji[newStatus] ?? "📋";
    const msg =
      `${emoji} *Buyurtma holati yangilandi*\n\n` +
      `📋 Buyurtma: *#${orderId.slice(-6).toUpperCase()}*\n` +
      `📊 Yangi holat: *${newStatus}*`;

    try {
      await bot.telegram.sendMessage(dealer.telegramChatId, msg, {
        parse_mode: "Markdown",
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.logger.warn(
        `Could not notify dealer ${dealerId} of status update: ${message}`
      );
    }
  }

  private async handleHelp(ctx: Context, companyName: string) {
    const company = await this.prisma.company.findFirst({
      where: { name: companyName },
    });
    const t = this.getLangFromCtx(ctx);
    const isPremium = company?.subscriptionPlan === "PREMIUM";
    const watermark = isPremium ? "" : "\n\n⚡️ supplio.uz yordamida yaratildi.";

    await ctx.reply(
      `ℹ️ *${companyName} Bot - ${t.helpTitle}*\n\n` +
        t.helpCommands +
        watermark,
      { parse_mode: "Markdown" }
    );
  }

  private async getDealerByChatId(ctx: Context, companyId: string) {
    const chatId = String(ctx.chat?.id);
    const t = this.getLangFromCtx(ctx);
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { subscriptionStatus: true, trialExpiresAt: true },
    });
    if (this.isCompanyAccessBlocked(company)) {
      await ctx.reply(t.suspended);
      return null;
    }
    const dealer = await this.prisma.dealer.findFirst({
      where: { telegramChatId: chatId, companyId, deletedAt: null },
    });

    if (!dealer) {
      await ctx.reply(t.startOver);
      return null;
    }

    if (dealer.isBlocked) {
      await ctx.reply(t.blocked);
      return null;
    }

    if (!dealer.isApproved) {
      await ctx.reply(t.pendingApproval);
      return null;
    }

    return dealer;
  }

  private progressBar(percent: number): string {
    const filled = Math.min(Math.round(percent / 10), 10);
    const empty = 10 - filled;
    return "█".repeat(filled) + "░".repeat(empty);
  }

  getBot(botId: string): Telegraf | undefined {
    return this.bots.get(botId);
  }

  async ensureBotInitialized(botId: string): Promise<Telegraf | undefined> {
    const existing = this.bots.get(botId);
    if (existing) return existing;

    const botRecord = await this.prisma.customBot.findFirst({
      where: { id: botId, isActive: true, deletedAt: null },
      include: { company: true },
    });
    if (!botRecord) return undefined;

    await this.initBot(
      botRecord.id,
      botRecord.companyId,
      botRecord.token,
      botRecord.company?.name || botRecord.companyId
    );

    return this.bots.get(botId);
  }

  async validateToken(token: string): Promise<{
    valid: boolean;
    networkError?: boolean;
    botInfo?: { id: number; username: string; first_name: string };
  }> {
    try {
      const tempBot = new Telegram(token);
      const botInfo = await Promise.race([
        tempBot.getMe(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("TIMEOUT")), 10000)
        ),
      ]);
      return {
        valid: true,
        botInfo: {
          id: botInfo.id,
          username: botInfo.username || "",
          first_name: botInfo.first_name,
        },
      };
    } catch (err: any) {
      this.logger.warn(
        `Token validation failed for token ${token.slice(0, 5)}...: ${err.message}`
      );
      const isNetworkError =
        err.message === "TIMEOUT" ||
        !err.response ||
        err.code === "ECONNREFUSED" ||
        err.code === "ETIMEDOUT" ||
        err.code === "ENOTFOUND";
      return { valid: false, networkError: isNetworkError };
    }
  }

  getBotStatus(botId: string): "connected" | "stopped" | "not_found" {
    const bot = this.bots.get(botId);
    if (!bot) return "not_found";
    return "connected";
  }

  async getBotsForCompany(companyId: string) {
    return this.prisma.customBot.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  async reloadCompanyBots(companyId: string) {
    const records = await this.prisma.customBot.findMany({
      where: { companyId, deletedAt: null, isActive: true },
      include: { company: true },
    });

    for (const record of records) {
      const existing = this.bots.get(record.id);
      if (existing) {
        try {
          existing.stop();
        } catch {}
        this.bots.delete(record.id);
      }

      await this.initBot(
        record.id,
        record.companyId,
        record.token,
        record.company?.name || record.companyId
      );
    }

    return { reloaded: records.length };
  }

  async createBot(
    companyId: string,
    data: { token: string; botName?: string; description?: string }
  ) {
    if (!data.token?.trim()) {
      throw new BadRequestException("Bot token is required.");
    }
    await this.planLimits.checkBotLimit(companyId);
    // Validate token before saving
    const validation = await this.validateToken(data.token.trim());
    if (!validation.valid) {
      if (validation.networkError) {
        throw new BadRequestException(
          "Cannot reach Telegram API to verify this token. Check server internet connectivity, then try again."
        );
      }
      throw new BadRequestException(
        "Invalid Telegram bot token. Please get a valid token from @BotFather."
      );
    }
    const username = validation.botInfo?.username;
    const resolvedName =
      data.botName || validation.botInfo?.first_name || "Store Bot";

    try {
      this.logger.log(`Creating bot for company: ${companyId}`);
      const bot = await this.prisma.customBot.create({
        data: {
          companyId,
          token: data.token,
          botName: resolvedName,
          username,
          description: data.description,
          isActive: true,
        },
      });

      this.logger.log(
        `Bot record created in DB: ${bot.id}. Initializing instance...`
      );

      try {
        const company = await this.prisma.company.findUnique({
          where: { id: companyId },
        });
        if (!company) {
          this.logger.error(
            `Company not found after creating bot record! ID: ${companyId}`
          );
        } else {
          await this.initBot(bot.id, companyId, bot.token, company.name);
        }
      } catch (initErr: any) {
        this.logger.error(
          `Failed to execute initBot during creation: ${initErr.message}`
        );
        // We don't throw here, the record is already created.
        // Admin can re-enable later if init failed.
      }

      return { ...bot, botInfo: validation.botInfo };
    } catch (e: any) {
      this.logger.error(`Error in createBot: ${e.message}`, e.stack);
      if (e.code === "P2002") {
        throw new BadRequestException(
          "This bot token is already registered to another company."
        );
      }
      if (e.code === "P2003") {
        throw new BadRequestException(
          "Foreign key constraint failed. Check if companyId is valid."
        );
      }
      throw e;
    }
  }

  async updateBot(
    id: string,
    companyId: string,
    data: {
      token?: string;
      botName?: string;
      description?: string;
      isActive?: boolean;
    }
  ) {
    const bot = await this.prisma.customBot.findFirst({
      where: { id, companyId, deletedAt: null },
    });
    if (!bot) throw new Error("Bot not found");
    if (data.isActive === true && !bot.isActive) {
      const limits = await this.planLimits.getLimitsForCompany(companyId);
      if (!limits.allowCustomBot || limits.maxCustomBots <= 0) {
        throw new BadRequestException(
          "Telegram bot is not available on your current plan. Please upgrade your tariff."
        );
      }
      const activeCount = await this.prisma.customBot.count({
        where: { companyId, deletedAt: null, isActive: true },
      });
      if (activeCount >= limits.maxCustomBots) {
        throw new BadRequestException(
          `Telegram bot limit reached. Your current plan allows up to ${limits.maxCustomBots}. Please upgrade your tariff.`
        );
      }
    }
    const updated = await this.prisma.customBot.update({ where: { id }, data });
    if (data.isActive === true || data.token) {
      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
      });
      await this.initBot(
        updated.id,
        companyId,
        updated.token,
        company?.name ?? companyId
      );
    } else if (data.isActive === false) {
      const existing = this.bots.get(id);
      if (existing) {
        try {
          existing.stop();
        } catch {}
        this.bots.delete(id);
      }
    }
    return updated;
  }

  async removeBot(id: string, companyId: string) {
    const bot = await this.prisma.customBot.findFirst({
      where: { id, companyId, deletedAt: null },
    });
    if (!bot) throw new Error("Bot not found");
    const existing = this.bots.get(id);
    if (existing) {
      try {
        await existing.telegram.deleteWebhook({ drop_pending_updates: true });
      } catch {}
      try {
        existing.stop();
      } catch {}
      this.bots.delete(id);
    }
    return this.prisma.customBot.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async getAllBotsAdmin() {
    const bots = await this.prisma.customBot.findMany({
      where: { deletedAt: null },
      include: { company: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    });
    return bots.map((b) => ({
      ...b,
      status: this.getBotStatus(b.id),
    }));
  }

  async adminReloadBot(botId: string) {
    const bot = await this.prisma.customBot.findFirst({
      where: { id: botId, deletedAt: null },
      include: { company: true },
    });
    if (!bot) throw new NotFoundException("Bot not found");

    const existing = this.bots.get(botId);
    if (existing) {
      try {
        existing.stop();
      } catch {}
      this.bots.delete(botId);
    }

    if (bot.isActive) {
      await this.initBot(
        bot.id,
        bot.companyId,
        bot.token,
        bot.company?.name ?? bot.companyId
      );
    }

    return { success: true, status: this.getBotStatus(botId) };
  }

  async adminHardDeleteBot(botId: string) {
    const bot = await this.prisma.customBot.findFirst({
      where: { id: botId },
    });
    if (!bot) throw new NotFoundException("Bot not found");

    const existing = this.bots.get(botId);
    if (existing) {
      try {
        await existing.telegram.deleteWebhook({ drop_pending_updates: true });
      } catch {}
      try {
        existing.stop();
      } catch {}
      this.bots.delete(botId);
    }

    await this.prisma.customBot.delete({ where: { id: botId } });
    return { success: true };
  }

  async adminUpdateBot(
    botId: string,
    data: { token?: string; isActive?: boolean }
  ) {
    const bot = await this.prisma.customBot.findFirst({
      where: { id: botId, deletedAt: null },
      include: { company: true },
    });
    if (!bot) throw new NotFoundException("Bot not found");

    const updated = await this.prisma.customBot.update({
      where: { id: botId },
      data,
    });

    if (data.token || data.isActive === true) {
      const existing = this.bots.get(botId);
      if (existing) {
        try {
          existing.stop();
        } catch {}
        this.bots.delete(botId);
      }
      await this.initBot(
        updated.id,
        updated.companyId,
        updated.token,
        bot.company?.name ?? updated.companyId
      );
    } else if (data.isActive === false) {
      const existing = this.bots.get(botId);
      if (existing) {
        try {
          existing.stop();
        } catch {}
        this.bots.delete(botId);
      }
    }

    return { ...updated, status: this.getBotStatus(botId) };
  }

  /** Notify dealer via Telegram after distributor approves or rejects their request */
  async notifyDealerApprovalResult(
    companyId: string,
    dealerId: string,
    approved: boolean
  ) {
    const botRecord = await this.prisma.customBot.findFirst({
      where: { companyId, isActive: true, deletedAt: null },
    });
    if (!botRecord) return;

    const bot = this.bots.get(botRecord.id);
    if (!bot) return;

    const dealer = await this.prisma.dealer.findFirst({
      where: { id: dealerId, companyId },
      select: { telegramChatId: true, name: true },
    });
    if (!dealer?.telegramChatId) return;

    const approvedMsgs = {
      uz: `✅ *${dealer.name}*, so'rovingiz tasdiqlandi!\n\nEndi botdan to'liq foydalanishingiz mumkin. Davom etish uchun /start bosing.`,
      oz: `✅ *${dealer.name}*, сўровингиз тасдиқланди!\n\nЭнди ботдан тўлиқ фойдаланишингиз мумкин. Давом этиш учун /start босинг.`,
      ru: `✅ *${dealer.name}*, ваша заявка одобрена!\n\nТеперь вы можете пользоваться ботом. Нажмите /start чтобы продолжить.`,
      tr: `✅ *${dealer.name}*, başvurunuz onaylandı!\n\nArtık botu kullanabilirsiniz. Devam etmek için /start'a basın.`,
      en: `✅ *${dealer.name}*, your request has been approved!\n\nYou can now use the bot. Press /start to continue.`,
    };

    const rejectedMsgs = {
      uz: `❌ *${dealer.name}*, afsuski so'rovingiz rad etildi.\n\nBatafsil ma'lumot uchun distributor bilan bog'laning.`,
      oz: `❌ *${dealer.name}*, афсуски сўровингиз рад этилди.\n\nБатафсил маълумот учун дистрибьютор билан боғланинг.`,
      ru: `❌ *${dealer.name}*, к сожалению ваша заявка отклонена.\n\nСвяжитесь с дистрибьютором для уточнения.`,
      tr: `❌ *${dealer.name}*, başvurunuz reddedildi.\n\nAyrıntılar için distribütörünüzle iletişime geçin.`,
      en: `❌ *${dealer.name}*, your request has been rejected.\n\nPlease contact your distributor for more information.`,
    };

    // Send in all 5 languages since we don't know which language the dealer uses
    const msgs = approved ? approvedMsgs : rejectedMsgs;
    const text = Object.values(msgs).join("\n\n────────────\n\n");

    try {
      await bot.telegram.sendMessage(dealer.telegramChatId, text, {
        parse_mode: "Markdown",
      });
    } catch (e: any) {
      this.logger.warn(
        `Could not notify dealer ${dealerId} of approval result: ${e.message}`
      );
    }
  }

  async stopAll() {
    for (const [id, bot] of this.bots) {
      bot.stop("shutdown");
    }
    this.bots.clear();
  }
}
