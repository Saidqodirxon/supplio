import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await (prisma as any).tariffPlan.deleteMany({});
  await (prisma as any).news.deleteMany({});
  await (prisma as any).systemSettings.deleteMany({});

  // 0. Settings
  await (prisma as any).systemSettings.create({
    data: {
      id: "GLOBAL",
      newsEnabled: true,
      defaultTrialDays: 14,
      systemVersion: "2.1.0",
      globalNotifyUz:
        "Supplio V2 tarmog'i ishga tushirildi! Barcha dilerlar uchun yangi imkoniyatlar.",
      globalNotifyRu:
        "Сеть Supplio V2 запущена! Новые возможности для всех дилеров.",
      globalNotifyEn:
        "Supplio V2 network is live! New features for all dealers.",
      globalNotifyTr:
        "Supplio V2 ağı yayında! Tüm bayiler için yeni özellikler.",
    },
  });

  // 1. Tariffs
  const tariffs = [
    {
      order: 1,
      nameUz: "Boshlang'ich",
      nameRu: "Стартовый",
      nameEn: "Starter",
      nameTr: "Başlangıç",
      price: "249,000",
      isActive: true,
      isPopular: false,
      featuresUz: [
        "1 ta filial",
        "50 tagacha diler",
        "1 ta Telegram bot",
        "Asosiy tahlillar",
      ],
      featuresRu: [
        "1 филиал",
        "До 50 дилеров",
        "1 Telegram-бот",
        "Базовая аналитика",
      ],
      featuresEn: [
        "1 Branch",
        "Up to 50 dealers",
        "1 Telegram bot",
        "Basic analytics",
      ],
      featuresTr: [
        "1 Şube",
        "50'ye kadar bayi",
        "1 Telegram botu",
        "Temel analizler",
      ],
    },
    {
      order: 2,
      nameUz: "Biznes",
      nameRu: "Бизнес",
      nameEn: "Business",
      nameTr: "İşletme",
      price: "749,000",
      isActive: true,
      isPopular: true,
      featuresUz: [
        "3 tagacha filial",
        "Cheksiz diler",
        "3 ta Telegram bot",
        "Real vaqt kredit nazorati",
        "Ustuvor qo'llab-quvvatlash",
      ],
      featuresRu: [
        "До 3 филиалов",
        "Безлимитные дилеры",
        "3 Telegram-бота",
        "Мониторинг кредитов в реальном времени",
        "Приоритетная поддержка",
      ],
      featuresEn: [
        "Up to 3 branches",
        "Unlimited dealers",
        "3 Telegram bots",
        "Real-time credit monitoring",
        "Priority support",
      ],
      featuresTr: [
        "3'e kadar şube",
        "Sınırsız bayi",
        "3 Telegram botu",
        "Gerçek zamanlı kredi takibi",
        "Öncelikli destek",
      ],
    },
    {
      order: 3,
      nameUz: "Korporativ",
      nameRu: "Корпоративный",
      nameEn: "Enterprise",
      nameTr: "Kurumsal",
      price: "1,990,000",
      isActive: true,
      isPopular: false,
      featuresUz: [
        "Cheksiz filiallar",
        "Maxsus brendlangan botlar",
        "API kirish huquqi",
        "Shaxsiy menejer",
      ],
      featuresRu: [
        "Безлимитные филиалы",
        "Брендированные боты",
        "Доступ к API",
        "Персональный менеджер",
      ],
      featuresEn: [
        "Unlimited branches",
        "Custom branded bots",
        "API access",
        "Dedicated account manager",
      ],
      featuresTr: [
        "Sınırsız şube",
        "Özel markalı botlar",
        "API erişimi",
        "Özel hesap yöneticisi",
      ],
    },
  ];

  for (const t of tariffs) {
    await (prisma as any).tariffPlan.create({ data: t });
  }

  // 2. News
  const news = [
    {
      slugUz: "supplio-v2-launch",
      slugUzCyr: "supplio-v2-launch-uz-cyr",
      slugRu: "supplio-v2-launch-ru",
      slugEn: "supplio-v2-launch-en",
      slugTr: "supplio-v2-launch-tr",
      titleUz: "Supplio V2: Noldan Qayta Yaratilgan",
      titleUzCyr: "Supplio V2: Нолдан Қайта Яратилган",
      titleRu: "Представляем Supplio V2 — платформа переработана",
      titleEn: "Introducing Supplio V2 — Platform Rebuilt",
      titleTr: "Supplio V2 Tanıtıldı — Platform Yenilendi",
      excerptUz:
        "Markaziy Osiyodagi B2B distribyutorlar uchun eng kuchli tizim.",
      excerptUzCyr:
        "Марказий Осиёдаги B2B дистрибьюторлар учун энг кучли тизим.",
      excerptRu:
        "Самая мощная система для B2B-дистрибьюторов в Центральной Азии.",
      excerptEn:
        "The most powerful system for B2B distributors in Central Asia.",
      excerptTr: "Orta Asya'daki B2B distribütörleri için en güçlü sistem.",
      contentUz: "Biz Supplio-ni butunlay qaytadan yaratdik.",
      contentUzCyr: "Биз Supplio-ни бутунлай қайтадан яратдик.",
      contentRu: "Мы полностью перестроили Supplio.",
      contentEn: "We've completely reimagined Supplio.",
      contentTr: "Supplio'yu sıfırdan yeniden tasarladık.",
      isPublished: true,
    },
    {
      slugUz: "telegram-automation",
      slugUzCyr: "telegram-automation-uz-cyr",
      slugRu: "telegram-automation-ru",
      slugEn: "telegram-automation-en",
      slugTr: "telegram-automation-tr",
      titleUz: "Telegram orqali avtomatlashtirish",
      titleUzCyr: "Telegram орқали автоматлаштириш",
      titleRu: "Автоматизация через Telegram",
      titleEn: "Automation via Telegram",
      titleTr: "Telegram ile Otomasyon",
      excerptUz: "Nima uchun dilerlar Telegram botlarini afzal ko'rishadi?",
      excerptUzCyr: "Нима учун дилерлар Telegram ботларини афзал кўришади?",
      excerptRu: "Почему дилеры предпочитают Telegram-ботов?",
      excerptEn: "Why dealers prefer Telegram bots?",
      excerptTr: "Bayiler neden Telegram botlarını tercih ediyor?",
      contentUz:
        "Telegram botlari dilerlar uchun qulay interfeys taqdim etadi.",
      contentUzCyr:
        "Telegram ботлари дилерлар учун қулай интерфейс тақдим этади.",
      contentRu: "Telegram-боты предоставляют удобный интерфейс для дилеров.",
      contentEn: "Telegram bots provide a convenient interface for dealers.",
      contentTr: "Telegram botları bayiler için kullanışlı bir arayüz sunar.",
      isPublished: true,
    },
  ];

  for (const n of news) {
    await (prisma as any).news.create({ data: n });
  }

  console.log("Seeded settings, tariffs and news successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
