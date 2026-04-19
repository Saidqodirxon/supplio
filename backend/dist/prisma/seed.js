"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
}
async function main() {
    const passwordHash = await bcrypt.hash("password123", 10);
    await prisma.systemSettings.upsert({
        where: { id: "GLOBAL" },
        update: {
            superAdminPhone: "+998901112233",
            defaultTrialDays: 14,
            newsEnabled: true,
            termsUz: "<p><b>1. Umumiy qoidalar</b></p><p>Ushbu Foydalanish shartlari (qisqacha \"Shartlar\") Supplio platformasi va uning xizmatlaridan foydalanishni tartibga soladi. Platformaga kirish yoki undan foydalanish orqali siz ushbu shartlarga rozilik bildirasiz.</p><br/><p><b>2. Ro'yxatdan o'tish va xavfsizlik</b></p><p>Foydalanuvchilar o'z akkauntlarining maxfiyligini saqlash majburiyatiga ega. Hisobingizdan qilingan har qanday harakatlar uchun to'liq javobgar bo'lasiz.</p><br/><p><b>3. Tizimdan foydalanish cheklovlari</b></p><p>Supplio tizimidan noqonuniy harakatlar, firibgarlik yoki boshqa foydalanuvchilarga zarar yetkazish maqsadida foydalanish qat'iyan man etiladi.</p><br/><p><b>4. To'lovlar va tariflar</b></p><p>Platforma pullik xizmatlarni taqdim etadi. Barcha to'lovlar oldindan amalga oshiriladi va qaytarilmaydi (qonunchilikda ko'rsatilgan holatlar bundan mustasno).</p>",
            privacyUz: "<p><b>1. Maxfiylik kafolati</b></p><p>Supplio sizning shaxsiy ma'lumotlaringizni himoya qilishga katta e'tibor qaratadi. Biz ma'lumotlaringizni uchinchi shaxslarga sotmaymiz.</p><br/><p><b>2. Qanday ma'lumotlar yig'iladi?</b></p><p>Sizning telefon raqamingiz, ismingiz, kompaniya ma'lumotlaringiz va tizimdagi harakatlar loglari xavfsizlik va xizmat sifatini oshirish uchun yig'iladi.</p><br/><p><b>3. Ma'lumotlarni saqlash muddati</b></p><p>Sizning ma'lumotlaringiz siz tizimdan foydalanayotgan davr mobaynida xavfsiz serverlarda saqlanadi. Hisobingizni o'chirmoqchi bo'lsangiz, biz bilan bog'lanishingiz mumkin.</p>",
        },
        create: {
            superAdminPhone: "+998901112233",
            defaultTrialDays: 14,
            newsEnabled: true,
            termsUz: "<p><b>1. Umumiy qoidalar</b></p><p>Ushbu Foydalanish shartlari (qisqacha \"Shartlar\") Supplio platformasi va uning xizmatlaridan foydalanishni tartibga soladi. Platformaga kirish yoki undan foydalanish orqali siz ushbu shartlarga rozilik bildirasiz.</p><br/><p><b>2. Ro'yxatdan o'tish va xavfsizlik</b></p><p>Foydalanuvchilar o'z akkauntlarining maxfiyligini saqlash majburiyatiga ega. Hisobingizdan qilingan har qanday harakatlar uchun to'liq javobgar bo'lasiz.</p><br/><p><b>3. Tizimdan foydalanish cheklovlari</b></p><p>Supplio tizimidan noqonuniy harakatlar, firibgarlik yoki boshqa foydalanuvchilarga zarar yetkazish maqsadida foydalanish qat'iyan man etiladi.</p><br/><p><b>4. To'lovlar va tariflar</b></p><p>Platforma pullik xizmatlarni taqdim etadi. Barcha to'lovlar oldindan amalga oshiriladi va qaytarilmaydi (qonunchilikda ko'rsatilgan holatlar bundan mustasno).</p>",
            privacyUz: "<p><b>1. Maxfiylik kafolati</b></p><p>Supplio sizning shaxsiy ma'lumotlaringizni himoya qilishga katta e'tibor qaratadi. Biz ma'lumotlaringizni uchinchi shaxslarga sotmaymiz.</p><br/><p><b>2. Qanday ma'lumotlar yig'iladi?</b></p><p>Sizning telefon raqamingiz, ismingiz, kompaniya ma'lumotlaringiz va tizimdagi harakatlar loglari xavfsizlik va xizmat sifatini oshirish uchun yig'iladi.</p><br/><p><b>3. Ma'lumotlarni saqlash muddati</b></p><p>Sizning ma'lumotlaringiz siz tizimdan foydalanayotgan davr mobaynida xavfsiz serverlarda saqlanadi. Hisobingizni o'chirmoqchi bo'lsangiz, biz bilan bog'lanishingiz mumkin.</p>",
        },
    });
    const canonicalTariffs = [
        {
            planKey: "FREE",
            order: 0,
            nameUz: "Bepul",
            nameRu: "Ð‘ÐµÑÐ¿Ð»Ð°Ñ‚Ð½Ð¾",
            nameEn: "Free",
            nameTr: "Ãœcretsiz",
            nameUzCyr: "Ð‘ÐµÐ¿ÑƒÐ»",
            price: "0",
            priceMonthly: "0",
            priceYearly: "0",
            featuresUz: ["1 filial", "3 xodim", "50 dealer", "200 mahsulot", "Asosiy bildirishnomalar"],
            featuresRu: ["1 Ñ„Ð¸Ð»Ð¸Ð°Ð»", "3 ÑÐ¾Ñ‚Ñ€ÑƒÐ´Ð½Ð¸ÐºÐ°", "50 Ð´Ð¸Ð»ÐµÑ€Ð¾Ð²", "200 Ñ‚Ð¾Ð²Ð°Ñ€Ð¾Ð²", "Ð‘Ð°Ð·Ð¾Ð²Ñ‹Ðµ ÑƒÐ²ÐµÐ´Ð¾Ð¼Ð»ÐµÐ½Ð¸Ñ"],
            featuresEn: ["1 branch", "3 staff", "50 dealers", "200 products", "Basic notifications"],
            featuresTr: ["1 ÅŸube", "3 personel", "50 bayi", "200 Ã¼rÃ¼n", "Temel bildirimler"],
            featuresUzCyr: ["1 Ñ„Ð¸Ð»Ð¸Ð°Ð»", "3 Ñ…Ð¾Ð´Ð¸Ð¼", "50 Ð´Ð¸Ð»ÐµÑ€", "200 Ð¼Ð°Ò³ÑÑƒÐ»Ð¾Ñ‚", "ÐÑÐ¾ÑÐ¸Ð¹ Ð±Ð¸Ð»Ð´Ð¸Ñ€Ð¸ÑˆÐ½Ð¾Ð¼Ð°Ð»Ð°Ñ€"],
            maxBranches: 1, maxCustomBots: 0, maxUsers: 3, maxDealers: 50, maxProducts: 200,
            allowCustomBot: false, allowWebStore: true, allowAnalytics: false,
            allowNotifications: true, allowMultiCompany: false, allowBulkImport: false,
            trialDays: 14, isActive: true, isPopular: false,
        },
        {
            planKey: "START",
            order: 1,
            nameUz: "Start",
            nameRu: "Ð¡Ñ‚Ð°Ñ€Ñ‚",
            nameEn: "Start",
            nameTr: "BaÅŸlangÄ±Ã§",
            nameUzCyr: "Ð¡Ñ‚Ð°Ñ€Ñ‚",
            price: "9 999 so'm",
            priceMonthly: "9999",
            priceYearly: "99990",
            featuresUz: ["1 filial", "5 xodim", "150 dealer", "500 mahsulot", "Web do'kon", "Boshlang'ich analitika"],
            featuresRu: ["1 Ñ„Ð¸Ð»Ð¸Ð°Ð»", "5 ÑÐ¾Ñ‚Ñ€ÑƒÐ´Ð½Ð¸ÐºÐ¾Ð²", "150 Ð´Ð¸Ð»ÐµÑ€Ð¾Ð²", "500 Ñ‚Ð¾Ð²Ð°Ñ€Ð¾Ð²", "Ð’ÐµÐ±-Ð¼Ð°Ð³Ð°Ð·Ð¸Ð½", "Ð¡Ñ‚Ð°Ñ€Ñ‚Ð¾Ð²Ð°Ñ Ð°Ð½Ð°Ð»Ð¸Ñ‚Ð¸ÐºÐ°"],
            featuresEn: ["1 branch", "5 staff", "150 dealers", "500 products", "Web store", "Starter analytics"],
            featuresTr: ["1 ÅŸube", "5 personel", "150 bayi", "500 Ã¼rÃ¼n", "Web maÄŸaza", "BaÅŸlangÄ±Ã§ analitiÄŸi"],
            featuresUzCyr: ["1 Ñ„Ð¸Ð»Ð¸Ð°Ð»", "5 Ñ…Ð¾Ð´Ð¸Ð¼", "150 Ð´Ð¸Ð»ÐµÑ€", "500 Ð¼Ð°Ò³ÑÑƒÐ»Ð¾Ñ‚", "Ð’ÐµÐ± Ð´ÑžÐºÐ¾Ð½", "Ð‘Ð¾ÑˆÐ»Ð°Ð½Ò“Ð¸Ñ‡ Ñ‚Ð°Ò³Ð»Ð¸Ð»"],
            maxBranches: 1, maxCustomBots: 0, maxUsers: 5, maxDealers: 150, maxProducts: 500,
            allowCustomBot: false, allowWebStore: true, allowAnalytics: true,
            allowNotifications: true, allowMultiCompany: false, allowBulkImport: false,
            trialDays: 14, isActive: true, isPopular: false,
        },
        {
            planKey: "PRO",
            order: 2,
            nameUz: "Pro",
            nameRu: "ÐŸÑ€Ð¾",
            nameEn: "Pro",
            nameTr: "Pro",
            nameUzCyr: "ÐŸÑ€Ð¾",
            price: "29 999 so'm",
            priceMonthly: "29999",
            priceYearly: "299990",
            featuresUz: ["3 filial", "15 xodim", "1 000 dealer", "3 000 mahsulot", "1 ta Telegram bot", "Ommaviy import", "To'liq analitika"],
            featuresRu: ["3 Ñ„Ð¸Ð»Ð¸Ð°Ð»Ð°", "15 ÑÐ¾Ñ‚Ñ€ÑƒÐ´Ð½Ð¸ÐºÐ¾Ð²", "1 000 Ð´Ð¸Ð»ÐµÑ€Ð¾Ð²", "3 000 Ñ‚Ð¾Ð²Ð°Ñ€Ð¾Ð²", "1 Telegram-Ð±Ð¾Ñ‚", "ÐœÐ°ÑÑÐ¾Ð²Ñ‹Ð¹ Ð¸Ð¼Ð¿Ð¾Ñ€Ñ‚", "ÐŸÐ¾Ð»Ð½Ð°Ñ Ð°Ð½Ð°Ð»Ð¸Ñ‚Ð¸ÐºÐ°"],
            featuresEn: ["3 branches", "15 staff", "1,000 dealers", "3,000 products", "1 Telegram bot", "Bulk import", "Full analytics"],
            featuresTr: ["3 ÅŸube", "15 personel", "1.000 bayi", "3.000 Ã¼rÃ¼n", "1 Telegram botu", "Toplu iÃ§e aktarma", "Tam analitik"],
            featuresUzCyr: ["3 Ñ„Ð¸Ð»Ð¸Ð°Ð»", "15 Ñ…Ð¾Ð´Ð¸Ð¼", "1 000 Ð´Ð¸Ð»ÐµÑ€", "3 000 Ð¼Ð°Ò³ÑÑƒÐ»Ð¾Ñ‚", "1 Ñ‚Ð° Telegram Ð±Ð¾Ñ‚", "ÐžÐ¼Ð¼Ð°Ð²Ð¸Ð¹ Ð¸Ð¼Ð¿Ð¾Ñ€Ñ‚", "Ð¢ÑžÐ»Ð¸Ò› Ñ‚Ð°Ò³Ð»Ð¸Ð»"],
            maxBranches: 3, maxCustomBots: 1, maxUsers: 15, maxDealers: 1000, maxProducts: 3000,
            allowCustomBot: true, allowWebStore: true, allowAnalytics: true,
            allowNotifications: true, allowMultiCompany: false, allowBulkImport: true,
            trialDays: 14, isActive: true, isPopular: true,
        },
        {
            planKey: "PREMIUM",
            order: 3,
            nameUz: "Premium",
            nameRu: "ÐŸÑ€ÐµÐ¼Ð¸ÑƒÐ¼",
            nameEn: "Premium",
            nameTr: "Premium",
            nameUzCyr: "ÐŸÑ€ÐµÐ¼Ð¸ÑƒÐ¼",
            price: "99 999 so'm",
            priceMonthly: "99999",
            priceYearly: "999990",
            featuresUz: ["10 filial", "50 xodim", "5 000 dealer", "15 000 mahsulot", "3 ta Telegram bot", "Ustuvor support", "Kengaytirilgan nazorat"],
            featuresRu: ["10 Ñ„Ð¸Ð»Ð¸Ð°Ð»Ð¾Ð²", "50 ÑÐ¾Ñ‚Ñ€ÑƒÐ´Ð½Ð¸ÐºÐ¾Ð²", "5 000 Ð´Ð¸Ð»ÐµÑ€Ð¾Ð²", "15 000 Ñ‚Ð¾Ð²Ð°Ñ€Ð¾Ð²", "3 Telegram-Ð±Ð¾Ñ‚Ð°", "ÐŸÑ€Ð¸Ð¾Ñ€Ð¸Ñ‚ÐµÑ‚Ð½Ð°Ñ Ð¿Ð¾Ð´Ð´ÐµÑ€Ð¶ÐºÐ°", "Ð Ð°ÑÑˆÐ¸Ñ€ÐµÐ½Ð½Ñ‹Ð¹ ÐºÐ¾Ð½Ñ‚Ñ€Ð¾Ð»ÑŒ"],
            featuresEn: ["10 branches", "50 staff", "5,000 dealers", "15,000 products", "3 Telegram bots", "Priority support", "Advanced controls"],
            featuresTr: ["10 ÅŸube", "50 personel", "5.000 bayi", "15.000 Ã¼rÃ¼n", "3 Telegram botu", "Ã–ncelikli destek", "GeliÅŸmiÅŸ kontroller"],
            featuresUzCyr: ["10 Ñ„Ð¸Ð»Ð¸Ð°Ð»", "50 Ñ…Ð¾Ð´Ð¸Ð¼", "5 000 Ð´Ð¸Ð»ÐµÑ€", "15 000 Ð¼Ð°Ò³ÑÑƒÐ»Ð¾Ñ‚", "3 Ñ‚Ð° Telegram Ð±Ð¾Ñ‚", "Ð£ÑÑ‚ÑƒÐ²Ð¾Ñ€ ÑÑ€Ð´Ð°Ð¼", "ÐšÐµÐ½Ð³Ð°Ð¹Ñ‚Ð¸Ñ€Ð¸Ð»Ð³Ð°Ð½ Ð½Ð°Ð·Ð¾Ñ€Ð°Ñ‚"],
            maxBranches: 10, maxCustomBots: 3, maxUsers: 50, maxDealers: 5000, maxProducts: 15000,
            allowCustomBot: true, allowWebStore: true, allowAnalytics: true,
            allowNotifications: true, allowMultiCompany: false, allowBulkImport: true,
            trialDays: 30, isActive: true, isPopular: false,
        },
    ];
    await prisma.tariffPlan.deleteMany({});
    await prisma.tariffPlan.createMany({
        data: canonicalTariffs,
    });
    const testimonials = [
        {
            name: "Bahodir Rahimov",
            company: "Tashkent Electronics",
            roleTitle: "Owner",
            contentUz: "Supplio bizning tarqatish tarmog'imizni to'liq avtomatlashtirdi. Endi barcha dilerlarimizni bitta paneldan boshqaramiz.",
            contentRu: "Supplio полностью автоматизировал нашу дистрибьюторскую сеть. Теперь управляем всеми дилерами из одной панели.",
            contentEn: "Supplio fully automated our distribution network. We now manage all our dealers from a single panel.",
            contentTr: "Supplio dağıtım ağımızı tamamen otomatize etti. Artık tüm bayilerimizi tek bir panelden yönetiyoruz.",
            rating: 5, order: 0, isActive: true,
        },
        {
            name: "Nilufar Yusupova",
            company: "Silk Road Trading",
            roleTitle: "General Manager",
            contentUz: "Telegram bot orqali dilerlarimiz buyurtma berishi va qarzlarini ko'rishi bizga juda qulaylik yaratdi.",
            contentRu: "Telegram бот для дилеров и отслеживание долгов значительно упростили нашу работу.",
            contentEn: "The Telegram bot for dealers and debt tracking greatly simplified our operations.",
            contentTr: "Bayiler için Telegram botu ve borç takibi iş süreçlerimizi büyük ölçüde kolaylaştırdı.",
            rating: 5, order: 1, isActive: true,
        },
        {
            name: "Sardor Xolmatov",
            company: "Fergana Optoviy",
            roleTitle: "Sales Director",
            contentUz: "Analitika sahifasi bizga qaysi mahsulotlar yaxshi sotilayotganini va qaysi dilerlar faolroq ekanini ko'rsatadi.",
            contentRu: "Раздел аналитики показывает нам, какие продукты продаются лучше и кто из дилеров активнее.",
            contentEn: "The analytics section shows us which products sell best and which dealers are most active.",
            contentTr: "Analitik bölümü hangi ürünlerin daha iyi sattığını ve hangi bayilerin daha aktif olduğunu gösteriyor.",
            rating: 5, order: 2, isActive: true,
        },
    ];
    for (const [i, test] of testimonials.entries()) {
        const existing = await prisma.testimonial.findFirst({ where: { name: test.name } });
        if (!existing) {
            await prisma.testimonial.create({ data: test });
        }
    }
    const existingCompany = await prisma.company.findFirst({ where: { slug: "supplio-global" } });
    if (existingCompany) {
        console.log("Company already exists, skipping company/user/dealer creation.");
        console.log("--- SEED COMPLETED (partial) ---");
        return;
    }
    const company = await prisma.company.create({
        data: {
            name: "Supplio Global Distributors",
            slug: "supplio-global",
            isDemo: false,
            subscriptionPlan: client_1.SubscriptionPlan.PREMIUM,
            subscriptionStatus: client_1.SubscriptionStatus.ACTIVE,
            trialExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            instagram: "@supplio.official",
            telegram: "supplio_uz",
            siteActive: true,
        },
    });
    const mainBranch = await prisma.branch.create({
        data: { name: "Tashkent Main Hub", address: "Tashkent, Yunusobod", companyId: company.id },
    });
    const branch2 = await prisma.branch.create({
        data: { name: "Samarkand Branch", address: "Samarkand shahar", companyId: company.id },
    });
    await prisma.user.createMany({
        data: [
            { phone: "+998901112233", passwordHash, roleType: client_1.RoleType.SUPER_ADMIN, fullName: "Super Admin", companyId: company.id },
            { phone: "+998901234567", passwordHash, roleType: client_1.RoleType.OWNER, fullName: "Aziz Karimov", companyId: company.id },
            { phone: "+998907654321", passwordHash, roleType: client_1.RoleType.MANAGER, fullName: "Dilnoza Umarova", companyId: company.id, branchId: mainBranch.id },
            { phone: "+998909876543", passwordHash, roleType: client_1.RoleType.SALES, fullName: "Bobur Toshmatov", companyId: company.id, branchId: mainBranch.id },
        ],
    });
    const catElectronics = await prisma.category.create({ data: { name: "Elektronika", companyId: company.id } });
    const catFood = await prisma.category.create({ data: { name: "Oziq-ovqat", companyId: company.id } });
    const catCleaning = await prisma.category.create({ data: { name: "Tozalash vositalari", companyId: company.id } });
    const products = await prisma.product.createManyAndReturn({
        data: [
            { name: "Samsung Galaxy S24 Ultra", sku: "SAM-S24U", costPrice: 8000000, price: 12000000, stock: 45, unit: "dona", companyId: company.id, categoryId: catElectronics.id },
            { name: "iPhone 15 Pro Max", sku: "APP-15PM", costPrice: 10000000, price: 15000000, stock: 30, unit: "dona", companyId: company.id, categoryId: catElectronics.id },
            { name: "Xiaomi Redmi Note 13", sku: "XIA-RN13", costPrice: 2500000, price: 3800000, stock: 120, unit: "dona", companyId: company.id, categoryId: catElectronics.id },
            { name: "Samsung 55\" 4K TV", sku: "SAM-TV55", costPrice: 5500000, price: 8000000, stock: 15, unit: "dona", companyId: company.id, categoryId: catElectronics.id },
            { name: "Ariel Pods 30 ta", sku: "ARI-POD30", costPrice: 45000, price: 65000, stock: 500, unit: "quti", companyId: company.id, categoryId: catCleaning.id },
            { name: "Tide 3kg", sku: "TID-3KG", costPrice: 55000, price: 80000, stock: 350, unit: "paket", companyId: company.id, categoryId: catCleaning.id },
            { name: "Domestos 750ml", sku: "DOM-750", costPrice: 18000, price: 28000, stock: 800, unit: "shisha", companyId: company.id, categoryId: catCleaning.id },
            { name: "Nescafe Classic 200g", sku: "NES-200G", costPrice: 42000, price: 62000, stock: 250, unit: "quti", companyId: company.id, categoryId: catFood.id },
            { name: "Lay's 160g Assorted", sku: "LAY-160", costPrice: 12000, price: 18000, stock: 600, unit: "dona", companyId: company.id, categoryId: catFood.id },
            { name: "Coca-Cola 1.5L", sku: "CCA-1.5L", costPrice: 8000, price: 13000, stock: 1200, unit: "shisha", companyId: company.id, categoryId: catFood.id },
        ],
    });
    const dealerData = [
        { name: "Alisher Kobilov", phone: "+998944445566", creditLimit: 50000000, branchId: mainBranch.id },
        { name: "Jasur Yuldashev", phone: "+998901111111", creditLimit: 30000000, branchId: mainBranch.id },
        { name: "Nodira Hasanova", phone: "+998902222222", creditLimit: 20000000, branchId: mainBranch.id },
        { name: "Sardor Mirzayev", phone: "+998903333333", creditLimit: 15000000, branchId: mainBranch.id },
        { name: "Umida Qosimova", phone: "+998904444444", creditLimit: 25000000, branchId: mainBranch.id },
        { name: "Bekzod Tursunov", phone: "+998905555555", creditLimit: 10000000, branchId: branch2.id },
        { name: "Feruza Nazarova", phone: "+998906666666", creditLimit: 8000000, branchId: branch2.id },
        { name: "Otabek Xoliqov", phone: "+998907777777", creditLimit: 12000000, branchId: branch2.id },
        { name: "Kamola Ergasheva", phone: "+998908888888", creditLimit: 18000000, branchId: branch2.id },
        { name: "Sherzod Rашidov", phone: "+998909999999", creditLimit: 22000000, branchId: mainBranch.id },
    ];
    const dealers = await Promise.all(dealerData.map((d) => prisma.dealer.create({ data: { ...d, companyId: company.id } })));
    const orderScenarios = [
        { daysBack: 28, dealerIdx: 0, prodIdx: 0, qty: 3 },
        { daysBack: 26, dealerIdx: 1, prodIdx: 1, qty: 2 },
        { daysBack: 25, dealerIdx: 2, prodIdx: 4, qty: 50 },
        { daysBack: 24, dealerIdx: 0, prodIdx: 2, qty: 5 },
        { daysBack: 22, dealerIdx: 3, prodIdx: 5, qty: 30 },
        { daysBack: 20, dealerIdx: 1, prodIdx: 7, qty: 10 },
        { daysBack: 18, dealerIdx: 4, prodIdx: 3, qty: 2 },
        { daysBack: 16, dealerIdx: 5, prodIdx: 6, qty: 40 },
        { daysBack: 14, dealerIdx: 0, prodIdx: 1, qty: 1 },
        { daysBack: 12, dealerIdx: 2, prodIdx: 8, qty: 20 },
        { daysBack: 10, dealerIdx: 6, prodIdx: 9, qty: 100 },
        { daysBack: 9, dealerIdx: 3, prodIdx: 0, qty: 2 },
        { daysBack: 7, dealerIdx: 1, prodIdx: 2, qty: 8 },
        { daysBack: 6, dealerIdx: 7, prodIdx: 4, qty: 60 },
        { daysBack: 5, dealerIdx: 4, prodIdx: 5, qty: 25 },
        { daysBack: 4, dealerIdx: 0, prodIdx: 7, qty: 5 },
        { daysBack: 3, dealerIdx: 8, prodIdx: 1, qty: 3 },
        { daysBack: 2, dealerIdx: 2, prodIdx: 6, qty: 70 },
        { daysBack: 1, dealerIdx: 5, prodIdx: 3, qty: 1 },
        { daysBack: 0, dealerIdx: 9, prodIdx: 8, qty: 15 },
    ];
    for (const s of orderScenarios) {
        const dealer = dealers[s.dealerIdx];
        const product = products[s.prodIdx];
        const totalAmount = product.price * s.qty;
        const totalCost = product.costPrice * s.qty;
        const createdAt = daysAgo(s.daysBack);
        const order = await prisma.order.create({
            data: {
                companyId: company.id,
                branchId: dealer.branchId,
                dealerId: dealer.id,
                totalAmount,
                totalCost,
                status: s.daysBack > 7 ? client_1.OrderStatus.DELIVERED : client_1.OrderStatus.PENDING,
                items: [{ productId: product.id, name: product.name, qty: s.qty, price: product.price, cost: product.costPrice }],
                createdAt,
            },
        });
        await prisma.ledgerTransaction.create({
            data: { companyId: company.id, dealerId: dealer.id, type: client_1.TxType.ORDER, amount: totalAmount, createdAt },
        });
        await prisma.dealer.update({
            where: { id: dealer.id },
            data: { currentDebt: { increment: totalAmount } },
        });
    }
    const paymentData = [
        { dealerIdx: 0, amount: 20000000, method: "BANK" },
        { dealerIdx: 1, amount: 10000000, method: "CASH" },
        { dealerIdx: 2, amount: 3000000, method: "CLICK" },
        { dealerIdx: 4, amount: 8000000, method: "PAYME" },
        { dealerIdx: 6, amount: 2000000, method: "CASH" },
    ];
    for (const p of paymentData) {
        const dealer = dealers[p.dealerIdx];
        const payment = await prisma.payment.create({
            data: {
                companyId: company.id,
                branchId: dealer.branchId,
                dealerId: dealer.id,
                amount: p.amount,
                method: p.method,
            },
        });
        await prisma.ledgerTransaction.create({
            data: { companyId: company.id, dealerId: dealer.id, type: client_1.TxType.PAYMENT, amount: p.amount },
        });
        await prisma.dealer.update({
            where: { id: dealer.id },
            data: { currentDebt: { decrement: p.amount } },
        });
    }
    await prisma.lead.createMany({
        data: [
            { fullName: "Akbar Toshev", phone: "+998901000001", info: "PRO tarif haqida so'radi", status: "NEW" },
            { fullName: "Malika Ismoilova", phone: "+998901000002", info: "Demo ko'rmoqchi", status: "CONTACTED" },
            { fullName: "Davron Qodirov", phone: "+998901000003", info: "10 ta diler bor, tarif tanlayapti", status: "NEW" },
            { fullName: "Zulfiya Rahimova", phone: "+998901000004", info: "Korxona uchun 3 filial kerak", status: "QUALIFIED" },
            { fullName: "Ibrohim Nishonov", phone: "+998901000005", status: "NEW" },
            { fullName: "Sarvinoz Xoliqova", phone: "+998901000006", info: "Telegram bot integratsiyasi", status: "CONTACTED" },
            { fullName: "Nodir Umarov", phone: "+998901000007", info: "Startup uchun arzon tarif", status: "NEW" },
            { fullName: "Gulnora Tursunova", phone: "+998901000008", info: "Enterprise demo so'radi", status: "QUALIFIED" },
            { fullName: "Eldor Nazarov", phone: "+998901000009", status: "LOST" },
            { fullName: "Shahnoza Yusupova", phone: "+998901000010", info: "Referral - Silk Road Trading", status: "NEW" },
        ],
    });
    await prisma.expense.createMany({
        data: [
            { companyId: company.id, amount: 500000, category: "Logistics", description: "Asosiy yuk mashinasi yoqilg'isi", branchId: mainBranch.id },
            { companyId: company.id, amount: 1200000, category: "Rent", description: "Oy ijarasi - asosiy ombor", branchId: mainBranch.id },
            { companyId: company.id, amount: 350000, category: "Utilities", description: "Elektr energiyasi", branchId: mainBranch.id },
        ],
    });
    const demoCompany = await prisma.company.create({
        data: {
            name: "Demo Solutions Ltd",
            slug: "demo",
            isDemo: true,
            subscriptionPlan: client_1.SubscriptionPlan.START,
            subscriptionStatus: client_1.SubscriptionStatus.TRIAL,
            trialExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            siteActive: true,
        },
    });
    const demoBranch = await prisma.branch.create({
        data: { name: "Demo Hub", companyId: demoCompany.id },
    });
    await prisma.user.create({
        data: { phone: "+998991112233", passwordHash, roleType: "OWNER", fullName: "Demo Owner", companyId: demoCompany.id, branchId: demoBranch.id },
    });
    console.log("─────────────────────────────────────────");
    console.log("✅ SEED COMPLETED");
    console.log("─────────────────────────────────────────");
    console.log("SuperAdmin: +998901112233 / password123");
    console.log("Owner:      +998901234567 / password123");
    console.log("Manager:    +998907654321 / password123");
    console.log("Demo Owner: +998991112233 / password123");
    console.log("─────────────────────────────────────────");
    console.log(`Company: Supplio Global Distributors`);
    console.log(`Dealers: ${dealers.length} | Orders: ${orderScenarios.length} | Leads: 10`);
}
main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
//# sourceMappingURL=seed.js.map