import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { Telegraf } from "telegraf";

const DEMO_PHONE = "+998000000000";
const DEMO_PASSWORD = "demo1234";

@Injectable()
export class DemoService {
  private readonly logger = new Logger(DemoService.name);
  private bot: Telegraf | null = null;

  constructor(private prisma: PrismaService) {
    const token = process.env.TELEGRAM_BOT_TOKEN || process.env.LOG_BOT_TOKEN;
    if (token) this.bot = new Telegraf(token);
  }

  async requestDemoAccess(data: {
    fullName: string;
    phone: string;
    company?: string;
  }) {
    // Save lead
    const lead = await this.prisma.lead
      .create({
        data: {
          fullName: data.fullName,
          phone: data.phone,
          info: data.company
            ? `Demo request — Company: ${data.company}`
            : "Demo request",
        },
      })
      .catch(() => null);

    // Notify DEMO_LOG_CHAT_ID
    const chatId =
      process.env.DEMO_LOG_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (this.bot && chatId) {
      const msg =
        `🎯 *Demo Access Request*\n` +
        `👤 ${data.fullName}\n` +
        `📞 ${data.phone}\n` +
        (data.company ? `🏢 ${data.company}\n` : "") +
        `📅 ${new Date().toLocaleString("uz-UZ")}\n\n` +
        `🔑 Demo credentials sent to user:\n` +
        `Phone: \`${DEMO_PHONE}\`\nPassword: \`${DEMO_PASSWORD}\``;
      await this.bot.telegram
        .sendMessage(chatId, msg, { parse_mode: "Markdown" })
        .catch(() => {});
    }

    return {
      success: true,
      leadId: lead?.id,
      demo: {
        phone: DEMO_PHONE,
        password: DEMO_PASSWORD,
        url: "https://demo.supplio.uz/login?demo=1&access=full",
        note: "These credentials give you full access to the demo environment. Data resets daily at midnight.",
      },
    };
  }

  async logDemoActivity(companyName: string, action: string, detail: string) {
    const chatId = process.env.DEMO_LOG_CHAT_ID;
    if (!this.bot || !chatId) return;
    const msg = `📊 *Demo Activity*\n🏢 ${companyName}\n⚡ ${action}\n📝 ${detail}\n📅 ${new Date().toLocaleString("uz-UZ")}`;
    await this.bot.telegram
      .sendMessage(chatId, msg, { parse_mode: "Markdown" })
      .catch(() => {});
  }

  @Cron("0 0 */2 * *")
  async handleDailyReset() {
    this.logger.log("CRON: Starting Demo Environment Reset (every 2 days)...");

    const demoCompanies = await this.prisma.company.findMany({
      where: { isDemo: true },
    });

    for (const company of demoCompanies) {
      try {
        await this.resetCompanyData(company.id);
        this.logger.log(`SUCCESS: Reset data for ${company.name}`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`FAILED: Could not reset ${company.name}`, message);
      }
    }
  }

