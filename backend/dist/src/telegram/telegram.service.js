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
                notRegistered: "❌ Siz bu kompaniyada diler sifatida ro'yxatdan o'tmagansiz.\nIltimos, kompaniya distribyutoriga murojaat qiling.",
                loginSuccess: " botga ulandi.",
                pendingApproval: "⏳ Sizning so'rovingiz ko'rib chiqilmoqda. Distributor tasdiqlashini kuting.",
                approvalSent: "✅ Ro'yxatdan o'tish so'rovingiz shu kompaniya distribyutoriga yuborildi.\n⏳ Tasdiqlash kutilyapti. Xabar beriladi.",
                accessDenied: "⛔ Bu botdan foydalanish uchun ushbu kompaniyada diler sifatida tasdiqlangan bo'lishingiz kerak.\nDistributor bilan bog'laning.",
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
                notRegistered: "❌ Сиз ушбу компанияда дилер сифатида рўйхатдан ўтмагансиз.\nИлтимос, компания дистрибьютори билан боғланинг.",
                loginSuccess: " муваффақиятли тизимга кирдингиз!",
                pendingApproval: "⏳ Сизнинг сўровингиз кўриб чиқилмоқда. Дистрибьютор тасдиқлашини кутинг.",
                approvalSent: "✅ Рўйхатдан ўтиш сўровингиз шу компания дистрибьюторига юборилди.\n⏳ Тасдиқлаш кутиляпти. Хабар берилади.",
                accessDenied: "⛔ Бу ботдан фойдаланиш учун ушбу компанияда дилер сифатида тасдиқланган бўлишингиз керак.\nДистрибьютор билан боғланинг.",
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
                notRegistered: "❌ Вы не зарегистрированы как дилер в этой компании.\nПожалуйста, свяжитесь с дистрибьютором компании.",
                loginSuccess: " бот подключен.",
                pendingApproval: "⏳ Ваша заявка рассматривается. Ожидайте подтверждения от дистрибьютора.",
                approvalSent: "✅ Ваша заявка на регистрацию отправлена дистрибьютору этой компании.\n⏳ Ожидайте подтверждения. Мы уведомим вас.",
                accessDenied: "⛔ Для использования этого бота вы должны быть подтверждены как дилер этой компании.\nСвяжитесь с дистрибьютором.",
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
                notRegistered: "❌ Bu şirkette bayi olarak kayıtlı değilsiniz.\nLütfen şirket distribütörüyle iletişime geçin.",
                loginSuccess: " bot bağlı.",
                pendingApproval: "⏳ Başvurunuz inceleniyor. Distribütörün onayını bekleyin.",
                approvalSent: "✅ Kayıt başvurunuz bu şirketin distribütörüne gönderildi.\n⏳ Onay bekleniyor. Size haber verilecek.",
                accessDenied: "⛔ Bu botu kullanabilmek için bu şirkette bayi olarak onaylı olmanız gerekir.\nDistribütörünüzle iletişime geçin.",
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
                notRegistered: "❌ You are not registered as a dealer in this company.\nPlease contact the company distributor.",
                loginSuccess: " bot connected.",
                pendingApproval: "⏳ Your request is under review. Please wait for the distributor's approval.",
                approvalSent: "✅ Your registration request has been sent to this company's distributor.\n⏳ Awaiting approval. We will notify you.",
                accessDenied: "⛔ To use this bot, you must be approved as a dealer in this company.\nContact your distributor.",
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
        const chatId = String(ctx.chat?.id ??
            ctx.callbackQuery?.message?.chat?.id ??
            ctx.callbackQuery?.from?.id ??
            ctx.from?.id ??
            "");
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
    isWithinWorkingHours(workingHoursJson, botPaused, botAutoSchedule) {
        if (botPaused)
            return false;
        if (!botAutoSchedule || !workingHoursJson)
            return true;
        try {
            const schedule = JSON.parse(workingHoursJson);
            const tzDate = new Date(Date.now() + 5 * 60 * 60 * 1000);
            const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
            const dayKey = days[tzDate.getUTCDay()];
            const day = schedule[dayKey];
            if (!day || !day.active)
                return false;
            const h = tzDate.getUTCHours().toString().padStart(2, "0");
            const m = tzDate.getUTCMinutes().toString().padStart(2, "0");
            const now = `${h}:${m}`;
            return now >= day.open && now < day.close;
        }
        catch {
            return true;
        }
    }
    buildWorkingHoursText(workingHoursJson, lang) {
        if (!workingHoursJson)
            return "";
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
            const off = lang === "ru" ? "Выходной" : lang === "en" ? "Closed" : "Dam olish";
            return days
                .map((d) => {
                const day = schedule[d.key];
                if (!day)
                    return null;
                const label = lang === "ru" ? d.ru : lang === "en" ? d.en : d.uz;
                return day.active
                    ? `${label}: ${day.open} – ${day.close}`
                    : `${label}: ${off}`;
            })
                .filter(Boolean)
                .join("\n");
        }
        catch {
            return workingHoursJson;
        }
    }
    buildClosedMessage(company, lang) {
        const title = lang === "ru"
            ? "🔒 *Магазин временно закрыт*"
            : lang === "en"
                ? "🔒 *Store is temporarily closed*"
                : "🔒 *Do'kon vaqtincha yopiq*";
        let msg = title;
        const hoursText = this.buildWorkingHoursText(company?.workingHours, lang);
        if (hoursText) {
            const label = lang === "ru"
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
            bot.catch(async (err, ctx) => {
                const msg = err instanceof Error ? err.message : String(err);
                this.logger.error(`[Bot ${botId}] Unhandled error: ${msg}`);
                try {
                    await ctx.reply("⚠️ Xatolik yuz berdi. Qaytadan /start bosing yoki keyinroq urinib ko'ring.");
                }
                catch { }
            });
            bot.use(async (ctx, next) => {
                const text = ctx.message?.text ?? "";
                const callbackData = ctx.callbackQuery?.data ?? "";
                if (text.startsWith("/start") ||
                    text.startsWith("/info") ||
                    callbackData.startsWith("lang:") ||
                    callbackData.startsWith("admin:")) {
                    return next();
                }
                const company = await this.prisma.company.findUnique({
                    where: { id: companyId },
                });
                if (this.isWithinWorkingHours(company?.workingHours, company?.botPaused, company?.botAutoSchedule)) {
                    return next();
                }
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
                    if (isAdmin)
                        return next();
                }
                const lang = this.chatLangPrefs.get(chatId) ?? "uz";
                return ctx.reply?.(this.buildClosedMessage(company, lang), {
                    parse_mode: "Markdown",
                });
            });
            bot.start(async (ctx) => {
                const company = await this.prisma.company.findUnique({
                    where: { id: companyId },
                });
                const chatId = String(ctx.chat.id);
                if (this.isCompanyAccessBlocked(company)) {
                    const t = this.getLangFromCtx(ctx);
                    return ctx.reply(t.suspended);
                }
                let existingDealer = await this.prisma.dealer.findFirst({
                    where: { telegramChatId: chatId, companyId, deletedAt: null },
                });
                if (!existingDealer) {
                    const otherDealer = await this.prisma.dealer.findFirst({
                        where: {
                            telegramChatId: chatId,
                            deletedAt: null,
                            NOT: { companyId },
                        },
                    });
                    if (otherDealer) {
                        const sameInThisCompany = await this.prisma.dealer.findFirst({
                            where: {
                                phone: { endsWith: otherDealer.phone.slice(-9) },
                                companyId,
                                deletedAt: null,
                            },
                        });
                        if (sameInThisCompany) {
                            await this.prisma.dealer.update({
                                where: { id: sameInThisCompany.id },
                                data: { telegramChatId: chatId },
                            });
                            existingDealer = { ...sameInThisCompany, telegramChatId: chatId };
                        }
                    }
                }
                if (!this.chatLangPrefs.has(chatId)) {
                    if (existingDealer) {
                        const code = ctx.from?.language_code ?? "uz";
                        let lang = "uz";
                        if (code.startsWith("ru"))
                            lang = "ru";
                        else if (code.startsWith("tr"))
                            lang = "tr";
                        else if (code.startsWith("en"))
                            lang = "en";
                        this.chatLangPrefs.set(chatId, lang);
                    }
                    else {
                        await ctx.reply("Tilni tanlang / Выберите язык / Choose language", {
                            reply_markup: this.buildLanguageKeyboard(),
                        });
                        return;
                    }
                }
                const t = this.getLangFromCtx(ctx);
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
                    catch (err) {
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
                            }
                            else {
                                dealer = existing;
                            }
                        }
                        else {
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
                        return ctx.reply("Bu kompaniya uchun filial topilmadi. Distributor bilan bog'laning.", { reply_markup: { remove_keyboard: true } });
                    }
                    const suggestedName = `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
                        `Dealer ${phone.slice(-4)}`;
                    const approvedElsewhere = await this.prisma.dealer.findFirst({
                        where: {
                            phone: { endsWith: phone.slice(-9) },
                            isApproved: true,
                            deletedAt: null,
                            NOT: { companyId },
                        },
                    });
                    const autoApprove = !!approvedElsewhere;
                    try {
                        dealer = await this.prisma.dealer.create({
                            data: {
                                companyId,
                                branchId: branch.id,
                                name: suggestedName,
                                phone: `+${phone}`,
                                telegramChatId: chatId,
                                isApproved: autoApprove,
                            },
                        });
                    }
                    catch (err) {
                        if (err?.code === "P2002") {
                            const existing = await this.prisma.dealer.findFirst({
                                where: { phone: { contains: phone.slice(-9) }, companyId },
                            });
                            if (existing?.deletedAt) {
                                dealer = await this.prisma.dealer.update({
                                    where: { id: existing.id },
                                    data: {
                                        deletedAt: null,
                                        isApproved: autoApprove || existing.isApproved,
                                        telegramChatId: chatId,
                                    },
                                });
                            }
                            else {
                                dealer = existing;
                            }
                        }
                        else {
                            throw err;
                        }
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
                        await bot.telegram.callApi("setChatMenuButton", {
                            chat_id: ctx.chat.id,
                            menu_button: {
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
            bot.command("info", async (ctx) => {
                const lang = this.chatLangPrefs.get(String(ctx.chat.id)) ?? "uz";
                const company = await this.prisma.company.findUnique({
                    where: { id: companyId },
                });
                const open = this.isWithinWorkingHours(company?.workingHours, company?.botPaused, company?.botAutoSchedule);
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
                const hoursText = this.buildWorkingHoursText(company?.workingHours, lang);
                if (hoursText) {
                    const label = lang === "ru"
                        ? "🕐 *Часы работы:*"
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
                return ctx.reply(msg, { parse_mode: "Markdown" });
            });
            bot.command("chatid", async (ctx) => {
                const id = String(ctx.chat.id);
                const type = ctx.chat.type;
                await ctx.reply(`🆔 *Chat ID:* \`${id}\`\n📌 Tur: ${type}\n\nBu ID ni bot sozlamalarida "Guruh Chat ID" maydoniga kiriting.`, { parse_mode: "Markdown" });
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
            bot.on("callback_query", async (ctx) => await this.handleCallback(ctx, companyId));
            bot.on("text", async (ctx) => {
                try {
                    const chatId = String(ctx.chat.id);
                    const t = this.getLangFromCtx(ctx);
                    const dealer = await this.prisma.dealer.findFirst({
                        where: { telegramChatId: chatId, companyId, deletedAt: null, isApproved: true, isBlocked: false },
                    });
                    if (!dealer) {
                        return ctx.reply(t.startOver);
                    }
                    await ctx.reply(`📋 ${dealer.name}`, {
                        reply_markup: this.buildMainMenuKeyboard(t),
                    });
                }
                catch { }
            });
            try {
                const [company, limits] = await Promise.all([
                    this.prisma.company.findUnique({ where: { id: companyId } }),
                    this.planLimits.getLimitsForCompany(companyId),
                ]);
                if (limits.allowWebStore) {
                    const storeUrl = `${this.getPublicStoreBaseUrl()}/store/${company?.slug || companyId}`;
                    await bot.telegram.callApi("setChatMenuButton", {
                        menu_button: {
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
    async handleDebt(ctx, companyId, editMsg = false) {
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
        const text = `💰 *${dealer.name}*\n\n` +
            `${t.debtTitle}: *${debt.toLocaleString()} so'm*\n` +
            `${t.limitTitle}: *${limit > 0 ? limit.toLocaleString() + " so'm" : "Cheksiz"}*\n\n` +
            `${limit > 0 ? bar + " " + ratio + "%\n\n" : ""}` +
            `${debt > 0 && limit > 0 && debt > limit ? t.overLimit : limit > 0 ? t.withinLimit : ""}` +
            cashbackLine;
        const backOpts = {
            inline_keyboard: [[{ text: "🔙 Menyu", callback_data: "menu:back" }]],
        };
        if (editMsg) {
            try {
                await ctx.editMessageText(text, {
                    parse_mode: "Markdown",
                    reply_markup: backOpts,
                });
                return;
            }
            catch { }
        }
        await ctx.reply(text, { parse_mode: "Markdown", reply_markup: backOpts });
    }
    async handleProducts(ctx, companyId, page = 0) {
        const dealer = await this.getDealerByChatId(ctx, companyId);
        if (!dealer)
            return;
        const t = this.getLangFromCtx(ctx);
        const PAGE_SIZE = 5;
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where: { companyId, deletedAt: null, stock: { gt: 0 } },
                orderBy: { name: "asc" },
                skip: page * PAGE_SIZE,
                take: PAGE_SIZE,
            }),
            this.prisma.product.count({
                where: { companyId, deletedAt: null, stock: { gt: 0 } },
            }),
        ]);
        const backOpts = {
            inline_keyboard: [[{ text: "🔙 Menyu", callback_data: "menu:back" }]],
        };
        if (total === 0) {
            try {
                await ctx.editMessageText(t.noProducts, { reply_markup: backOpts });
            }
            catch {
                await ctx.reply(t.noProducts, { reply_markup: backOpts });
            }
            return;
        }
        const totalPages = Math.ceil(total / PAGE_SIZE);
        const from = page * PAGE_SIZE + 1;
        const to = Math.min((page + 1) * PAGE_SIZE, total);
        let msg = `📦 *Mahsulotlar* (${from}–${to} / ${total}):\n\n`;
        const productButtons = [];
        products.forEach((p, i) => {
            const num = page * PAGE_SIZE + i + 1;
            const effectivePrice = p.discountPrice ?? p.price;
            const isPromo = p.isPromo && p.discountPrice;
            msg += `*${num}. ${p.name}*${isPromo ? " 🔥" : ""}\n`;
            msg += `   💵 ${effectivePrice.toLocaleString()} so'm / ${p.unit} | 📦 ${p.stock} ${p.unit}\n\n`;
            productButtons.push([
                { text: `${num}. ${t.addToCart} (+1)`, callback_data: `add:${p.id}:1` },
                { text: "+5", callback_data: `add:${p.id}:5` },
                { text: "+10", callback_data: `add:${p.id}:10` },
            ]);
        });
        const navRow = [];
        if (page > 0)
            navRow.push({ text: "◀️ Oldingi", callback_data: `prod:page:${page - 1}` });
        navRow.push({ text: `${page + 1}/${totalPages}`, callback_data: "noop" });
        if (page < totalPages - 1)
            navRow.push({ text: "Keyingi ▶️", callback_data: `prod:page:${page + 1}` });
        const keyboard = [
            ...productButtons,
            navRow,
            [
                { text: t.kbdCart || "🛒 Savat", callback_data: "menu:cart" },
                { text: "🔙 Menyu", callback_data: "menu:back" },
            ],
        ];
        const msgOpts = {
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: keyboard },
        };
        try {
            await ctx.editMessageText(msg, msgOpts);
        }
        catch {
            await ctx.reply(msg, msgOpts);
        }
    }
    async handleOrders(ctx, companyId, editMsg = false) {
        const dealer = await this.getDealerByChatId(ctx, companyId);
        if (!dealer)
            return;
        const t = this.getLangFromCtx(ctx);
        const orders = await this.prisma.order.findMany({
            where: { dealerId: dealer.id, companyId, deletedAt: null },
            take: 5,
            orderBy: { createdAt: "desc" },
        });
        const backOpts = {
            inline_keyboard: [[{ text: "🔙 Menyu", callback_data: "menu:back" }]],
        };
        if (orders.length === 0) {
            if (editMsg) {
                try {
                    await ctx.editMessageText(t.noOrders, {
                        reply_markup: backOpts,
                    });
                    return;
                }
                catch { }
            }
            return ctx.reply(t.noOrders, { reply_markup: backOpts });
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
        if (editMsg) {
            try {
                await ctx.editMessageText(msg, {
                    parse_mode: "Markdown",
                    reply_markup: backOpts,
                });
                return;
            }
            catch { }
        }
        await ctx.reply(msg, { parse_mode: "Markdown", reply_markup: backOpts });
    }
    async handlePayments(ctx, companyId, editMsg = false) {
        const dealer = await this.getDealerByChatId(ctx, companyId);
        if (!dealer)
            return;
        const t = this.getLangFromCtx(ctx);
        const payments = await this.prisma.payment.findMany({
            where: { dealerId: dealer.id, companyId, deletedAt: null },
            take: 10,
            orderBy: { createdAt: "desc" },
        });
        const backOpts = {
            inline_keyboard: [[{ text: "🔙 Menyu", callback_data: "menu:back" }]],
        };
        if (payments.length === 0) {
            if (editMsg) {
                try {
                    await ctx.editMessageText(t.noPayments, {
                        reply_markup: backOpts,
                    });
                    return;
                }
                catch { }
            }
            return ctx.reply(t.noPayments, { reply_markup: backOpts });
        }
        let msg = `${t.recentPayments}\n\n`;
        for (const p of payments) {
            const date = p.createdAt.toLocaleDateString("uz-UZ");
            msg += `🔹 *${p.amount.toLocaleString()} so'm*\n`;
            msg += `   📅 ${date} | 💳 ${p.method}\n\n`;
        }
        if (editMsg) {
            try {
                await ctx.editMessageText(msg, {
                    parse_mode: "Markdown",
                    reply_markup: backOpts,
                });
                return;
            }
            catch { }
        }
        await ctx.reply(msg, { parse_mode: "Markdown", reply_markup: backOpts });
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
        const safeAnswer = async (text, showAlert = false) => {
            try {
                await ctx.answerCbQuery(text ?? "", { show_alert: showAlert });
            }
            catch { }
        };
        try {
            const data = query.data;
            const chatId = this.resolveChatId(ctx);
            const t = this.getLangFromCtx(ctx);
            if (data === "noop") {
                await safeAnswer();
                return;
            }
            if (data.startsWith("lang:set:")) {
                await safeAnswer();
                const lang = data.split(":")[2] || "uz";
                const allowed = ["uz", "ru", "tr", "en"];
                const safeLang = allowed.includes(lang) ? lang : "uz";
                this.chatLangPrefs.set(chatId, safeLang);
                const langT = this.translations[safeLang] ?? this.translations["uz"];
                const langCompany = await this.prisma.company.findUnique({ where: { id: companyId } });
                if (!langCompany || this.isCompanyAccessBlocked(langCompany)) {
                    await ctx.reply(langT.suspended);
                    return;
                }
                let langDealer = await this.prisma.dealer.findFirst({
                    where: { telegramChatId: chatId, companyId, deletedAt: null },
                });
                if (!langDealer) {
                    const otherDealer = await this.prisma.dealer.findFirst({
                        where: { telegramChatId: chatId, deletedAt: null, NOT: { companyId } },
                    });
                    if (otherDealer) {
                        const sameHere = await this.prisma.dealer.findFirst({
                            where: { phone: { endsWith: otherDealer.phone.slice(-9) }, companyId, deletedAt: null },
                        });
                        if (sameHere) {
                            await this.prisma.dealer.update({ where: { id: sameHere.id }, data: { telegramChatId: chatId } });
                            langDealer = { ...sameHere, telegramChatId: chatId };
                        }
                    }
                }
                if (langDealer) {
                    if (langDealer.isBlocked) {
                        await ctx.reply(langT.blocked);
                        return;
                    }
                    if (!langDealer.isApproved) {
                        const pending = await this.prisma.dealerApprovalRequest.findFirst({
                            where: { dealerId: langDealer.id, status: "PENDING" },
                        });
                        await ctx.reply(pending ? langT.pendingApproval : langT.accessDenied);
                        return;
                    }
                    const limits = await this.planLimits.getLimitsForCompany(companyId);
                    const storeUrl = `${this.getPublicStoreBaseUrl()}/store/${langCompany.slug || companyId}`;
                    await ctx.reply(`👋 *${langDealer.name}*${langT.loginSuccess}${langT.commands}`, { parse_mode: "Markdown", reply_markup: this.buildMainMenuKeyboard(langT) });
                    if (limits.allowWebStore) {
                        await ctx.reply(`🛍 ${langCompany.name}`, {
                            reply_markup: {
                                inline_keyboard: [[{ text: "🛍 Online do'kon", web_app: { url: storeUrl } }]],
                            },
                        });
                    }
                }
                else {
                    await ctx.reply(`🏢 *${langCompany.name}*\n\n${langT.welcome}`, {
                        parse_mode: "Markdown",
                        reply_markup: {
                            keyboard: [[{ text: langT.sendPhone, request_contact: true }]],
                            resize_keyboard: true,
                            one_time_keyboard: true,
                        },
                    });
                }
                return;
            }
            if (data.startsWith("menu:")) {
                await safeAnswer();
                const action = data.split(":")[1];
                if (action === "products")
                    await this.handleProducts(ctx, companyId);
                if (action === "cart")
                    await this.handleCart(ctx, companyId);
                if (action === "orders")
                    await this.handleOrders(ctx, companyId, true);
                if (action === "debt")
                    await this.handleDebt(ctx, companyId, true);
                if (action === "payments")
                    await this.handlePayments(ctx, companyId, true);
                if (action === "lang") {
                    try {
                        await ctx.editMessageText("Tilni tanlang / Выберите язык / Choose language", { reply_markup: this.buildLanguageKeyboard() });
                    }
                    catch {
                        await ctx.reply("Tilni tanlang / Выберите язык / Choose language", {
                            reply_markup: this.buildLanguageKeyboard(),
                        });
                    }
                }
                if (action === "back") {
                    const t = this.getLangFromCtx(ctx);
                    const dealer = await this.prisma.dealer.findFirst({
                        where: {
                            telegramChatId: chatId,
                            companyId,
                            deletedAt: null,
                            isApproved: true,
                        },
                    });
                    const name = dealer?.name || "";
                    try {
                        await ctx.editMessageText(`👋 *${name}*${t.loginSuccess}${t.commands}`, {
                            parse_mode: "Markdown",
                            reply_markup: this.buildMainMenuKeyboard(t),
                        });
                    }
                    catch {
                        await ctx.reply(`👋 *${name}*${t.loginSuccess}`, {
                            parse_mode: "Markdown",
                            reply_markup: this.buildMainMenuKeyboard(t),
                        });
                    }
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
            if (data.startsWith("prod:page:")) {
                await safeAnswer();
                const pageNum = parseInt(data.split(":")[2], 10) || 0;
                await this.handleProducts(ctx, companyId, pageNum);
                return;
            }
            if (data.startsWith("admin:")) {
                await safeAnswer();
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
                const dealer = await this.prisma.dealer.findFirst({
                    where: { telegramChatId: chatId, companyId, deletedAt: null },
                });
                if (!dealer || !dealer.isApproved || dealer.isBlocked) {
                    await safeAnswer(t.accessDenied, true);
                    return;
                }
                const [, productId, qtyStr] = data.split(":");
                const qty = parseInt(qtyStr, 10) || 1;
                const product = await this.prisma.product.findFirst({
                    where: { id: productId, companyId, deletedAt: null },
                });
                if (!product) {
                    await safeAnswer("❌ Mahsulot topilmadi", true);
                    return;
                }
                const cart = this.getCart(companyId, chatId);
                cart.set(productId, (cart.get(productId) || 0) + qty);
                const cartTotal = Array.from(cart.values()).reduce((s, q) => s + q, 0);
                await safeAnswer(`✅ +${qty} ta | 🛒 Jami: ${cartTotal} ta`);
                return;
            }
            if (data.startsWith("remove:")) {
                const productId = data.split(":")[1];
                const cart = this.getCart(companyId, chatId);
                cart.delete(productId);
                await safeAnswer(t.cartRemoved);
                await this.handleCart(ctx, companyId, true);
                return;
            }
            if (data === "clear_cart") {
                this.clearCart(companyId, chatId);
                await safeAnswer(t.cartCleared);
                await this.handleCart(ctx, companyId, true);
                return;
            }
            if (data === "checkout") {
                await safeAnswer();
                await this.handleCheckoutByChat(ctx, companyId, chatId);
                return;
            }
            await safeAnswer();
        }
        catch (err) {
            this.logger.error(`handleCallback error: ${err?.message}`);
            try {
                await ctx.answerCbQuery();
            }
            catch { }
            try {
                await ctx.reply("⚠️ Xatolik yuz berdi. Qaytadan urinib ko'ring.");
            }
            catch { }
        }
    }
    async handleCart(ctx, companyId, editMsg = false) {
        const dealer = await this.getDealerByChatId(ctx, companyId);
        if (!dealer)
            return;
        const chatId = this.resolveChatId(ctx);
        const t = this.getLangFromCtx(ctx);
        const cart = this.getCart(companyId, chatId);
        const backOpts = {
            inline_keyboard: [
                [
                    { text: t.kbdProducts || "📦 Mahsulotlar", callback_data: "menu:products" },
                    { text: "🔙 Menyu", callback_data: "menu:back" },
                ],
            ],
        };
        if (cart.size === 0) {
            if (editMsg) {
                try {
                    await ctx.editMessageText(t.cartEmpty, { reply_markup: backOpts });
                    return;
                }
                catch { }
            }
            return ctx.reply(t.cartEmpty, { reply_markup: backOpts });
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
        const msgOpts = {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    ...removeButtons.map((btn) => [btn]),
                    [
                        { text: t.cartClear, callback_data: "clear_cart" },
                        { text: t.cartCheckout, callback_data: "checkout" },
                    ],
                    [{ text: "🔙 Menyu", callback_data: "menu:back" }],
                ],
            },
        };
        if (editMsg) {
            try {
                await ctx.editMessageText(msg, msgOpts);
                return;
            }
            catch { }
        }
        await ctx.reply(msg, msgOpts);
    }
    async handleCheckout(ctx, companyId) {
        const dealer = await this.getDealerByChatId(ctx, companyId);
        if (!dealer)
            return;
        await this.handleCheckoutByChat(ctx, companyId, this.resolveChatId(ctx));
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
                `💳 Joriy qarz: *${newDebtAfter.toLocaleString()} so'm*`, {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: t.kbdOrders || "📋 Buyurtmalarim", callback_data: "menu:orders" },
                            { text: "🔙 Menyu", callback_data: "menu:back" },
                        ],
                    ],
                },
            });
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.error(`Checkout failed for dealer ${dealer.id}: ${msg}`);
            try {
                await ctx.reply(t.checkoutFail, {
                    reply_markup: {
                        inline_keyboard: [[{ text: "🔙 Menyu", callback_data: "menu:back" }]],
                    },
                });
            }
            catch { }
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
    async sendOrderStatusUpdate(companyId, orderId, newStatus, dealerId, subStatus) {
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
        let msg = `${emoji} *Buyurtma holati yangilandi*\n\n` +
            `📋 Buyurtma: *#${orderId.slice(-6).toUpperCase()}*\n` +
            `📊 Yangi holat: *${newStatus}*`;
        if (subStatus) {
            msg += `\n📝 Izoh: *${subStatus}*`;
        }
        try {
            await bot.telegram.sendMessage(dealer.telegramChatId, msg, {
                parse_mode: "Markdown",
            });
        }
        catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            this.logger.warn(`Could not notify dealer ${dealerId} of status update: ${message}`);
        }
    }
    async handleHelp(ctx, companyName) {
        const company = await this.prisma.company.findFirst({
            where: { name: companyName },
        });
        const t = this.getLangFromCtx(ctx);
        const isPremium = company?.subscriptionPlan === "PREMIUM";
        const watermark = isPremium ? "" : "\n\n⚡️ supplio.uz yordamida yaratildi.";
        await ctx.reply(`ℹ️ *${companyName} Bot - ${t.helpTitle}*\n\n` +
            t.helpCommands +
            watermark, { parse_mode: "Markdown" });
    }
    resolveChatId(ctx) {
        return String(ctx.chat?.id ??
            ctx.callbackQuery?.message?.chat?.id ??
            ctx.callbackQuery?.from?.id ??
            ctx.from?.id ??
            "");
    }
    async applyBotBranding(botToken, companyId) {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
        });
        if (!company)
            return;
        const tg = new telegraf_1.Telegram(botToken);
        const storeUrl = `${this.getPublicStoreBaseUrl()}/store/${company.slug || companyId}`;
        const name = company.name || "Supplio Bot";
        const descriptionUz = `🏢 ${name}\n\n` +
            `📦 Mahsulotlar ro'yxati\n` +
            `🛒 Savatga mahsulot qo'shish\n` +
            `📋 Buyurtmalarni kuzatish\n` +
            `💰 Qarz va to'lovlar tarixi\n\n` +
            `🌐 Online do'kon: ${storeUrl}\n\n` +
            `⚡️ supplio.uz — B2B Distributsiya Platformasi`;
        const shortDescUz = `${name} rasmiy boti — dilerlar uchun buyurtma tizimi. ⚡️ supplio.uz`;
        const commands = [
            { command: "start", description: "🚀 Boshlash / Start" },
            { command: "menu", description: "📋 Bosh menyu" },
            { command: "products", description: "📦 Mahsulotlar" },
            { command: "cart", description: "🛒 Savat" },
            { command: "orders", description: "📋 Buyurtmalarim" },
            { command: "debt", description: "💰 Qarzim" },
            { command: "payments", description: "💸 To'lovlarim" },
            { command: "info", description: "ℹ️ Kompaniya ma'lumotlari" },
            { command: "help", description: "❓ Yordam" },
        ];
        const results = {};
        try {
            await tg.callApi("setMyName", { name });
            results.name = "ok";
        }
        catch (e) {
            results.name = e?.message ?? "err";
        }
        try {
            await tg.callApi("setMyDescription", { description: descriptionUz });
            results.description = "ok";
        }
        catch (e) {
            results.description = e?.message ?? "err";
        }
        try {
            await tg.callApi("setMyShortDescription", { short_description: shortDescUz });
            results.shortDescription = "ok";
        }
        catch (e) {
            results.shortDescription = e?.message ?? "err";
        }
        try {
            await tg.callApi("setMyCommands", { commands });
            results.commands = "ok";
        }
        catch (e) {
            results.commands = e?.message ?? "err";
        }
        try {
            const appBase = (process.env.APP_URL || "http://localhost:5000").replace(/\/+$/, "");
            const logoPath = company.logo
                ? String(company.logo)
                : null;
            const logoUrl = logoPath
                ? (logoPath.startsWith("http") ? logoPath : `${appBase}${logoPath}`)
                : `${appBase}/public/supplio-logo.png`;
            const resp = await fetch(logoUrl);
            if (resp.ok) {
                const buf = Buffer.from(await resp.arrayBuffer());
                await tg.setMyPhoto({ source: buf });
                results.photo = "ok";
            }
        }
        catch (e) {
            results.photo = e?.message ?? "err";
        }
        try {
            await tg.callApi("setChatMenuButton", {
                menu_button: {
                    type: "web_app",
                    text: "🛍 Web Do'kon",
                    web_app: { url: storeUrl },
                },
            });
            results.menuButton = "ok";
        }
        catch (e) {
            results.menuButton = e?.message ?? "err";
        }
        this.logger.log(`Bot branding applied for ${name}: ${JSON.stringify(results)}`);
        return results;
    }
    async getDealerByChatId(ctx, companyId) {
        const chatId = this.resolveChatId(ctx);
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
        const clamped = Math.max(0, Math.min(100, percent));
        const filled = Math.round(clamped / 10);
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
    async stopRunningBot(botId) {
        const existing = this.bots.get(botId);
        if (!existing)
            return;
        try {
            existing.stop();
        }
        catch { }
        this.bots.delete(botId);
    }
    clearCompanyRuntimeState(companyId) {
        this.carts.delete(companyId);
    }
    clearGlobalRuntimeState() {
        this.carts.clear();
        this.chatLangPrefs.clear();
    }
    async getBotsForCompany(companyId) {
        return this.prisma.customBot.findMany({
            where: { companyId, deletedAt: null },
            orderBy: { createdAt: "desc" },
        });
    }
    async reloadCompanyBots(companyId) {
        this.clearCompanyRuntimeState(companyId);
        const records = await this.prisma.customBot.findMany({
            where: { companyId, deletedAt: null, isActive: true },
            include: { company: true },
        });
        for (const record of records) {
            await this.stopRunningBot(record.id);
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
                    this.applyBotBranding(bot.token, companyId).catch((e) => this.logger.warn(`applyBotBranding failed: ${e?.message}`));
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
                const stale = await this.prisma.customBot.findFirst({
                    where: { token: data.token.trim() },
                });
                if (stale) {
                    if (stale.companyId === companyId || stale.deletedAt) {
                        const restored = await this.prisma.customBot.update({
                            where: { id: stale.id },
                            data: {
                                companyId,
                                deletedAt: null,
                                isActive: true,
                                botName: data.botName || validation.botInfo?.first_name || stale.botName || "Store Bot",
                                username: validation.botInfo?.username || stale.username,
                                description: data.description ?? stale.description,
                            },
                        });
                        const company = await this.prisma.company.findUnique({ where: { id: companyId } });
                        if (company) {
                            await this.initBot(restored.id, companyId, restored.token, company.name);
                            this.applyBotBranding(restored.token, companyId).catch(() => { });
                        }
                        return { ...restored, botInfo: validation.botInfo };
                    }
                    throw new common_1.BadRequestException("This bot token is already registered to another company.");
                }
                throw new common_1.BadRequestException("Bot token conflict. Please try again.");
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
            throw new common_1.NotFoundException("Bot not found");
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
        if (data.isActive === false) {
            const existing = this.bots.get(id);
            if (existing) {
                try {
                    existing.stop();
                }
                catch { }
                this.bots.delete(id);
            }
        }
        else if (updated.isActive) {
            const company = await this.prisma.company.findUnique({ where: { id: companyId } });
            if (data.token || data.isActive === true) {
                await this.initBot(updated.id, companyId, updated.token, company?.name ?? companyId);
            }
            this.applyBotBranding(updated.token, companyId).catch((e) => this.logger.warn(`applyBotBranding failed on update: ${e?.message}`));
        }
        return updated;
    }
    async removeBot(id, companyId) {
        const bot = await this.prisma.customBot.findFirst({
            where: { id, companyId, deletedAt: null },
        });
        if (!bot)
            throw new common_1.NotFoundException("Bot not found");
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
        else {
            try {
                const temp = new telegraf_1.Telegraf(bot.token);
                await temp.telegram.deleteWebhook({ drop_pending_updates: true });
            }
            catch { }
        }
        await this.prisma.customBot.delete({ where: { id } });
        return { success: true };
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
    async adminReloadBot(botId) {
        const bot = await this.prisma.customBot.findFirst({
            where: { id: botId, deletedAt: null },
            include: { company: true },
        });
        if (!bot)
            throw new common_1.NotFoundException("Bot not found");
        this.clearCompanyRuntimeState(bot.companyId);
        await this.stopRunningBot(botId);
        if (bot.isActive) {
            await this.initBot(bot.id, bot.companyId, bot.token, bot.company?.name ?? bot.companyId);
        }
        return { success: true, status: this.getBotStatus(botId) };
    }
    async adminReloadAllBots() {
        const activeBots = await this.prisma.customBot.findMany({
            where: { deletedAt: null, isActive: true },
            include: { company: { select: { id: true, name: true } } },
            orderBy: { createdAt: "desc" },
        });
        this.clearGlobalRuntimeState();
        for (const [botId] of Array.from(this.bots.entries())) {
            await this.stopRunningBot(botId);
        }
        for (const bot of activeBots) {
            await this.initBot(bot.id, bot.companyId, bot.token, bot.company?.name ?? bot.companyId);
        }
        return { success: true, reloaded: activeBots.length };
    }
    async adminHardDeleteBot(botId) {
        const bot = await this.prisma.customBot.findFirst({
            where: { id: botId },
        });
        if (!bot)
            throw new common_1.NotFoundException("Bot not found");
        const existing = this.bots.get(botId);
        if (existing) {
            try {
                await existing.telegram.deleteWebhook({ drop_pending_updates: true });
            }
            catch { }
        }
        else {
            try {
                const temp = new telegraf_1.Telegraf(bot.token);
                await temp.telegram.deleteWebhook({ drop_pending_updates: true });
            }
            catch { }
        }
        await this.stopRunningBot(botId);
        this.clearCompanyRuntimeState(bot.companyId);
        await this.prisma.customBot.delete({ where: { id: botId } });
        return { success: true };
    }
    async adminUpdateBot(botId, data) {
        const bot = await this.prisma.customBot.findFirst({
            where: { id: botId, deletedAt: null },
            include: { company: true },
        });
        if (!bot)
            throw new common_1.NotFoundException("Bot not found");
        const updateData = {};
        if (data.token !== undefined) {
            const token = String(data.token).trim();
            if (!token) {
                throw new common_1.BadRequestException("Bot token cannot be empty.");
            }
            const validation = await this.validateToken(token);
            if (!validation.valid) {
                if (validation.networkError) {
                    throw new common_1.BadRequestException("Cannot reach Telegram API to verify this token. Check internet and try again.");
                }
                throw new common_1.BadRequestException("Invalid Telegram bot token.");
            }
            updateData.token = token;
            updateData.username = validation.botInfo?.username || null;
            if (data.botName === undefined && validation.botInfo?.first_name) {
                updateData.botName = validation.botInfo.first_name;
            }
        }
        if (data.botName !== undefined) {
            const name = String(data.botName).trim();
            updateData.botName = name || null;
        }
        if (data.description !== undefined) {
            const description = String(data.description).trim();
            updateData.description = description || null;
        }
        if (data.isActive !== undefined) {
            updateData.isActive = !!data.isActive;
        }
        const updated = await this.prisma.customBot.update({
            where: { id: botId },
            data: updateData,
        });
        const hasUpdates = Object.keys(updateData).length > 0;
        if (updateData.isActive === false) {
            this.clearCompanyRuntimeState(updated.companyId);
            await this.stopRunningBot(botId);
        }
        else if (updated.isActive) {
            if (hasUpdates) {
                this.clearCompanyRuntimeState(updated.companyId);
                await this.stopRunningBot(botId);
                await this.initBot(updated.id, updated.companyId, updated.token, bot.company?.name ?? updated.companyId);
            }
            this.applyBotBranding(updated.token, updated.companyId).catch((e) => this.logger.warn(`applyBotBranding failed on adminUpdate: ${e?.message}`));
        }
        return { ...updated, status: this.getBotStatus(botId) };
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
    async adminDeleteAllBots() {
        const allBots = await this.prisma.customBot.findMany();
        let deleted = 0;
        for (const record of allBots) {
            const running = this.bots.get(record.id);
            if (running) {
                try {
                    await running.telegram.deleteWebhook({ drop_pending_updates: true });
                }
                catch { }
                try {
                    running.stop();
                }
                catch { }
                this.bots.delete(record.id);
            }
        }
        await this.prisma.customBot.deleteMany();
        deleted = allBots.length;
        this.carts.clear();
        this.chatLangPrefs.clear();
        this.logger.log(`adminDeleteAllBots: hard-deleted ${deleted} bots`);
        return { deleted };
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