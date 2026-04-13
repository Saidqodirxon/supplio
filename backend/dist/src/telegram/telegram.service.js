"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TelegramService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
const prisma_service_1 = require("../prisma/prisma.service");
const telegram_logger_service_1 = require("./telegram-logger.service");
const plan_limits_service_1 = require("../common/services/plan-limits.service");
let TelegramService = TelegramService_1 = class TelegramService {
    constructor(prisma, loggerBot, planLimits) {
        this.prisma = prisma;
        this.loggerBot = loggerBot;
        this.planLimits = planLimits;
        this.logger = new common_1.Logger(TelegramService_1.name);
        this.bots = new Map();
        this.carts = new Map();
        this.chatLangPrefs = new Map();
        this.translations = {
            uz: {
                welcome: "Assalomu alaykum!\nBuyurtma berishni boshlash uchun telefon raqamingizni yuboring.",
                sendPhone: "📞 Telefon raqamimni yuborish",
                suspended: "⚠️ Ushbu bot xizmati vaqtinchalik to'xtatilgan. Iltimos, menejer bilan bog'laning.",
                notRegistered: "❌ Siz diler sifatida ro'yxatdan o'tmagansiz.\nIltimos, kompaniya menejeri bilan bog'laning.",
                loginSuccess: " botga ulandi.",
                pendingApproval: "⏳ Sizning so'rovingiz ko'rib chiqilmoqda. Distributor tasdiqlashini kuting.",
                approvalSent: "✅ Ro'yxatdan o'tish so'rovingiz distributorga yuborildi.\n⏳ Tasdiqlash kutilyapti. Xabar beriladi.",
                accessDenied: "⛔ Sizda bu botdan foydalanish huquqi yo'q.\nDistributor bilan bog'laning.",
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
                helpCommands: "📋 Buyruqlar:\n\n💰 Qarzim — qarzni ko'rish\n💸 To'lovlarim — to'lovlar tarixi\n📦 Mahsulotlar — mahsulotlar ro'yxati\n📋 Buyurtmalarim — buyurtmalar tarixi\n🛒 Savat — savatni ko'rish\n\n📞 Muammo bo'lsa: kompaniya menejeriga murojaat qiling.",
                addToCart: "🛒 Savatga",
                cartEmpty: "🛒 Savat bo'sh.\nMahsulotlarni 📦 Mahsulotlar tugmasi orqali qo'shing.",
                cartTitle: "🛒 *Savatingiz:*",
                cartTotal: "💰 *Jami:*",
                cartCheckout: "✅ Buyurtma berish",
                cartClear: "🗑 Tozalash",
                cartCleared: "🗑 Savat tozalandi.",
                cartUpdated: "✅ Savatga qo'shildi!",
                cartRemoved: "❌ O'chirildi.",
                checkoutSuccess: "✅ Buyurtma qabul qilindi!\n\n*Buyurtma #",
                checkoutFail: "❌ Buyurtma berishda xatolik. Iltimos, qayta urinib ko'ring.",
                checkoutEmpty: "🛒 Savat bo'sh. Avval mahsulot tanlang.",
                limitExceeded: "⚠️ Kredit limiti yetarli emas! Avval qarzni to'lang.",
                kbdCart: "🛒 Savat",
            },
            oz: {
                welcome: "Ассалому алайкум! Ботга хуш келибсиз.\nИлтимос, телефон рақамингизни юборинг:",
                sendPhone: "📞 Телефон рақамни юбориш",
                suspended: "⚠️ Ушбу бот хизмати вақтинча тўхтатилган. Менежер билан боғланинг.",
                notRegistered: "❌ Сиз дилер сифатида рўйхатдан ўтмагансиз.\nКомпания менежери билан боғланинг.",
                loginSuccess: " муваффақиятли тизимга кирдингиз!",
                pendingApproval: "⏳ Сизнинг сўровингиз кўриб чиқилмоқда. Дистрибьютор тасдиқлашини кутинг.",
                approvalSent: "✅ Рўйхатдан ўтиш сўровингиз дистрибьюторга юборилди.\n⏳ Тасдиқлаш кутиляпти.",
                accessDenied: "⛔ Сизда бу ботдан фойдаланиш ҳуқуқи йўқ.\nДистрибьютор билан боғланинг.",
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
                helpCommands: "📋 Буйруқлар:\n\n💰 Қарзим — қарзни кўриш\n💸 Тўловларим — тўловлар тарихи\n📦 Маҳсулотлар — маҳсулотлар рўйхати\n📋 Буюртмаларим — буюртмалар тарихи\n🛒 Сават — саватни кўриш\n\n📞 Муаммо бўлса: компания менежерига мурожаат қилинг.",
                addToCart: "🛒 Саватга",
                cartEmpty: "🛒 Сават бўш.\nМаҳсулотларни 📦 Маҳсулотлар тугмаси орқали қўшинг.",
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
                welcome: "Здравствуйте!\nЧтобы начать оформление заказа, отправьте номер телефона.",
                sendPhone: "📞 Отправить мой номер",
                suspended: "⚠️ Сервис временно приостановлен. Свяжитесь с менеджером.",
                notRegistered: "❌ Вы не зарегистрированы как дилер. Свяжитесь с менеджером компании.",
                loginSuccess: " бот подключен.",
                pendingApproval: "⏳ Ваша заявка рассматривается. Ожидайте подтверждения от дистрибьютора.",
                approvalSent: "✅ Заявка на регистрацию отправлена дистрибьютору.\n⏳ Ожидайте подтверждения.",
                accessDenied: "⛔ У вас нет доступа к этому боту.\nСвяжитесь с дистрибьютором.",
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
                helpCommands: "📋 Команды:\n\n💰 Мой долг — узнать долг\n💸 Платежи — история платежей\n📦 Продукты — список товаров\n📋 Заказы — история заказов\n🛒 Корзина — ваша корзина\n\n📞 Проблемы? Свяжитесь с менеджером.",
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
                limitExceeded: "⚠️ Недостаточно кредитного лимита! Сначала погасите долг.",
                kbdCart: "🛒 Корзина",
            },
            tr: {
                welcome: "Merhaba!\nSipariş vermek için telefon numaranızı gönderin.",
                sendPhone: "📞 Numaramı gönder",
                suspended: "⚠️ Bu bot geçici olarak askıya alınmıştır. Yöneticiyle iletişime geçin.",
                notRegistered: "❌ Bayi olarak kayıtlı değilsiniz.\nŞirket yöneticisiyle iletişime geçin.",
                loginSuccess: " bot bağlı.",
                pendingApproval: "⏳ Başvurunuz inceleniyor. Distribütörün onayını bekleyin.",
                approvalSent: "✅ Kayıt başvurunuz distribütöre gönderildi.\n⏳ Onay bekleniyor.",
                accessDenied: "⛔ Bu botu kullanma izniniz yok.\nDistribütörünüzle iletişime geçin.",
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
                helpCommands: "📋 Komutlar:\n\n💰 Borcum — borç görüntüle\n💸 Ödemelerim — ödeme geçmişi\n📦 Ürünler — ürün listesi\n📋 Siparişlerim — sipariş geçmişi\n🛒 Sepet — sepetiniz\n\n📞 Sorun mu var? Yöneticiyle iletişime geçin.",
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
                suspended: "⚠️ This bot is temporarily suspended. Please contact the manager.",
                notRegistered: "❌ You are not registered as a dealer.\nPlease contact the company manager.",
                loginSuccess: " bot connected.",
                pendingApproval: "⏳ Your request is under review. Please wait for the distributor's approval.",
                approvalSent: "✅ Your registration request has been sent to the distributor.\n⏳ Awaiting approval.",
                accessDenied: "⛔ You don't have permission to use this bot.\nContact your distributor.",
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
                helpCommands: "📋 Commands:\n\n💰 My Debt — view debt\n💸 Payments — payment history\n📦 Products — product list\n📋 Orders — order history\n🛒 Cart — view cart\n\n📞 Need help? Contact the company manager.",
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
                limitExceeded: "⚠️ Insufficient credit limit! Please pay your debt first.",
                kbdCart: "🛒 Cart",
            },
        };
    }
    async onModuleInit() {
        try {
            await this.initializeBots();
        }
        catch (err) {
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
    getT(lang = "uz") {
        return this.translations[lang] ?? this.translations["uz"];
    }
    getPublicStoreBaseUrl() {
        return (process.env.PUBLIC_STORE_URL ||
            process.env.LANDING_URL ||
            process.env.APP_URL ||
            process.env.PUBLIC_SITE_URL ||
            process.env.FRONTEND_URL ||
            "https://supplio.uz").replace(/\/+$/, "");
    }
    isCompanyAccessBlocked(company) {
        if (!company)
            return true;
        if (company.subscriptionStatus === "LOCKED")
            return true;
        if (company.trialExpiresAt &&
            ["TRIAL", "ACTIVE"].includes(String(company.subscriptionStatus || "")) &&
            new Date() > new Date(company.trialExpiresAt)) {
            return true;
        }
        return false;
    }
    async sendToAdmins(companyId, message) {
        try {
            const admins = await this.prisma.user.findMany({
                where: {
                    companyId,
                    roleType: { in: ["OWNER", "MANAGER"] },
                    deletedAt: null,
                },
            });
            if (admins.length === 0)
                return;
            const adminPhones = admins.map((a) => `${a.phone.slice(-9)}`);
            const adminDealers = await this.prisma.dealer.findMany({
                where: { companyId, telegramChatId: { not: null } },
            });
            const targetDealers = adminDealers.filter((d) => adminPhones.some((p) => d.phone.includes(p)));
            const botRecord = await this.prisma.customBot.findFirst({
                where: { companyId, isActive: true },
            });
            if (!botRecord)
                return;
            const bot = this.bots.get(botRecord.id);
            if (!bot)
                return;
            for (const dealer of targetDealers) {
                if (dealer.telegramChatId) {
                    bot.telegram
                        .sendMessage(dealer.telegramChatId, message, {
                        parse_mode: "Markdown",
                    })
                        .catch(() => { });
                }
            }
        }
        catch (e) {
            this.logger.error("Failed to send to Company Admins: " + e);
        }
    }
    getLangFromCtx(ctx) {
        const chatId = String(ctx.chat?.id ?? ctx.from?.id ?? "");
        const preferred = chatId ? this.chatLangPrefs.get(chatId) : undefined;
        if (preferred && this.translations[preferred]) {
            return this.translations[preferred];
        }
        const code = ctx.from?.language_code ?? "uz";
        let lang = "uz";
        if (code.startsWith("ru"))
            lang = "ru";
        else if (code.startsWith("tr"))
            lang = "tr";
        else if (code.startsWith("en"))
            lang = "en";
        return this.translations[lang] ?? this.translations["uz"];
    }
    buildLanguageKeyboard() {
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
    buildMainMenuKeyboard(t) {
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
    buildAdminMenuKeyboard() {
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
    async initBot(botId, companyId, token, companyName) {
        try {
            const existing = this.bots.get(botId);
            if (existing) {
                try {
                    existing.stop();
                }
                catch { }
                this.bots.delete(botId);
            }
            const bot = new telegraf_1.Telegraf(token);
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
                    if (existingDealer.isBlocked)
                        return ctx.reply(t.blocked);
                    if (!existingDealer.isApproved) {
                        const pending = await this.prisma.dealerApprovalRequest.findFirst({
                            where: { dealerId: existingDealer.id, status: "PENDING" },
                        });
                        return ctx.reply(pending ? t.pendingApproval : t.accessDenied);
                    }
                    const limits = await this.planLimits.getLimitsForCompany(companyId);
                    const storeUrl = `${this.getPublicStoreBaseUrl()}/store/${company?.slug || companyId}`;
                    await ctx.reply(`👋 *${existingDealer.name}*${t.loginSuccess}${t.commands}`, {
                        parse_mode: "Markdown",
                        reply_markup: this.buildMainMenuKeyboard(t),
                    });
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
                if (!phone.startsWith("998"))
                    phone = "998" + phone;
                const t = this.getLangFromCtx(ctx);
                const chatId = String(ctx.chat.id);
                const dealerMatch = await this.prisma.dealer.findFirst({
                    where: {
                        phone: { contains: phone.slice(-9) },
                        companyId,
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
                    const branchId = userMatch.branchId ||
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
                    }
                    catch (e) {
                        if (e.code === "P2002") {
                            dealer = await this.prisma.dealer.findFirst({
                                where: { phone: { contains: phone.slice(-9) }, companyId },
                            });
                            if (!dealer)
                                throw e;
                        }
                        else
                            throw e;
                    }
                }
                if (!dealer) {
                    const branch = await this.prisma.branch.findFirst({
                        where: { companyId, deletedAt: null },
                        orderBy: { createdAt: "asc" },
                    });
                    if (!branch?.id) {
                        return ctx.reply("Filial topilmadi. Distributor bilan bog'laning.", {
                            reply_markup: { remove_keyboard: true },
                        });
                    }
                    const suggestedName = `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
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
                    }
                    catch (e) {
                        if (e.code === "P2002") {
                            dealer = await this.prisma.dealer.findFirst({
                                where: { phone: { contains: phone.slice(-9) }, companyId },
                            });
                            if (!dealer)
                                throw e;
                        }
                        else
                            throw e;
                    }
                }
                await this.prisma.dealer.update({
                    where: { id: dealer.id },
                    data: { telegramChatId: chatId },
                });
                if (dealer.isBlocked)
                    return ctx.reply(t.blocked, {
                        reply_markup: { remove_keyboard: true },
                    });
                if (!dealer.isApproved) {
                    const existing = await this.prisma.dealerApprovalRequest.findFirst({
                        where: { dealerId: dealer.id, status: "PENDING" },
                    });
                    if (!existing) {
                        await this.prisma.dealerApprovalRequest.create({
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
                        const companyNameLabel = compInfo?.name || "Kompaniya";
                        this.loggerBot
                            .sendDealerApprovalRequest({
                            name: dealer.name,
                            phone: dealer.phone,
                            companyName: companyNameLabel,
                        })
                            .catch(() => { });
                        this.sendToAdmins(companyId, `🔔 *Yangi diler ro'yxatdan o'tdi!*\n\nIsmi: ${dealer.name}\nTel: ${dealer.phone}\n\nIltimos, bot menyusidan xabardor qiling yoki Admin paneldan tasdiqlang.`).catch(() => { });
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
                if (limits.allowWebStore) {
                    try {
                        await bot.telegram.setChatMenuButton({
                            chatId: ctx.chat.id,
                            menuButton: {
                                type: "web_app",
                                text: "🌐 Web Do'kon",
                                web_app: { url: storeUrl },
                            },
                        });
                    }
                    catch (e) { }
                }
                await ctx.reply(`✅ *${dealer.name}*${t.loginSuccess}\n\nQuyidagi tugmalardan foydalaning:`, {
                    parse_mode: "Markdown",
                    reply_markup: { remove_keyboard: true },
                });
                await ctx.reply(`🛍 *${companyName}* - Bosh menyu`, {
                    parse_mode: "Markdown",
                    reply_markup: this.buildMainMenuKeyboard(t),
                });
                if (userMatch &&
                    (userMatch.roleType === "OWNER" || userMatch.roleType === "MANAGER")) {
                    await ctx.reply(`👨‍💼 *Admin Panel*\nSiz tizim boshqaruvchisi sifatida tanildingiz:`, {
                        parse_mode: "Markdown",
                        reply_markup: this.buildAdminMenuKeyboard(),
                    });
                }
            });
            bot.command("debt", async (ctx) => await this.handleDebt(ctx, companyId));
            bot.command("products", async (ctx) => await this.handleProducts(ctx, companyId));
            bot.command("payments", async (ctx) => await this.handlePayments(ctx, companyId));
            bot.command("orders", async (ctx) => await this.handleOrders(ctx, companyId));
            bot.command("cart", async (ctx) => await this.handleCart(ctx, companyId));
            bot.command("checkout", async (ctx) => await this.handleCheckout(ctx, companyId));
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
            bot.on("callback_query", async (ctx) => await this.handleCallback(ctx, companyId));
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
                    });
                    this.logger.log(`✅ Global menu button set for ${companyName}: ${storeUrl}`);
                }
            }
            catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                this.logger.warn(`⚠️ Could not set global menu button for ${companyName}: ${msg}`);
            }
            if (process.env.NODE_ENV === "production" &&
                (process.env.BOT_WEBHOOK_URL || process.env.APP_URL)) {
                const baseUrl = process.env.BOT_WEBHOOK_URL || process.env.APP_URL + "/webhook";
                const webhookUrl = baseUrl.endsWith("/")
                    ? `${baseUrl}${botId}`
                    : `${baseUrl}/${botId}`;
                await bot.telegram.setWebhook(webhookUrl);
                this.logger.log(`✅ Webhook set for ${companyName} (Bot: ${botId}): ${webhookUrl}`);
            }
            else {
                bot
                    .launch()
                    .catch((e) => this.logger.warn(`Polling launch failed for ${companyName}: ${e.message}`));
                this.logger.log(`✅ Bot launched (polling) for ${companyName}`);
            }
            this.bots.set(botId, bot);
        }
        catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            this.logger.error(`❌ Bot init failed for ${botId}: ${message}`);
        }
    }
    async handleDebt(ctx, companyId) {
        const dealer = await this.getDealerByChatId(ctx, companyId);
        if (!dealer)
            return;
        const t = this.getLangFromCtx(ctx);
        const debt = dealer.currentDebt || 0;
        const limit = dealer.creditLimit || 0;
        const ratio = limit > 0 ? Math.round((debt / limit) * 100) : 0;
        const bar = this.progressBar(ratio);
        const cashback = dealer.cashbackBalance ?? 0;
        const cashbackLine = cashback > 0 ? `\n🎁 Cashback: *${cashback.toLocaleString()} so'm*` : "";
        await ctx.reply(`💰 *${dealer.name}*\n\n` +
            `${t.debtTitle}: *${debt.toLocaleString()} so'm*\n` +
            `${t.limitTitle}: *${limit > 0 ? limit.toLocaleString() + " so'm" : "Cheksiz"}*\n\n` +
            `${limit > 0 ? bar + " " + ratio + "%\n\n" : ""}` +
            `${debt > 0 && limit > 0 && debt > limit ? t.overLimit : limit > 0 ? t.withinLimit : ""}` +
            cashbackLine, { parse_mode: "Markdown" });
    }
    async handleProducts(ctx, companyId) {
        const dealer = await this.getDealerByChatId(ctx, companyId);
        if (!dealer)
            return;
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
        const backendUrl = (process.env.APP_URL ||
            process.env.FRONTEND_URL ||
            "http://localhost:5000").replace(/\/$/, "");
        for (const p of products) {
            const effectivePrice = p.discountPrice ?? p.price;
            const isPromo = p.isPromo && p.discountPrice;
            const priceStr = isPromo
                ? `~~${p.price.toLocaleString()}~~ → *${effectivePrice.toLocaleString()} so'm* 🔥`
                : `*${p.price.toLocaleString()} so'm*`;
            const caption = `${isPromo ? "🏷 *AKSIYA!* " : ""}*${p.name}*\n` +
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
                    await ctx.replyWithPhoto(photoUrl, {
                        caption,
                        parse_mode: "Markdown",
                        reply_markup: { inline_keyboard: buttons },
                    });
                    continue;
                }
                catch {
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
    async handleOrders(ctx, companyId) {
        const dealer = await this.getDealerByChatId(ctx, companyId);
        if (!dealer)
            return;
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
            const statusIcon = order.status === "DELIVERED"
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
    async handlePayments(ctx, companyId) {
        const dealer = await this.getDealerByChatId(ctx, companyId);
        if (!dealer)
            return;
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
    getCart(companyId, chatId) {
        if (!this.carts.has(companyId))
            this.carts.set(companyId, new Map());
        const companyCart = this.carts.get(companyId);
        if (!companyCart.has(chatId))
            companyCart.set(chatId, new Map());
        return companyCart.get(chatId);
    }
    clearCart(companyId, chatId) {
        this.carts.get(companyId)?.get(chatId)?.clear();
    }
    async handleCallback(ctx, companyId) {
        const query = ctx.callbackQuery;
        if (!query?.data)
            return;
        await ctx.answerCbQuery();
        const data = query.data;
        const chatId = String(query.from.id);
        const t = this.getLangFromCtx(ctx);
        if (data.startsWith("lang:set:")) {
            const lang = data.split(":")[2] || "uz";
            const allowed = ["uz", "ru", "tr", "en"];
            const safeLang = allowed.includes(lang) ? lang : "uz";
            this.chatLangPrefs.set(chatId, safeLang);
            await ctx.reply("✅ Til saqlandi. Davom etish uchun /start bosing.");
            return;
        }
        if (data.startsWith("menu:")) {
            const action = data.split(":")[1];
            if (action === "products")
                await this.handleProducts(ctx, companyId);
            if (action === "cart")
                await this.handleCart(ctx, companyId);
            if (action === "orders")
                await this.handleOrders(ctx, companyId);
            if (action === "debt")
                await this.handleDebt(ctx, companyId);
            if (action === "payments")
                await this.handlePayments(ctx, companyId);
            if (action === "lang") {
                await ctx.reply("Tilni tanlang / Выберите язык / Choose language", {
                    reply_markup: this.buildLanguageKeyboard(),
                });
            }
            if (action === "help") {
                const companyName = (await this.prisma.company.findUnique({
                    where: { id: companyId },
                    select: { name: true },
                }))?.name || "Company";
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
                    await ctx.reply(`📊 Do'kon hozir: ${!company.siteActive ? "✅ ONLINE (Faol)" : "❌ OFFLINE (Yopiq)"}`);
                }
            }
            if (action === "store_link") {
                const limits = await this.planLimits.getLimitsForCompany(companyId);
                if (!limits.allowWebStore) {
                    await ctx.reply("⚠️ Joriy tarifda Web do'kon funksiyasi mavjud emas.");
                    return;
                }
                const company = await this.prisma.company.findUnique({
                    where: { id: companyId },
                });
                const storeUrl = `${this.getPublicStoreBaseUrl()}/store/${company?.slug || companyId}`;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(storeUrl)}`;
                await ctx.replyWithPhoto(qrUrl, {
                    caption: `🌐 Do'kon manzili: ${storeUrl}\n\nQuyidagi QR Kodni dilerlaringizga berishingiz mumkin.`,
                });
            }
            if (action === "dealers") {
                const pending = await this.prisma.dealerApprovalRequest.findMany({
                    where: { companyId, status: "PENDING" },
                    include: { dealer: true },
                });
                if (!pending || pending.length === 0) {
                    await ctx.reply(`✅ Hozirda tasdiqlash uchun yangi dilerlar yo'q.`);
                }
                else {
                    let msg = `👥 Kutilayotgan dilerlar:\n`;
                    for (const req of pending) {
                        msg += `• ${req.dealer.name} (${req.dealer.phone})\n`;
                    }
                    msg += `\nUshbu dilerlarni Admin Paneldan tasdiqlashingiz mumkin.`;
                    await ctx.reply(msg);
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
            if (!product)
                return;
            const cart = this.getCart(companyId, chatId);
            cart.set(productId, (cart.get(productId) || 0) + qty);
            const cartTotal = Array.from(cart.values()).reduce((s, q) => s + q, 0);
            await ctx.reply(`${t.cartUpdated} *${product.name}* ×${cart.get(productId)}\n🛒 Savatda jami: ${cartTotal} ta mahsulot`, { parse_mode: "Markdown" });
            return;
        }
        if (data.startsWith("remove:")) {
            const productId = data.split(":")[1];
            const cart = this.getCart(companyId, chatId);
            cart.delete(productId);
            await ctx.reply(t.cartRemoved);
            return;
        }
        if (data === "clear_cart") {
            this.clearCart(companyId, chatId);
            await ctx.reply(t.cartCleared);
            return;
        }
        if (data === "checkout") {
            await this.handleCheckoutByChat(ctx, companyId, chatId);
            return;
        }
    }
    async handleCart(ctx, companyId) {
        const dealer = await this.getDealerByChatId(ctx, companyId);
        if (!dealer)
            return;
        const chatId = String(ctx.chat.id);
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
        const removeButtons = [];
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
    async handleCheckout(ctx, companyId) {
        const dealer = await this.getDealerByChatId(ctx, companyId);
        if (!dealer)
            return;
        await this.handleCheckoutByChat(ctx, companyId, String(ctx.chat.id));
    }
    async handleCheckoutByChat(ctx, companyId, chatId) {
        const t = this.getLangFromCtx(ctx);
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
        });
        if (!company?.siteActive) {
            return ctx.reply("⚠️ Do'kon hozirda OFFLINE yopiq holatda. Iltimos, keyinroq urinib ko'ring.");
        }
        const cart = this.getCart(companyId, chatId);
        if (cart.size === 0) {
            return ctx.reply(t.checkoutEmpty);
        }
        const dealer = await this.prisma.dealer.findFirst({
            where: { telegramChatId: chatId, companyId, deletedAt: null },
        });
        if (!dealer)
            return ctx.reply(t.startOver);
        if (!dealer.isApproved) {
            return ctx.reply(t.pendingApproval);
        }
        if (dealer.isBlocked) {
            return ctx.reply(t.blocked);
        }
        const productIds = Array.from(cart.keys());
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds }, companyId, deletedAt: null },
        });
        if (products.length === 0) {
            this.clearCart(companyId, chatId);
            return ctx.reply(t.checkoutEmpty);
        }
        const productMap = new Map(products.map((p) => [p.id, p]));
        let totalAmount = 0;
        const orderItems = [];
        for (const [productId, qty] of cart.entries()) {
            const p = productMap.get(productId);
            if (!p)
                continue;
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
        const newDebt = (dealer.currentDebt || 0) + totalAmount;
        if (dealer.creditLimit && newDebt > dealer.creditLimit) {
            return ctx.reply(t.limitExceeded);
        }
        try {
            let lowStockProducts = [];
            const order = await this.prisma.$transaction(async (tx) => {
                const created = await tx.order.create({
                    data: {
                        companyId,
                        dealerId: dealer.id,
                        branchId: dealer.branchId,
                        totalAmount,
                        totalCost: 0,
                        status: "PENDING",
                        items: orderItems,
                    },
                });
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
                await tx.dealer.update({
                    where: { id: dealer.id },
                    data: { currentDebt: { increment: totalAmount } },
                });
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
                lowStockProducts.forEach((p) => (warnMsg += `• ${p.name}: ${p.stock} ta qoldi\n`));
                this.sendToAdmins(companyId, warnMsg).catch(() => { });
            }
            this.prisma.company
                .findUnique({
                where: { id: companyId },
                select: { name: true, cashbackPercent: true },
            })
                .then(async (company) => {
                const cashbackPct = company?.cashbackPercent ?? 0;
                if (cashbackPct > 0) {
                    const earned = Math.floor((totalAmount * cashbackPct) / 100);
                    if (earned > 0) {
                        await this.prisma.dealer
                            .update({
                            where: { id: dealer.id },
                            data: { cashbackBalance: { increment: earned } },
                        })
                            .catch(() => { });
                    }
                }
                this.loggerBot
                    .sendOrderNotification({
                    id: order.id,
                    companyName: company?.name || companyId,
                    dealerName: dealer.name,
                    totalAmount,
                    itemCount: orderItems.length,
                })
                    .catch(() => { });
            })
                .catch(() => { });
            const orderNum = order.id.slice(-6).toUpperCase();
            const itemLines = orderItems
                .map((item) => `▪ ${item.name} — ${item.qty} ${item.unit} × ${item.price.toLocaleString()} = *${item.total.toLocaleString()} so'm*`)
                .join("\n");
            const newDebtAfter = (dealer.currentDebt || 0) + totalAmount;
            await ctx.reply(`✅ *BUYURTMA QABUL QILINDI*\n` +
                `━━━━━━━━━━━━━━━\n` +
                `📋 Buyurtma: *#${orderNum}*\n` +
                `👤 Diler: ${dealer.name}\n` +
                `━━━━━━━━━━━━━━━\n` +
                `${itemLines}\n` +
                `━━━━━━━━━━━━━━━\n` +
                `💰 Jami: *${totalAmount.toLocaleString()} so'm*\n` +
                `📊 Holat: ⏳ Kutilmoqda\n` +
                `💳 Joriy qarz: *${newDebtAfter.toLocaleString()} so'm*\n` +
                `\n/orders orqali kuzatib boring.`, { parse_mode: "Markdown" });
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.error(`Checkout failed for dealer ${dealer.id}: ${msg}`);
            await ctx.reply(t.checkoutFail);
        }
    }
    async sendMessage(botId, chatId, message) {
        const bot = this.bots.get(botId);
        if (!bot)
            return;
        try {
            await bot.telegram.sendMessage(chatId, message, {
                parse_mode: "Markdown",
            });
        }
        catch (e) {
            this.logger.error(`Failed to send external message for bot ${botId}: ${e.message}`);
        }
    }
    async broadcast(companyId, message) {
        const botRecord = await this.prisma.customBot.findFirst({
            where: { companyId, isActive: true, deletedAt: null },
        });
        if (!botRecord)
            return { sent: 0, failed: 0 };
        const bot = this.bots.get(botRecord.id);
        if (!bot)
            return { sent: 0, failed: 0 };
        const dealers = await this.prisma.dealer.findMany({
            where: { companyId, deletedAt: null, telegramChatId: { not: null } },
            select: { telegramChatId: true },
        });
        let sent = 0;
        let failed = 0;
        for (const dealer of dealers) {
            if (!dealer.telegramChatId)
                continue;
            try {
                await bot.telegram.sendMessage(dealer.telegramChatId, message, {
                    parse_mode: "Markdown",
                });
                sent++;
            }
            catch {
                failed++;
            }
        }
        return { sent, failed };
    }
    async sendOrderStatusUpdate(companyId, orderId, newStatus, dealerId) {
        const botRecord = await this.prisma.customBot.findFirst({
            where: { companyId, isActive: true, deletedAt: null },
        });
        if (!botRecord)
            return;
        const bot = this.bots.get(botRecord.id);
        if (!bot)
            return;
        const dealer = await this.prisma.dealer.findFirst({
            where: { id: dealerId, companyId },
            select: { telegramChatId: true, name: true },
        });
        if (!dealer?.telegramChatId)
            return;
        const statusEmoji = {
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
        const msg = `${emoji} *Buyurtma holati yangilandi*\n\n` +
            `📋 Buyurtma: *#${orderId.slice(-6).toUpperCase()}*\n` +
            `📊 Yangi holat: *${newStatus}*`;
        try {
            await bot.telegram.sendMessage(dealer.telegramChatId, msg, {
                parse_mode: "Markdown",
            });
        }
        catch (e) {
            this.logger.warn(`Could not notify dealer ${dealerId} of status update: ${e.message}`);
        }
    }
    async handleHelp(ctx, companyName) {
        const company = await this.prisma.company.findFirst({
            where: { name: companyName },
        });
        const t = this.getLangFromCtx(ctx);
        const isPremium = company?.subscriptionPlan === "PREMIUM";
        const watermark = isPremium ? "" : "\n\n⚡️ _Supplio.uz_";
        await ctx.reply(`ℹ️ *${companyName} Bot - ${t.helpTitle}*\n\n` +
            t.helpCommands +
            watermark, { parse_mode: "Markdown" });
    }
    async getDealerByChatId(ctx, companyId) {
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
    progressBar(percent) {
        const filled = Math.min(Math.round(percent / 10), 10);
        const empty = 10 - filled;
        return "█".repeat(filled) + "░".repeat(empty);
    }
    getBot(botId) {
        return this.bots.get(botId);
    }
    async ensureBotInitialized(botId) {
        const existing = this.bots.get(botId);
        if (existing)
            return existing;
        const botRecord = await this.prisma.customBot.findFirst({
            where: { id: botId, isActive: true, deletedAt: null },
            include: { company: true },
        });
        if (!botRecord)
            return undefined;
        await this.initBot(botRecord.id, botRecord.companyId, botRecord.token, botRecord.company?.name || botRecord.companyId);
        return this.bots.get(botId);
    }
    async validateToken(token) {
        try {
            const tempBot = new telegraf_1.Telegram(token);
            const botInfo = await Promise.race([
                tempBot.getMe(),
                new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), 10000)),
            ]);
            return {
                valid: true,
                botInfo: {
                    id: botInfo.id,
                    username: botInfo.username || "",
                    first_name: botInfo.first_name,
                },
            };
        }
        catch (err) {
            this.logger.warn(`Token validation failed for token ${token.slice(0, 5)}...: ${err.message}`);
            const isNetworkError = err.message === "TIMEOUT" ||
                !err.response ||
                err.code === "ECONNREFUSED" ||
                err.code === "ETIMEDOUT" ||
                err.code === "ENOTFOUND";
            return { valid: false, networkError: isNetworkError };
        }
    }
    getBotStatus(botId) {
        const bot = this.bots.get(botId);
        if (!bot)
            return "not_found";
        return "connected";
    }
    async getBotsForCompany(companyId) {
        return this.prisma.customBot.findMany({
            where: { companyId, deletedAt: null },
            orderBy: { createdAt: "desc" },
        });
    }
    async reloadCompanyBots(companyId) {
        const records = await this.prisma.customBot.findMany({
            where: { companyId, deletedAt: null, isActive: true },
            include: { company: true },
        });
        for (const record of records) {
            const existing = this.bots.get(record.id);
            if (existing) {
                try {
                    existing.stop();
                }
                catch { }
                this.bots.delete(record.id);
            }
            await this.initBot(record.id, record.companyId, record.token, record.company?.name || record.companyId);
        }
        return { reloaded: records.length };
    }
    async createBot(companyId, data) {
        if (!data.token?.trim()) {
            throw new common_1.BadRequestException("Bot token is required.");
        }
        await this.planLimits.checkBotLimit(companyId);
        const validation = await this.validateToken(data.token.trim());
        if (!validation.valid) {
            if (validation.networkError) {
                throw new common_1.BadRequestException("Cannot reach Telegram API to verify this token. Check server internet connectivity, then try again.");
            }
            throw new common_1.BadRequestException("Invalid Telegram bot token. Please get a valid token from @BotFather.");
        }
        const username = validation.botInfo?.username;
        const resolvedName = data.botName || validation.botInfo?.first_name || "Store Bot";
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
            this.logger.log(`Bot record created in DB: ${bot.id}. Initializing instance...`);
            try {
                const company = await this.prisma.company.findUnique({
                    where: { id: companyId },
                });
                if (!company) {
                    this.logger.error(`Company not found after creating bot record! ID: ${companyId}`);
                }
                else {
                    await this.initBot(bot.id, companyId, bot.token, company.name);
                }
            }
            catch (initErr) {
                this.logger.error(`Failed to execute initBot during creation: ${initErr.message}`);
            }
            return { ...bot, botInfo: validation.botInfo };
        }
        catch (e) {
            this.logger.error(`Error in createBot: ${e.message}`, e.stack);
            if (e.code === "P2002") {
                throw new common_1.BadRequestException("This bot token is already registered to another company.");
            }
            if (e.code === "P2003") {
                throw new common_1.BadRequestException("Foreign key constraint failed. Check if companyId is valid.");
            }
            throw e;
        }
    }
    async updateBot(id, companyId, data) {
        const bot = await this.prisma.customBot.findFirst({
            where: { id, companyId, deletedAt: null },
        });
        if (!bot)
            throw new Error("Bot not found");
        if (data.isActive === true && !bot.isActive) {
            const limits = await this.planLimits.getLimitsForCompany(companyId);
            if (!limits.allowCustomBot || limits.maxCustomBots <= 0) {
                throw new common_1.BadRequestException("Telegram bot is not available on your current plan. Please upgrade your tariff.");
            }
            const activeCount = await this.prisma.customBot.count({
                where: { companyId, deletedAt: null, isActive: true },
            });
            if (activeCount >= limits.maxCustomBots) {
                throw new common_1.BadRequestException(`Telegram bot limit reached. Your current plan allows up to ${limits.maxCustomBots}. Please upgrade your tariff.`);
            }
        }
        const updated = await this.prisma.customBot.update({ where: { id }, data });
        if (data.isActive === true || data.token) {
            const company = await this.prisma.company.findUnique({
                where: { id: companyId },
            });
            await this.initBot(updated.id, companyId, updated.token, company?.name ?? companyId);
        }
        else if (data.isActive === false) {
            const existing = this.bots.get(id);
            if (existing) {
                try {
                    existing.stop();
                }
                catch { }
                this.bots.delete(id);
            }
        }
        return updated;
    }
    async removeBot(id, companyId) {
        const bot = await this.prisma.customBot.findFirst({
            where: { id, companyId, deletedAt: null },
        });
        if (!bot)
            throw new Error("Bot not found");
        const existing = this.bots.get(id);
        if (existing) {
            try {
                await existing.telegram.deleteWebhook({ drop_pending_updates: true });
            }
            catch { }
            try {
                existing.stop();
            }
            catch { }
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
    async notifyDealerApprovalResult(companyId, dealerId, approved) {
        const botRecord = await this.prisma.customBot.findFirst({
            where: { companyId, isActive: true, deletedAt: null },
        });
        if (!botRecord)
            return;
        const bot = this.bots.get(botRecord.id);
        if (!bot)
            return;
        const dealer = await this.prisma.dealer.findFirst({
            where: { id: dealerId, companyId },
            select: { telegramChatId: true, name: true },
        });
        if (!dealer?.telegramChatId)
            return;
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
        const msgs = approved ? approvedMsgs : rejectedMsgs;
        const text = Object.values(msgs).join("\n\n────────────\n\n");
        try {
            await bot.telegram.sendMessage(dealer.telegramChatId, text, {
                parse_mode: "Markdown",
            });
        }
        catch (e) {
            this.logger.warn(`Could not notify dealer ${dealerId} of approval result: ${e.message}`);
        }
    }
    async stopAll() {
        for (const [id, bot] of this.bots) {
            bot.stop("shutdown");
        }
        this.bots.clear();
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = TelegramService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        telegram_logger_service_1.TelegramLoggerService,
        plan_limits_service_1.PlanLimitsService])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map