  async resetCompanyData(companyId: string) {
    // 1. Hard delete via raw SQL — bypasses soft-delete middleware so phone/sku unique constraints don't collide on re-seed
    await this.prisma
      .$executeRaw`DELETE FROM "Order" WHERE "companyId" = ${companyId}`;
    await this.prisma
      .$executeRaw`DELETE FROM "Payment" WHERE "companyId" = ${companyId}`;
    await this.prisma
      .$executeRaw`DELETE FROM "LedgerTransaction" WHERE "companyId" = ${companyId}`;
    await this.prisma
      .$executeRaw`DELETE FROM "Dealer" WHERE "companyId" = ${companyId}`;
    await this.prisma
      .$executeRaw`DELETE FROM "Product" WHERE "companyId" = ${companyId}`;
    await this.prisma
      .$executeRaw`DELETE FROM "Expense" WHERE "companyId" = ${companyId}`;

    // We keep the branches to avoid ID mismatches in re-seeding if we want simplicity
    const branches = await this.prisma.branch.findMany({
      where: { companyId },
    });
    let branchId = branches[0]?.id;

    if (!branchId) {
      const newBranch = await this.prisma.branch.create({
        data: {
          companyId,
          name: "Main distribution Hub",
          address: "Demo City, St 1",
        },
      });
      branchId = newBranch.id;
    }

    const d1 = `dealer-${companyId}-1`;
    const d2 = `dealer-${companyId}-2`;
    const d3 = `dealer-${companyId}-3`;
    const d4 = `dealer-${companyId}-4`;
    const d5 = `dealer-${companyId}-5`;

    // 2. Create 5 mock dealers
    await this.prisma.dealer.createMany({
      data: [
        {
          id: d1,
          companyId,
          branchId,
          name: "Apex Retail",
          phone: "+998901112233",
          creditLimit: 10000000,
          currentDebt: 4500000,
          isApproved: true,
        },
        {
          id: d2,
          companyId,
          branchId,
          name: "Global Mart",
          phone: "+998904445566",
          creditLimit: 5000000,
          currentDebt: 1200000,
          isApproved: true,
        },
        {
          id: d3,
          companyId,
          branchId,
          name: "City Express",
          phone: "+998907778899",
          creditLimit: 2000000,
          currentDebt: 2500000,
          isApproved: true,
        },
        {
          id: d4,
          companyId,
          branchId,
          name: "Metro Store",
          phone: "+998909990011",
          creditLimit: 8000000,
          currentDebt: 650000,
          isApproved: true,
        },
        {
          id: d5,
          companyId,
          branchId,
          name: "FastTrade",
          phone: "+998902223344",
          creditLimit: 15000000,
          currentDebt: 3200000,
          isApproved: true,
        },
      ],
    });

    // 3. Create 5 mock products
    await this.prisma.product.createMany({
      data: [
        {
          companyId,
          name: "Premium Box Set",
          sku: "PBS-001",
          price: 250000,
          costPrice: 180000,
          stock: 150,
          unit: "box",
        },
        {
          companyId,
          name: "Standard Pack",
          sku: "SP-002",
          price: 45000,
          costPrice: 30000,
          stock: 2000,
          unit: "pcs",
        },
        {
          companyId,
          name: "Industrial Set",
          sku: "IS-003",
          price: 1200000,
          costPrice: 950000,
          stock: 45,
          unit: "set",
          isPromo: true,
        },
        {
          companyId,
          name: "Mini Sample",
          sku: "MS-004",
          price: 12000,
          costPrice: 8000,
          stock: 5000,
          unit: "pcs",
        },
        {
          companyId,
          name: "Bulk Container",
          sku: "BC-005",
          price: 3500000,
          costPrice: 2800000,
          stock: 12,
          unit: "cnt",
        },
      ],
    });

    // 4. Create 10 mock orders
    const now = new Date();
    const day = (n: number) => new Date(now.getTime() - n * 86400000);
    const orderItems = (name: string, qty: number, price: number) =>
      JSON.stringify([
        { productId: null, name, qty, unit: "pcs", price, total: price * qty },
      ]);

    const orderData = [
      {
        companyId,
        dealerId: d1,
        branchId,
        totalAmount: 4500000,
        totalCost: 3240000,
        status: "DELIVERED",
        items: orderItems("Premium Box Set", 18, 250000),
        createdAt: day(10),
      },
      {
        companyId,
        dealerId: d2,
        branchId,
        totalAmount: 1200000,
        totalCost: 900000,
        status: "PENDING",
        items: orderItems("Standard Pack", 27, 45000),
        createdAt: day(8),
      },
      {
        companyId,
        dealerId: d3,
        branchId,
        totalAmount: 2500000,
        totalCost: 1900000,
        status: "COMPLETED",
        items: orderItems("Industrial Set", 2, 1200000),
        createdAt: day(7),
      },
      {
        companyId,
        dealerId: d4,
        branchId,
        totalAmount: 650000,
        totalCost: 480000,
        status: "DELIVERED",
        items: orderItems("Mini Sample", 54, 12000),
        createdAt: day(6),
      },
      {
        companyId,
        dealerId: d5,
        branchId,
        totalAmount: 3200000,
        totalCost: 2400000,
        status: "DELIVERED",
        items: orderItems("Premium Box Set", 13, 250000),
        createdAt: day(5),
      },
      {
        companyId,
        dealerId: d1,
        branchId,
        totalAmount: 900000,
        totalCost: 660000,
        status: "ACCEPTED",
        items: orderItems("Standard Pack", 20, 45000),
        createdAt: day(4),
      },
      {
        companyId,
        dealerId: d2,
        branchId,
        totalAmount: 1800000,
        totalCost: 1350000,
        status: "PREPARING",
        items: orderItems("Bulk Container", 1, 3500000),
        createdAt: day(3),
      },
      {
        companyId,
        dealerId: d3,
        branchId,
        totalAmount: 360000,
        totalCost: 240000,
        status: "SHIPPED",
        items: orderItems("Mini Sample", 30, 12000),
        createdAt: day(2),
      },
      {
        companyId,
        dealerId: d4,
        branchId,
        totalAmount: 2000000,
        totalCost: 1600000,
        status: "PENDING",
        items: orderItems("Industrial Set", 1, 1200000),
        createdAt: day(1),
      },
      {
        companyId,
        dealerId: d5,
        branchId,
        totalAmount: 500000,
        totalCost: 350000,
        status: "CANCELLED",
        items: orderItems("Standard Pack", 11, 45000),
        createdAt: day(0),
      },
    ] as any[];

    for (const od of orderData) {
      await this.prisma.order.create({ data: od });
    }

    // 5. Ledger transactions
    await this.prisma.ledgerTransaction.createMany({
      data: [
        {
          companyId,
          dealerId: d1,
          type: "ORDER",
          amount: 4500000,
          createdAt: day(10),
        },
        {
          companyId,
          dealerId: d2,
          type: "ORDER",
          amount: 1200000,
          createdAt: day(8),
        },
        {
          companyId,
          dealerId: d3,
          type: "ORDER",
          amount: 2500000,
          createdAt: day(7),
        },
        {
          companyId,
          dealerId: d4,
          type: "ORDER",
          amount: 650000,
          createdAt: day(6),
        },
        {
          companyId,
          dealerId: d5,
          type: "ORDER",
          amount: 3200000,
          createdAt: day(5),
        },
        {
          companyId,
          dealerId: d1,
          type: "ORDER",
          amount: 900000,
          createdAt: day(4),
        },
        {
          companyId,
          dealerId: d2,
          type: "ORDER",
          amount: 1800000,
          createdAt: day(3),
        },
        {
          companyId,
          dealerId: d3,
          type: "ORDER",
          amount: 360000,
          createdAt: day(2),
        },
        {
          companyId,
          dealerId: d4,
          type: "ORDER",
          amount: 2000000,
          createdAt: day(1),
        },
        {
          companyId,
          dealerId: d5,
          type: "ORDER",
          amount: 500000,
          createdAt: day(0),
        },
        // Payments (reduce debt)
        {
          companyId,
          dealerId: d1,
          type: "PAYMENT",
          amount: 4500000,
          createdAt: day(9),
        },
        {
          companyId,
          dealerId: d3,
          type: "PAYMENT",
          amount: 2360000,
          createdAt: day(6),
        },
        {
          companyId,
          dealerId: d5,
          type: "PAYMENT",
          amount: 3200000,
          createdAt: day(4),
        },
      ],
    });

    // 6. Add a payment record for d1
    await this.prisma.payment.create({
      data: {
        companyId,
        dealerId: d1,
        branchId,
        amount: 4500000,
        method: "cash",
        note: "Demo payment",
        createdAt: day(9),
      },
    });

    this.logger.log(`Data reset and re-seeded for company: ${companyId}`);
  }

