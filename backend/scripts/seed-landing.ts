/**
 * Supplio Landing Seed Script
 * Run: npx ts-node scripts/seed-landing.ts
 *
 * Tariffs: DELETE all existing → CREATE 4 fresh plans (equal 8 features each).
 * News: skip-if-exists by slugUz.
 * Settings: upsert GLOBAL.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedSettings() {
  await (prisma as any).systemSettings.upsert({
    where: { id: "GLOBAL" },
    update: {},
    create: {
      id: "GLOBAL",
      newsEnabled: true,
      defaultTrialDays: 14,
      systemVersion: "2.1.0",
      globalNotifyUz: "Supplio V2 tarmog'i ishga tushirildi!",
      globalNotifyRu: "Сеть Supplio V2 запущена!",
      globalNotifyEn: "Supplio V2 network is live!",
      globalNotifyTr: "Supplio V2 ağı yayında!",
    },
  });
  console.log("✓ Settings upserted");
}

async function seedTariffs() {

  const tariffs = [
    {
      planKey: "STARTER",
      order: 1,
      nameUz: "Boshlang'ich",
      nameRu: "Стартовый",
      nameEn: "Starter",
      nameTr: "Başlangıç",
      nameUzCyr: "Бошланғич",
      price: "99,000",
      priceMonthly: "99,000",
      isActive: true,
      isPopular: false,
      maxBranches: 3,
      maxUsers: 10,
      maxDealers: 50,
      maxProducts: 100,
      maxCustomBots: 0,
      allowAnalytics: false,
      allowBulkImport: false,
      allowCustomBot: false,
      allowMultiCompany: false,
      featuresUz: [
        "3 ta filial",
        "10 ta foydalanuvchi",
        "50 ta dealer",
        "100 ta mahsulot",
        "Asosiy hisobotlar",
        "Telegram orqali buyurtma",
        "Kredit limitni kuzatish",
        "Email & chat support",
      ],
      featuresRu: [
        "3 филиала",
        "10 пользователей",
        "50 дилеров",
        "100 продуктов",
        "Базовые отчёты",
        "Заказы через Telegram",
        "Контроль кредитных лимитов",
        "Email & чат-поддержка",
      ],
      featuresEn: [
        "3 branches",
        "10 users",
        "50 dealers",
        "100 products",
        "Basic reports",
        "Telegram ordering",
        "Credit limit tracking",
        "Email & chat support",
      ],
      featuresTr: [
        "3 şube",
        "10 kullanıcı",
        "50 bayi",
        "100 ürün",
        "Temel raporlar",
        "Telegram ile sipariş",
        "Kredi limiti takibi",
        "E-posta & sohbet desteği",
      ],
      featuresUzCyr: [
        "3 та филиал",
        "10 та фойдаланувчи",
        "50 та дилер",
        "100 та маҳсулот",
        "Асосий ҳисоботлар",
        "Телеграм орқали буюртма",
        "Кредит лимитини кузатиш",
        "Email & чат қўллаб-қувватлаш",
      ],
    },
    {
      planKey: "PROFESSIONAL",
      order: 2,
      nameUz: "Professional",
      nameRu: "Professional",
      nameEn: "Professional",
      nameTr: "Professional",
      nameUzCyr: "Professional",
      price: "249,000",
      priceMonthly: "249,000",
      isActive: true,
      isPopular: true,
      maxBranches: 10,
      maxUsers: 50,
      maxDealers: 99999,
      maxProducts: 99999,
      maxCustomBots: 1,
      allowAnalytics: true,
      allowBulkImport: true,
      allowCustomBot: true,
      allowMultiCompany: false,
      featuresUz: [
        "10 ta filial",
        "50 ta foydalanuvchi",
        "Cheksiz dealer",
        "Cheksiz mahsulot",
        "Telegram bot (1 ta)",
        "Ommaviy import",
        "Kredit nazorat tizimi",
        "Analitika va hisobotlar",
      ],
      featuresRu: [
        "10 филиалов",
        "50 пользователей",
        "Безлимит дилеры",
        "Безлимит продукты",
        "Telegram бот (1 шт)",
        "Массовый импорт",
        "Система контроля кредитов",
        "Аналитика и отчёты",
      ],
      featuresEn: [
        "10 branches",
        "50 users",
        "Unlimited dealers",
        "Unlimited products",
        "Telegram bot (1)",
        "Bulk import",
        "Credit control system",
        "Analytics & reports",
      ],
      featuresTr: [
        "10 şube",
        "50 kullanıcı",
        "Sınırsız bayi",
        "Sınırsız ürün",
        "Telegram bot (1 adet)",
        "Toplu import",
        "Kredi kontrol sistemi",
        "Analitik & raporlar",
      ],
      featuresUzCyr: [
        "10 та филиал",
        "50 та фойдаланувчи",
        "Чексиз дилер",
        "Чексиз маҳсулот",
        "Telegram бот (1 та)",
        "Оммавий импорт",
        "Кредит назорат тизими",
        "Аналитика ва ҳисоботлар",
      ],
    },
    {
      planKey: "BUSINESS",
      order: 3,
      nameUz: "Biznes",
      nameRu: "Бизнес",
      nameEn: "Business",
      nameTr: "İşletme",
      nameUzCyr: "Бизнес",
      price: "399,000",
      priceMonthly: "399,000",
      isActive: true,
      isPopular: false,
      maxBranches: 20,
      maxUsers: 100,
      maxDealers: 99999,
      maxProducts: 99999,
      maxCustomBots: 5,
      allowAnalytics: true,
      allowBulkImport: true,
      allowCustomBot: true,
      allowMultiCompany: false,
      featuresUz: [
        "20 ta filial",
        "100 ta foydalanuvchi",
        "Cheksiz dealer",
        "Cheksiz mahsulot",
        "5 ta Telegram bot",
        "Kengaytirilgan CRM",
        "API kirish",
        "Ustuvor support",
      ],
      featuresRu: [
        "20 филиалов",
        "100 пользователей",
        "Безлимит дилеры",
        "Безлимит продукты",
        "5 Telegram ботов",
        "Расширенный CRM",
        "Доступ к API",
        "Приоритетная поддержка",
      ],
      featuresEn: [
        "20 branches",
        "100 users",
        "Unlimited dealers",
        "Unlimited products",
        "5 Telegram bots",
        "Advanced CRM",
        "API access",
        "Priority support",
      ],
      featuresTr: [
        "20 şube",
        "100 kullanıcı",
        "Sınırsız bayi",
        "Sınırsız ürün",
        "5 Telegram botu",
        "Gelişmiş CRM",
        "API erişimi",
        "Öncelikli destek",
      ],
      featuresUzCyr: [
        "20 та филиал",
        "100 та фойдаланувчи",
        "Чексиз дилер",
        "Чексиз маҳсулот",
        "5 та Telegram бот",
        "Кенгайтирилган CRM",
        "API кириш",
        "Устувор support",
      ],
    },
    {
      planKey: "ENTERPRISE",
      order: 4,
      nameUz: "Enterprise",
      nameRu: "Корпоративный",
      nameEn: "Enterprise",
      nameTr: "Kurumsal",
      nameUzCyr: "Корпоратив",
      price: "Muzokaralar asosida",
      priceMonthly: "Muzokaralar asosida",
      isActive: true,
      isPopular: false,
      maxBranches: 99999,
      maxUsers: 99999,
      maxDealers: 99999,
      maxProducts: 99999,
      maxCustomBots: 99,
      allowAnalytics: true,
      allowBulkImport: true,
      allowCustomBot: true,
      allowMultiCompany: true,
      featuresUz: [
        "Filiallar — kelishuv asosida",
        "Foydalanuvchilar — kelishuv asosida",
        "Cheksiz Telegram bot",
        "Ko'p kompaniya boshqaruvi",
        "Shaxsiy menejer",
        "API + integratsiyalar",
        "SLA kafolati",
        "Ustuvor texnik yordam",
      ],
      featuresRu: [
        "Филиалы — по договорённости",
        "Пользователи — по договорённости",
        "Безлимит Telegram ботов",
        "Управление несколькими компаниями",
        "Персональный менеджер",
        "API + интеграции",
        "Гарантия SLA",
        "Выделенная поддержка",
      ],
      featuresEn: [
        "Branches — by agreement",
        "Users — by agreement",
        "Unlimited Telegram bots",
        "Multi-company management",
        "Dedicated manager",
        "API + integrations",
        "SLA guarantee",
        "Dedicated support",
      ],
      featuresTr: [
        "Şubeler — anlaşmaya göre",
        "Kullanıcılar — anlaşmaya göre",
        "Sınırsız Telegram botu",
        "Çoklu şirket yönetimi",
        "Kişisel yönetici",
        "API + entegrasyonlar",
        "SLA garantisi",
        "Özel teknik destek",
      ],
      featuresUzCyr: [
        "Филиаллар — келишув асосида",
        "Фойдаланувчилар — келишув асосида",
        "Чексиз Telegram бот",
        "Кўп компания бошқаруви",
        "Шахсий менежер",
        "API + интеграциялар",
        "SLA кафолати",
        "Устувор техник ёрдам",
      ],
    },
  ];

  for (const t of tariffs) {
    await (prisma as any).tariffPlan.upsert({
      where: { planKey: t.planKey },
      update: t,
      create: t,
    });
    console.log(`  ✓ Upserted: ${t.nameEn} — ${t.price}`);
  }
  console.log("✓ Tariffs done");
}

async function seedNews() {
  const articles = [
    {
      slugUz: "supplio-nima",
      slugEn: "what-is-supplio",
      slugRu: "chto-takoe-supplio",
      slugTr: "supplio-nedir",
      slugUzCyr: "supplio-nima-uz-cyr",
      titleUz: "Supplio nima? Markaziy Osiyo uchun yaratilgan B2B distributsiya platformasi",
      titleEn: "What is Supplio? The B2B Distribution Platform for Central Asia",
      titleRu: "Что такое Supplio? B2B-платформа дистрибуции для Центральной Азии",
      titleTr: "Supplio Nedir? Orta Asya İçin B2B Dağıtım Platformu",
      titleUzCyr: "Supplio нима? Марказий Осиё учун B2B дистрибуция платформаси",
      excerptUz: "Supplio — ishlab chiqaruvchilar va distribyutorlar uchun dilerlarni boshqarish, kredit limitlarini nazorat qilish va Telegram orqali buyurtmalarni avtomatlashtirish imkonini beruvchi yagona SaaS platforma.",
      excerptEn: "Supplio is an all-in-one SaaS platform that helps manufacturers and distributors manage dealers, control credit limits, and automate orders through Telegram.",
      excerptRu: "Supplio — это универсальная SaaS-платформа для управления дилерами, контроля кредитных лимитов и автоматизации заказов через Telegram.",
      excerptTr: "Supplio, bayileri yönetmenize, kredi limitlerini kontrol etmenize ve Telegram üzerinden siparişleri otomatikleştirmenize yardımcı olan hepsi bir arada SaaS platformudur.",
      excerptUzCyr: "Supplio — дилерларни бошқариш, кредит лимитларини назорат қилиш ва Telegram орқали буюртмаларни автоматлаштириш имконини берувчи ягона SaaS платформа.",
      contentUz: `## Supplio nima?\n\nSupplio — ishlab chiqaruvchilar, ulgurchi savdogarlar va distribyutorlar uchun maxsus yaratilgan zamonaviy B2B distributsiya boshqaruv platformasi.\n\n## Kim uchun?\n\n- **Ishlab chiqaruvchilar** — mintaqaviy distribyutorlar tarmog'iga sotadigan\n- **Distribyutorlar** — bir nechta filial bo'ylab yuzlab dilerlarni boshqaradigan\n- **Ulgurchi savdogarlar** — real vaqt kredit nazorati kerak bo'lgan\n\n## Asosiy imkoniyatlar\n\n**1. Telegram Bot** — Har bir filial o'zining brendlangan botini oladi.\n\n**2. Kredit Nazorat** — Har bir buyurtma tasdiqlashdan oldin kredit limiti tekshiriladi.\n\n**3. Ko'p Filial** — Barcha filiallarni bitta paneldan boshqaring.\n\n**4. Tahlil** — Top dilerlar, mahsulotlar, kredit real vaqtda.\n\n14 kunlik bepul sinov. Sozlash to'lovi yo'q.`,
      contentEn: `## What is Supplio?\n\nSupplio is a modern B2B distribution management platform built for manufacturers, wholesalers, and distributors.\n\n## Who is it for?\n\n- **Manufacturers** selling to regional distributor networks\n- **Distributors** managing hundreds of dealers across multiple branches\n- **Wholesalers** needing real-time credit control\n\n## Key Features\n\n**1. Telegram Bot** — Each branch gets a branded bot. Dealers order directly in chat.\n\n**2. Credit Control** — Every order is checked against credit limits. Auto-block on breach.\n\n**3. Multi-Branch** — Manage all branches from one dashboard.\n\n**4. Analytics** — Top dealers, products, credit utilization in real time.\n\n14-day free trial. No setup fees.`,
      contentRu: `## Что такое Supplio?\n\nSupplio — современная платформа управления B2B-дистрибуцией для производителей, оптовиков и дистрибьюторов.\n\n## Для кого?\n\n- **Производители** — продающие через дилерскую сеть\n- **Дистрибьюторы** — управляющие сотнями дилеров\n- **Оптовики** — нуждающиеся в контроле кредитов\n\n## Ключевые возможности\n\n**1. Telegram-боты** — Каждый филиал получает фирменного бота.\n\n**2. Контроль кредитов** — Каждый заказ проверяется по лимиту.\n\n**3. Мультифилиальность** — Управление всеми филиалами с одной панели.\n\n**4. Аналитика** — Топ дилеры, продажи, кредиты в реальном времени.\n\n14 дней бесплатно. Без платы за настройку.`,
      contentTr: `## Supplio Nedir?\n\nSupplio, üreticiler, toptancılar ve distribütörler için geliştirilmiş modern bir B2B dağıtım yönetim platformudur.\n\n## Kimler İçin?\n\n- Dağıtım ağına satan **üreticiler**\n- Yüzlerce bayi yöneten **distribütörler**\n- Gerçek zamanlı kredi kontrolü gereken **toptancılar**\n\n## Temel Özellikler\n\n**1. Telegram Botu** — Her şube markalı bir bot alır.\n\n**2. Kredi Kontrolü** — Her sipariş limitle kontrol edilir.\n\n**3. Çok Şubeli Yönetim** — Tüm şubeleri tek panelden yönetin.\n\n**4. Analitik** — Gerçek zamanlı bayiler, ürünler, kredi kullanımı.\n\n14 günlük ücretsiz deneme.`,
      contentUzCyr: `## Supplio нима?\n\nSupplio — ишлаб чиқарувчилар, улгурчи савдогарлар ва дистрибьюторлар учун замонавий B2B дистрибуция бошқарув платформаси.\n\n## Асосий имкониятлар\n\n**1. Telegram Бот** — Ҳар бир филиал брендланган ботини олади.\n\n**2. Кредит Назорат** — Ҳар бир буюртма лимит бўйича текширилади.\n\n**3. Кўп Филиал** — Барча филиалларни битта панелдан бошқаринг.\n\n14 кунлик бепул синов.`,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=85",
      isPublished: true,
    },
    {
      slugUz: "supplio-v2-taqdimot",
      slugEn: "supplio-v2-launch",
      slugRu: "supplio-v2-zapusk",
      slugTr: "supplio-v2-tanitim",
      slugUzCyr: "supplio-v2-taqdimot-cyr",
      titleUz: "Supplio V2: Noldan Qayta Yaratildi",
      titleEn: "Introducing Supplio V2 — Rebuilt from the Ground Up",
      titleRu: "Представляем Supplio V2 — Полностью Перестроен",
      titleTr: "Supplio V2'yi Tanıtıyoruz — Sıfırdan Yeniden İnşa Edildi",
      titleUzCyr: "Supplio V2 Тақдимоти — Нолдан Қайта Яратилди",
      excerptUz: "Markaziy Osiyodagi B2B distribyutorlar uchun eng kuchli kredit-nazorat tizimi tayyor.",
      excerptEn: "The most powerful credit-control system ever built for B2B distributors in Central Asia is here.",
      excerptRu: "Самая мощная система кредитного контроля для B2B-дистрибьюторов Центральной Азии уже здесь.",
      excerptTr: "Orta Asya'daki B2B distribütörler için en güçlü kredi kontrol sistemi burada.",
      excerptUzCyr: "Марказий Осиёдаги B2B дистрибьюторлар учун энг кучли кредит-назорат тизими тайёр.",
      contentUz: "Biz Supplio-ni butunlay qaytadan yaratdik. Yangi versiyada real vaqt sinxronizatsiyasi, har bir buyurtmada kredit tekshiruvi va yangilangan boshqaruv paneli mavjud.",
      contentEn: "We've completely reimagined Supplio from the ground up. The new version features real-time ledger synchronization, instant credit verification on every order, and a redesigned dashboard.",
      contentRu: "Мы полностью перестроили Supplio. Новая версия включает синхронизацию в реальном времени, мгновенную проверку кредитных лимитов и обновлённую панель управления.",
      contentTr: "Supplio'yu tamamen yeniden hayal ettik. Gerçek zamanlı senkronizasyon, anında kredi doğrulama ve yeniden tasarlanmış kontrol paneli içeriyor.",
      contentUzCyr: "Биз Supplio-ни бутунлай қайтадан яратдик. Янги версияда реал вақт синхронизацияси ва янгиланган бошқарув панели мавжуд.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      isPublished: true,
    },
    {
      slugUz: "telegram-orqali-distributsiya",
      slugEn: "telegram-first-distribution",
      slugRu: "telegram-pervym-delom",
      slugTr: "once-telegram-dagitim",
      slugUzCyr: "telegram-orqali-distributsiya-cyr",
      titleUz: "Nima Uchun Distribyutorlar Telegramga O'tmoqda",
      titleEn: "Why Distributors Are Moving to Telegram-First Workflows",
      titleRu: "Почему Дистрибьюторы Переходят на Telegram",
      titleTr: "Distribütörler Neden Telegram'a Geçiyor",
      titleUzCyr: "Нима Учун Дистрибьюторлар Телеграмга Ўтмоқда",
      excerptUz: "Ko'proq distribyutorlar an'anaviy ilovalardan Telegram asosidagi buyurtma tizimlariga o'tmoqda.",
      excerptEn: "More distributors are replacing traditional apps with Telegram-based ordering systems.",
      excerptRu: "Всё больше дистрибьюторов заменяют традиционные приложения системами заказов через Telegram.",
      excerptTr: "Giderek daha fazla distribütör geleneksel uygulamaları Telegram tabanlı sistemlerle değiştiriyor.",
      excerptUzCyr: "Кўпроқ дистрибьюторлар анъанавий иловалардан Телеграм асосидаги тизимларига ўтмоқда.",
      contentUz: "Telegram endi shunchaki messenger emas — biznes operatsion tizimiga aylanmoqda. Ma'lumotlarimiz shuni ko'rsatadiki, Telegram orqali buyurtma berish an'anaviy veb-formalarga nisbatan 73% tezroq.",
      contentEn: "Telegram is no longer just a messenger — it's becoming a business operating system. Our data shows Telegram-based ordering reduces order processing time by 73% vs traditional web forms.",
      contentRu: "Telegram — это уже не просто мессенджер, а полноценная бизнес-операционная система. Наши данные: Telegram-заказы на 73% быстрее традиционных веб-форм.",
      contentTr: "Telegram artık sadece bir mesajlaşma uygulaması değil. Telegram tabanlı siparişler geleneksel formlardan %73 daha hızlı.",
      contentUzCyr: "Телеграм энди шунчаки мессенжер эмас. Буюртмалар анъанавий веб-формаларга нисбатан 73% тезроқ.",
      image: "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=800&q=80",
      isPublished: true,
    },
  ];

  for (const article of articles) {
    const existing = await (prisma as any).news.findFirst({ where: { slugUz: article.slugUz } });
    if (!existing) {
      await (prisma as any).news.create({ data: article });
      console.log(`  ✓ News created: ${article.titleEn}`);
    } else {
      console.log(`  - News exists: ${article.slugUz} (skipped)`);
    }
  }
  console.log("✓ News done");
}

async function main() {
  console.log("🚀 Supplio Seed Script starting...\n");
  await seedSettings();
  await seedTariffs();
  await seedNews();
  console.log("\n✅ All done!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