  // ── Public demo data (no auth required) ──────────────────────────────────

  getDemoNews() {
    return [
      {
        id: "demo-news-1",
        slugEn: "supplio-v2-launch",
        slugUz: "supplio-v2-chiqarildi",
        slugRu: "supplio-v2-launch",
        slugTr: "supplio-v2-launch",
        slugUzCyr: "supplio-v2-launch",
        titleEn: "Introducing Supplio V2 — Rebuilt from the Ground Up",
        titleUz: "Supplio V2: Noldan Qayta Yaratilgan",
        titleRu: "Представляем Supplio V2 — полностью переработанная платформа",
        titleTr: "Supplio V2 Tanıtıldı — Sıfırdan Yeniden İnşa Edildi",
        titleUzCyr: "Supplio V2: Нолдан Қайта Яратилди",
        excerptEn:
          "The most powerful credit-control system ever built for B2B distributors in Central Asia is here.",
        excerptUz:
          "Markaziy Osiyodagi B2B distribyutorlar uchun eng kuchli kredit-nazorat tizimi tayyor.",
        excerptRu:
          "Самая мощная система кредитного контроля для B2B-дистрибьюторов Центральной Азии уже здесь.",
        excerptTr:
          "Orta Asya'daki B2B distribütörleri için yapılmış en güçlü kredi kontrol sistemi burada.",
        excerptUzCyr:
          "Марказий Осиёдаги B2B дистрибуторлар учун энг кучли кредит-назорат тизими тайёр.",
        contentEn:
          "We've completely reimagined Supplio from the ground up. The new version features real-time ledger synchronization, instant credit verification on every order, and a redesigned dashboard that gives you full visibility into your distribution network.\n\nEvery Telegram bot interaction is now directly linked to your financial dashboard — when a dealer places an order, the credit limit is verified in milliseconds.",
        contentUz:
          "Biz Supplio-ni butunlay qaytadan yaratdik. Yangi versiyada real vaqt rejimidagi sinxronizatsiya, har bir buyurtmada tezkor kredit tekshiruvi va yangilangan boshqaruv paneli mavjud.",
        contentRu:
          "Мы полностью перестроили Supplio. Новая версия включает синхронизацию данных в реальном времени, мгновенную проверку кредитных лимитов при каждом заказе и обновлённую панель управления.",
        contentTr:
          "Supplio'yu sıfırdan yeniden tasarladık. Yeni versiyonda gerçek zamanlı defter senkronizasyonu ve anlık kredi doğrulaması bulunuyor.",
        contentUzCyr:
          "Биз Supplio-ни бутунлай қайтадан яратдик. Янги версияда реал вақт синхронизацияси ва тезкор кредит текшируви мавжуд.",
        image:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format",
        isPublished: true,
        createdAt: new Date("2026-03-02").toISOString(),
      },
      {
        id: "demo-news-2",
        slugEn: "telegram-first-distribution",
        slugUz: "telegram-orqali-tarqatish",
        slugRu: "telegram-pervaya-distribuciya",
        slugTr: "telegram-oncelikli-dagitim",
        slugUzCyr: "telegram-orqali-tarqatish",
        titleEn: "Why Distributors Are Moving to Telegram-First Workflows",
        titleUz: "Nima Uchun Distribyutorlar Telegramga O'tmoqda",
        titleRu: "Почему дистрибьюторы переходят на Telegram",
        titleTr: "Distribütörler Neden Telegram Odaklı İş Akışlarına Geçiyor",
        titleUzCyr: "Нима Учун Дистрибуторлар Telegramга Ўтмоқда",
        excerptEn:
          "More distributors are replacing traditional apps with Telegram-based ordering systems.",
        excerptUz:
          "Ko'proq distribyutorlar an'anaviy ilovalardan Telegram asosidagi buyurtma tizimlariga o'tmoqda.",
        excerptRu:
          "Всё больше дистрибьюторов заменяют традиционные приложения на системы заказов через Telegram.",
        excerptTr:
          "Giderek daha fazla distribütör geleneksel uygulamalardan Telegram tabanlı sipariş sistemlerine geçiyor.",
        excerptUzCyr:
          "Кўпроқ дистрибуторлар анъанавий иловалардан Telegram асосидаги буюртма тизимларига ўтмоқда.",
        contentEn:
          "Telegram is no longer just a messenger — it's becoming a business operating system. With Supplio's multi-bot architecture, each dealer gets a lightweight interface that works even on slow connections.",
        contentUz:
          "Telegram endi shunchaki messenger emas — bu biznes operatsion tizimiga aylanmoqda.",
        contentRu:
          "Telegram — это уже не просто мессенджер, а полноценная бизнес-операционная система.",
        contentTr:
          "Telegram artık sadece bir mesajlaşma uygulaması değil — bir iş işletim sistemi haline geliyor.",
        contentUzCyr:
          "Telegram энди шунчаки messenger эмас — бу бизнес операцион тизимига айланмоқда.",
        image:
          "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format",
        isPublished: true,
        createdAt: new Date("2026-02-28").toISOString(),
      },
      {
        id: "demo-news-3",
        slugEn: "credit-control-best-practices",
        slugUz: "kredit-nazorati-amaliyotlari",
        slugRu: "luchshie-praktiki-kreditnogo-kontrolya",
        slugTr: "kredi-kontrolu-en-iyi-uygulamalar",
        slugUzCyr: "kredit-nazorati-amaliyotlari",
        titleEn: "Credit Control Best Practices for B2B Distributors",
        titleUz: "B2B Distribyutorlar Uchun Kredit Nazorati Amaliyotlari",
        titleRu: "Лучшие практики кредитного контроля для B2B-дистрибьюторов",
        titleTr: "B2B Distribütörler için Kredi Kontrolü En İyi Uygulamaları",
        titleUzCyr: "B2B Дистрибуторлар Учун Кредит Назорати Амалиётлари",
        excerptEn:
          "How leading distributors use real-time credit tracking to reduce bad debt by up to 40%.",
        excerptUz:
          "Yetakchi distribyutorlar qanday qilib real vaqt kredit kuzatuvidan foydalanib, yomon qarzni 40% gacha kamaytirmoqda.",
        excerptRu:
          "Как ведущие дистрибьюторы используют отслеживание кредитов в реальном времени для снижения безнадёжных долгов на 40%.",
        excerptTr:
          "Önde gelen distribütörler, gerçek zamanlı kredi takibini kullanarak kötü borçları %40'a kadar nasıl azaltıyor.",
        excerptUzCyr:
          "Yetakchi distribuçiyachi kompaniyalar qanday qilib real vaqt kredit kuzatuvidan foydalanib yomon qarzni 40% gacha kamaytirmoqda.",
        contentEn:
          "Effective credit management is the backbone of successful distribution. Companies using automated credit limit enforcement see dramatic reductions in overdue accounts.\n\nSupplio's real-time credit tracking automatically blocks orders that would exceed a dealer's limit, alerting both the dealer and your team instantly.",
        contentUz:
          "Samarali kredit boshqaruvi muvaffaqiyatli distribyutsiyaning asosini tashkil etadi.",
        contentRu:
          "Эффективное управление кредитами является основой успешного дистрибьюторства.",
        contentTr: "Etkili kredi yönetimi, başarılı dağıtımın temelidir.",
        contentUzCyr:
          "Samarali kredit boshqaruvi muvaffaqiyatli distribyuçiyaning asosini tashkil etadi.",
        image:
          "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format",
        isPublished: true,
        createdAt: new Date("2026-02-15").toISOString(),
      },
      {
        id: "demo-news-4",
        slugEn: "supplio-web-store-launch",
        slugUz: "supplio-veb-dokon-ishga-tushdi",
        slugRu: "zapusk-veb-magazina-supplio",
        slugTr: "supplio-web-magazasi-acildi",
        slugUzCyr: "supplio-veb-dokon-ishga-tushdi",
        titleEn: "Introducing the Supplio Web Store — Your B2B Catalog Online",
        titleUz: "Supplio Veb Do'koni — B2B Katalogingiz Onlayn",
        titleRu: "Представляем Supplio Веб-Магазин — ваш B2B-каталог онлайн",
        titleTr: "Supplio Web Mağazası Tanıtıldı — B2B Kataloğunuz Online",
        titleUzCyr: "Supplio Веб Дўкон — B2B Каталогингиз Онлайн",
        excerptEn:
          "Every Supplio plan now includes a branded web store where dealers can browse your catalog and place orders anytime.",
        excerptUz:
          "Har bir Supplio tarifi endi brendlangan veb-do'konni o'z ichiga oladi.",
        excerptRu:
          "Каждый тариф Supplio теперь включает брендированный веб-магазин для заказов.",
        excerptTr: "Her Supplio planı artık markalı bir web mağazası içeriyor.",
        excerptUzCyr:
          "Har bir Supplio tarifi endi brendlangan veb-do'konni o'z ichiga oladi.",
        contentEn:
          "The Supplio Web Store is a public-facing storefront automatically generated from your product catalog. Dealers can browse products, check prices, and place orders directly — without needing the Telegram bot.\n\nEvery store comes with your company branding, product images, and is accessible at your unique URL.",
        contentUz:
          "Supplio veb-do'koni mahsulot katalogingizdan avtomatik yaratilgan ommaviy vitrinadir.",
        contentRu:
          "Веб-магазин Supplio — это публичный витрина, автоматически созданная из вашего каталога продуктов.",
        contentTr:
          "Supplio Web Mağazası, ürün kataloğunuzdan otomatik olarak oluşturulan genel bir vitrindır.",
        contentUzCyr:
          "Supplio veb-do'koni mahsulot katalogingizdan avtomatik yaratilgan ommaviy vitrinadir.",
        image:
          "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format",
        isPublished: true,
        createdAt: new Date("2026-01-20").toISOString(),
      },
      {
        id: "demo-news-5",
        slugEn: "analytics-dashboard-update",
        slugUz: "analitika-paneli-yangilandi",
        slugRu: "obnovlenie-analiticheskoy-paneli",
        slugTr: "analitik-pano-guncelleme",
        slugUzCyr: "analitika-paneli-yangilandi",
        titleEn: "New Analytics Dashboard — Full Visibility into Your Network",
        titleUz: "Yangi Analitika Paneli — Tarmog'ingizga To'liq Ko'rinish",
        titleRu: "Новая аналитическая панель — полная видимость вашей сети",
        titleTr: "Yeni Analitik Pano — Ağınıza Tam Görünürlük",
        titleUzCyr: "Yangi Analitika Paneli — Tarmog'ingizga To'liq Ko'rinish",
        excerptEn:
          "The redesigned analytics dashboard gives managers a complete picture of dealer performance, revenue trends, and credit risk in real time.",
        excerptUz:
          "Qayta ishlangan analitika paneli menejerlarga diler faoliyati, daromad tendensiyalari va kredit riskini real vaqtda ko'rish imkonini beradi.",
        excerptRu:
          "Обновлённая аналитическая панель даёт менеджерам полную картину эффективности дилеров, тенденций выручки и кредитных рисков в реальном времени.",
        excerptTr:
          "Yeniden tasarlanan analitik pano, yöneticilere bayi performansı, gelir eğilimleri ve kredi riskini gerçek zamanlı olarak görme imkânı tanıyor.",
        excerptUzCyr:
          "Qayta ishlangan analitika paneli menejerlarga real vaqtda diler faoliyati va kredit riskini ko'rish imkonini beradi.",
        contentEn:
          "Understanding your distribution network's health has never been easier. The new analytics dashboard consolidates data from all your branches and dealers into one powerful view.\n\nTrack top performers, identify at-risk dealers, and monitor revenue trends by branch, product, or time period.",
        contentUz:
          "Distribyutsiya tarmog'ingiz holatini tushunish hech qachon bunday oson bo'lmagan.",
        contentRu:
          "Понимание состояния вашей сети дистрибуции ещё никогда не было таким простым.",
        contentTr:
          "Dağıtım ağınızın durumunu anlamak hiç bu kadar kolay olmamıştı.",
        contentUzCyr:
          "Distribyuçiya tarmog'ingiz holatini tushunish hech qachon bunday oson bo'lmagan.",
        image:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format",
        isPublished: true,
        createdAt: new Date("2026-01-05").toISOString(),
      },
    ];
  }

  getDemoTariffs() {
    return [
      {
        id: "demo-tariff-1",
        planKey: "FREE",
        nameEn: "Free",
        nameUz: "Bepul",
        nameRu: "Ð‘ÐµÑÐ¿Ð»Ð°Ñ‚Ð½Ð¾",
        nameTr: "Ãœcretsiz",
        price: "0",
        priceMonthly: "0",
        priceYearly: "0",
        featuresEn: [
          "1 branch",
          "3 staff",
          "50 dealers",
          "200 products",
          "Basic notifications",
        ],
        featuresUz: [
          "1 filial",
          "3 xodim",
          "50 diler",
          "200 mahsulot",
          "Asosiy bildirishnomalar",
        ],
        featuresRu: [
          "1 Ñ„Ð¸Ð»Ð¸Ð°Ð»",
          "3 ÑÐ¾Ñ‚Ñ€ÑƒÐ´Ð½Ð¸ÐºÐ°",
          "50 Ð´Ð¸Ð»ÐµÑ€Ð¾Ð²",
          "200 Ñ‚Ð¾Ð²Ð°Ñ€Ð¾Ð²",
          "Ð‘Ð°Ð·Ð¾Ð²Ñ‹Ðµ ÑƒÐ²ÐµÐ´Ð¾Ð¼Ð»ÐµÐ½Ð¸Ñ",
        ],
        featuresTr: [
          "1 ÅŸube",
          "3 personel",
          "50 bayi",
          "200 Ã¼rÃ¼n",
          "Temel bildirimler",
        ],
        isActive: true,
        isPopular: false,
        order: 0,
        maxBranches: 1,
        maxUsers: 3,
        maxDealers: 50,
        maxProducts: 200,
        maxCustomBots: 0,
        allowAnalytics: false,
        allowCustomBot: false,
        allowWebStore: true,
        trialDays: 14,
      },
      {
        id: "demo-tariff-2",
        planKey: "START",
        nameEn: "Start",
        nameUz: "Start",
        nameRu: "Ð¡Ñ‚Ð°Ñ€Ñ‚",
        nameTr: "BaÅŸlangÄ±Ã§",
        price: "9 999 so'm",
        priceMonthly: "9999",
        priceYearly: "99990",
        featuresEn: [
          "1 branch",
          "5 staff",
          "150 dealers",
          "500 products",
          "Web store",
          "Starter analytics",
        ],
        featuresUz: [
          "1 filial",
          "5 xodim",
          "150 diler",
          "500 mahsulot",
          "Web do'kon",
          "Boshlang'ich analitika",
        ],
        featuresRu: [
          "1 Ñ„Ð¸Ð»Ð¸Ð°Ð»",
          "5 ÑÐ¾Ñ‚Ñ€ÑƒÐ´Ð½Ð¸ÐºÐ¾Ð²",
          "150 Ð´Ð¸Ð»ÐµÑ€Ð¾Ð²",
          "500 Ñ‚Ð¾Ð²Ð°Ñ€Ð¾Ð²",
          "Ð’ÐµÐ±-Ð¼Ð°Ð³Ð°Ð·Ð¸Ð½",
          "Ð¡Ñ‚Ð°Ñ€Ñ‚Ð¾Ð²Ð°Ñ Ð°Ð½Ð°Ð»Ð¸Ñ‚Ð¸ÐºÐ°",
        ],
        featuresTr: [
          "1 ÅŸube",
          "5 personel",
          "150 bayi",
          "500 Ã¼rÃ¼n",
          "Web maÄŸaza",
          "BaÅŸlangÄ±Ã§ analitiÄŸi",
        ],
        isActive: true,
        isPopular: false,
        order: 1,
        maxBranches: 1,
        maxUsers: 5,
        maxDealers: 150,
        maxProducts: 500,
        maxCustomBots: 0,
        allowAnalytics: true,
        allowCustomBot: false,
        allowWebStore: true,
        trialDays: 14,
      },
      {
        id: "demo-tariff-3",
        planKey: "PRO",
        nameEn: "Pro",
        nameUz: "Pro",
        nameRu: "ÐŸÑ€Ð¾",
        nameTr: "Pro",
        price: "29 999 so'm",
        priceMonthly: "29999",
        priceYearly: "299990",
        featuresEn: [
          "3 branches",
          "15 staff",
          "1,000 dealers",
          "3,000 products",
          "1 Telegram bot",
          "Bulk import",
          "Full analytics",
        ],
        featuresUz: [
          "3 filial",
          "15 xodim",
          "1 000 diler",
          "3 000 mahsulot",
          "1 ta Telegram bot",
          "Ommaviy import",
          "To'liq analitika",
        ],
        featuresRu: [
          "3 Ñ„Ð¸Ð»Ð¸Ð°Ð»Ð°",
          "15 ÑÐ¾Ñ‚Ñ€ÑƒÐ´Ð½Ð¸ÐºÐ¾Ð²",
          "1 000 Ð´Ð¸Ð»ÐµÑ€Ð¾Ð²",
          "3 000 Ñ‚Ð¾Ð²Ð°Ñ€Ð¾Ð²",
          "1 Telegram-Ð±Ð¾Ñ‚",
          "ÐœÐ°ÑÑÐ¾Ð²Ñ‹Ð¹ Ð¸Ð¼Ð¿Ð¾Ñ€Ñ‚",
          "ÐŸÐ¾Ð»Ð½Ð°Ñ Ð°Ð½Ð°Ð»Ð¸Ñ‚Ð¸ÐºÐ°",
        ],
        featuresTr: [
          "3 ÅŸube",
          "15 personel",
          "1.000 bayi",
          "3.000 Ã¼rÃ¼n",
          "1 Telegram botu",
          "Toplu iÃ§e aktarma",
          "Tam analitik",
        ],
        isActive: true,
        isPopular: true,
        order: 2,
        maxBranches: 3,
        maxUsers: 15,
        maxDealers: 1000,
        maxProducts: 3000,
        maxCustomBots: 1,
        allowAnalytics: true,
        allowCustomBot: true,
        allowWebStore: true,
        trialDays: 14,
      },
      {
        id: "demo-tariff-4",
        planKey: "PREMIUM",
        nameEn: "Premium",
        nameUz: "Premium",
        nameRu: "ÐŸÑ€ÐµÐ¼Ð¸ÑƒÐ¼",
        nameTr: "Premium",
        price: "99 999 so'm",
        priceMonthly: "99999",
        priceYearly: "999990",
        featuresEn: [
          "10 branches",
          "50 staff",
          "5,000 dealers",
          "15,000 products",
          "3 Telegram bots",
          "Priority support",
          "Advanced controls",
        ],
        featuresUz: [
          "10 filial",
          "50 xodim",
          "5 000 diler",
          "15 000 mahsulot",
          "3 ta Telegram bot",
          "Ustuvor support",
          "Kengaytirilgan nazorat",
        ],
        featuresRu: [
          "10 Ñ„Ð¸Ð»Ð¸Ð°Ð»Ð¾Ð²",
          "50 ÑÐ¾Ñ‚Ñ€ÑƒÐ´Ð½Ð¸ÐºÐ¾Ð²",
          "5 000 Ð´Ð¸Ð»ÐµÑ€Ð¾Ð²",
          "15 000 Ñ‚Ð¾Ð²Ð°Ñ€Ð¾Ð²",
          "3 Telegram-Ð±Ð¾Ñ‚Ð°",
          "ÐŸÑ€Ð¸Ð¾Ñ€Ð¸Ñ‚ÐµÑ‚Ð½Ð°Ñ Ð¿Ð¾Ð´Ð´ÐµÑ€Ð¶ÐºÐ°",
          "Ð Ð°ÑÑˆÐ¸Ñ€ÐµÐ½Ð½Ñ‹Ð¹ ÐºÐ¾Ð½Ñ‚Ñ€Ð¾Ð»ÑŒ",
        ],
        featuresTr: [
          "10 ÅŸube",
          "50 personel",
          "5.000 bayi",
          "15.000 Ã¼rÃ¼n",
          "3 Telegram botu",
          "Ã–ncelikli destek",
          "GeliÅŸmiÅŸ kontroller",
        ],
        isActive: true,
        isPopular: false,
        order: 3,
        maxBranches: 10,
        maxUsers: 50,
        maxDealers: 5000,
        maxProducts: 15000,
        maxCustomBots: 3,
        allowAnalytics: true,
        allowCustomBot: true,
        allowWebStore: true,
        trialDays: 30,
      },
    ];

    /*
    return [
      {
        id: "demo-tariff-1",
        planKey: "FREE",
        nameEn: "Free", nameUz: "Bepul", nameRu: "Бесплатно", nameTr: "Ücretsiz",
        priceMonthly: "0", priceYearly: "0",
        featuresEn: ["1 branch", "5 users", "50 dealers", "200 products"],
        featuresUz: ["1 filial", "5 foydalanuvchi", "50 diler", "200 mahsulot"],
        featuresRu: ["1 филиал", "5 пользователей", "50 дилеров", "200 товаров"],
        featuresTr: ["1 şube", "5 kullanıcı", "50 bayi", "200 ürün"],
        isActive: true, isPopular: false, order: 0,
        maxBranches: 1, maxUsers: 5, maxDealers: 50, maxProducts: 200,
        allowAnalytics: false, allowCustomBot: false, allowWebStore: true,
        trialDays: 14,
      },
      {
        id: "demo-tariff-2",
        planKey: "START",
        nameEn: "Starter", nameUz: "Boshlang'ich", nameRu: "Стартовый", nameTr: "Başlangıç",
        priceMonthly: "99000", priceYearly: "990000",
        featuresEn: ["3 branches", "15 users", "500 dealers", "Analytics"],
        featuresUz: ["3 filial", "15 foydalanuvchi", "500 diler", "Analitika"],
        featuresRu: ["3 филиала", "15 пользователей", "500 дилеров", "Аналитика"],
        featuresTr: ["3 şube", "15 kullanıcı", "500 bayi", "Analitik"],
        isActive: true, isPopular: false, order: 1,
        maxBranches: 3, maxUsers: 15, maxDealers: 500, maxProducts: 1000,
        allowAnalytics: true, allowCustomBot: false, allowWebStore: true,
        trialDays: 14,
      },
      {
        id: "demo-tariff-3",
        planKey: "PRO",
        nameEn: "Professional", nameUz: "Professional", nameRu: "Профессиональный", nameTr: "Profesyonel",
        priceMonthly: "249000", priceYearly: "2490000",
        featuresEn: ["10 branches", "50 users", "Unlimited dealers", "Custom bot", "Bulk import"],
        featuresUz: ["10 filial", "50 foydalanuvchi", "Cheksiz diler", "Bot", "Ommaviy import"],
        featuresRu: ["10 филиалов", "50 пользователей", "Неограниченно", "Бот", "Массовый импорт"],
        featuresTr: ["10 şube", "50 kullanıcı", "Sınırsız bayi", "Bot", "Toplu içe aktarma"],
        isActive: true, isPopular: true, order: 2,
        maxBranches: 10, maxUsers: 50, maxDealers: 99999, maxProducts: 99999,
        allowAnalytics: true, allowCustomBot: true, allowWebStore: true,
        trialDays: 14,
      },
      {
        id: "demo-tariff-4",
        planKey: "PREMIUM",
        nameEn: "Enterprise", nameUz: "Enterprise", nameRu: "Корпоративный", nameTr: "Kurumsal",
        priceMonthly: "499000", priceYearly: "4990000",
        featuresEn: ["Unlimited branches", "Unlimited users", "Custom bot", "Multi-company", "Priority support"],
        featuresUz: ["Cheksiz filial", "Cheksiz foydalanuvchi", "Maxsus bot", "Ko'p kompaniya", "Ustuvor support"],
        featuresRu: ["Неограниченно филиалов", "Неограниченно пользователей", "Кастомный бот", "Мультикомпания", "Приоритетная поддержка"],
        featuresTr: ["Sınırsız şube", "Sınırsız kullanıcı", "Özel bot", "Çok şirket", "Öncelikli destek"],
        isActive: true, isPopular: false, order: 3,
        maxBranches: 99999, maxUsers: 99999, maxDealers: 99999, maxProducts: 99999,
        allowAnalytics: true, allowCustomBot: true, allowWebStore: true,
        trialDays: 30,
      },
    ];
    */
  }

  getDemoStores() {
    return [
      {
        id: "demo-store-1",
        name: "Apex Foods Distribution",
        slug: "apex-foods",
        logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format",
        description:
          "Premium food and beverage distributor serving Central Asia",
        websiteUrl: "https://demo.supplio.uz/store/apex-foods",
        dealers: 47,
        products: 182,
        revenue: "847,500,000",
        currency: "UZS",
      },
      {
        id: "demo-store-2",
        name: "TechParts Wholesale",
        slug: "techparts",
        logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format",
        description: "Electronics and spare parts wholesale distribution",
        websiteUrl: "https://demo.supplio.uz/store/techparts",
        dealers: 29,
        products: 340,
        revenue: "1,240,000,000",
        currency: "UZS",
      },
    ];
  }

  async getDemoData() {
    const [news, tariffs, stores] = await Promise.all([
      this.getDemoNews(),
      this.getDemoTariffs(),
      this.getDemoStores(),
    ]);

    return {
      news,
      tariffs,
      stores,
      stats: {
        totalCompanies: 134,
        totalOrders: 18492,
        totalRevenue: "47,820,000,000",
        activeUsers: 312,
        uptime: "99.97%",
        avgResponseMs: 82,
      },
      products: [
        {
          id: "p1",
          name: "Premium Box Set",
          price: 250000,
          stock: 150,
          unit: "box",
          sku: "PBS-001",
        },
        {
          id: "p2",
          name: "Standard Pack",
          price: 45000,
          stock: 2000,
          unit: "pcs",
          sku: "SP-002",
        },
        {
          id: "p3",
          name: "Industrial Set",
          price: 1200000,
          stock: 45,
          unit: "set",
          sku: "IS-003",
        },
        {
          id: "p4",
          name: "Mini Sample",
          price: 12000,
          stock: 5000,
          unit: "pcs",
          sku: "MS-004",
        },
        {
          id: "p5",
          name: "Bulk Container",
          price: 3500000,
          stock: 12,
          unit: "cnt",
          sku: "BC-005",
        },
      ],
      recentOrders: [
        {
          id: "o1",
          dealer: "Apex Retail",
          amount: 4500000,
          status: "DELIVERED",
          date: "2026-03-20",
        },
        {
          id: "o2",
          dealer: "Global Mart",
          amount: 1200000,
          status: "PENDING",
          date: "2026-03-21",
        },
        {
          id: "o3",
          dealer: "City Express",
          amount: 2800000,
          status: "PROCESSING",
          date: "2026-03-21",
        },
        {
          id: "o4",
          dealer: "Metro Store",
          amount: 650000,
          status: "DELIVERED",
          date: "2026-03-19",
        },
        {
          id: "o5",
          dealer: "FastTrade",
          amount: 3200000,
          status: "DELIVERED",
          date: "2026-03-18",
        },
      ],
    };
  }
}
