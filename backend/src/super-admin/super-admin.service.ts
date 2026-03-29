import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SuperAdminService {
  private readonly logger = new Logger(SuperAdminService.name);

  constructor(private prisma: PrismaService) {}

  async getGlobalSettings() {
    return this.prisma.systemSettings.upsert({
      where: { id: "GLOBAL" },
      update: {},
      create: {
        backupFrequency: "DAILY",
        superAdminPhone: "+998901112233",
        defaultTrialDays: 14,
        newsEnabled: true,
      },
    });
  }

  async updateGlobalSettings(data: Record<string, unknown>) {
    const { id, updatedAt, ...safeData } = data as any;
    return this.prisma.systemSettings.update({ where: { id: "GLOBAL" }, data: safeData as any });
  }

  async directUpdate(model: string, id: string, field: string, value: unknown) {
    const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
    const prismaModel = (this.prisma as any)[modelKey];
    if (!prismaModel) throw new NotFoundException(`Model ${model} not found`);

    let processedValue = value;
    if (value === "true") processedValue = true;
    else if (value === "false") processedValue = false;
    else if (typeof value === "string" && value.trim() !== "" && !isNaN(Number(value))) {
      processedValue = Number(value);
    }

    return prismaModel.update({ where: { id }, data: { [field]: processedValue } });
  }

  // ── Company Management ────────────────────────────────────────────────────

  async getAllCompanies(query: {
    search?: string;
    plan?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const { search, plan, status, page = 1, limit = 20 } = query;
    const where: Record<string, unknown> = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }
    if (plan) where.subscriptionPlan = plan;
    if (status) where.subscriptionStatus = status;

    const [items, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { users: true, branches: true, dealers: true } },
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getCompanyById(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          where: { deletedAt: null },
          select: { id: true, phone: true, fullName: true, roleType: true, isActive: true },
        },
        branches: { where: { deletedAt: null }, select: { id: true, name: true } },
        _count: {
          select: { dealers: true, orders: true, products: true },
        },
      },
    });
    if (!company) throw new NotFoundException("Company not found");
    return company;
  }

  async updateCompany(id: string, data: Record<string, unknown>) {
    return this.prisma.company.update({ where: { id }, data: data as any });
  }

  async deleteCompany(id: string, deletedBy: string) {
    return this.prisma.company.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }

  async setCompanyPlan(id: string, plan: string, status: string) {
    const trialDays = 30;
    return this.prisma.company.update({
      where: { id },
      data: {
        subscriptionPlan: plan as any,
        subscriptionStatus: status as any,
        trialExpiresAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
      },
    });
  }

  async setCompanyStatus(id: string, status: string) {
    return this.prisma.company.update({
      where: { id },
      data: { subscriptionStatus: status as any },
    });
  }

  // ── News ──────────────────────────────────────────────────────────────────

  async getAllNews() {
    return this.prisma.news.findMany({ orderBy: { createdAt: "desc" } });
  }

  async createNews(authorId: string, data: Record<string, unknown>) {
    return this.prisma.news.create({ data: { ...data, authorId } as any });
  }

  async updateNews(id: string, data: Record<string, unknown>) {
    return this.prisma.news.update({ where: { id }, data: data as any });
  }

  async deleteNews(id: string) {
    return this.prisma.news.delete({ where: { id } });
  }

  async seedNews() {
    const count = await this.prisma.news.count();
    if (count > 0) return { message: "Already seeded", count };

    const articles = [
      {
        slugEn: "supplio-v2-launch",
        slugUz: "supplio-v2-taqdimot",
        slugRu: "supplio-v2-zapusk",
        slugTr: "supplio-v2-tanitim",
        slugUzCyr: "суппlio-v2-такдимот",
        titleEn: "Introducing Supplio V2 — Rebuilt from the Ground Up",
        titleUz: "Supplio V2: Noldan Qayta Yaratildi",
        titleRu: "Представляем Supplio V2 — Полностью Перестроен",
        titleTr: "Supplio V2'yi Tanıtıyoruz — Sıfırdan Yeniden İnşa Edildi",
        titleUzCyr: "Supplio V2 Тақдимоти — Нолдан Қайта Яратилди",
        excerptEn: "The most powerful credit-control system ever built for B2B distributors in Central Asia is here.",
        excerptUz: "Markaziy Osiyodagi B2B distribyutorlar uchun eng kuchli kredit-nazorat tizimi tayyor.",
        excerptRu: "Самая мощная система кредитного контроля для B2B-дистрибьюторов Центральной Азии уже здесь.",
        excerptTr: "Orta Asya'daki B2B distribütörler için inşa edilmiş en güçlü kredi kontrol sistemi burada.",
        excerptUzCyr: "Марказий Осиёдаги B2B дистрибьюторлар учун энг кучли кредит-назорат тизими тайёр.",
        contentEn: "We've completely reimagined Supplio from the ground up. The new version features real-time ledger synchronization, instant credit verification on every order, and a redesigned dashboard that gives you full visibility into your distribution network.\n\nEvery Telegram bot interaction is now directly linked to your financial dashboard — when a dealer places an order, the credit limit is verified in milliseconds. This is the future of B2B distribution in Central Asia.",
        contentUz: "Biz Supplio-ni butunlay qaytadan yaratdik. Yangi versiyada real vaqt rejimidagi sinxronizatsiya, har bir buyurtmada tezkor kredit tekshiruvi va yangilangan boshqaruv paneli mavjud.\n\nHar bir Telegram bot o'zaro ta'siri endi to'g'ridan-to'g'ri moliyaviy boshqaruv panelingizga bog'langan — diler buyurtma berganda, kredit limiti millisekundlarda tekshiriladi.",
        contentRu: "Мы полностью перестроили Supplio. Новая версия включает синхронизацию данных в реальном времени, мгновенную проверку кредитных лимитов при каждом заказе и обновлённую панель управления.\n\nКаждое взаимодействие с Telegram-ботом теперь напрямую связано с вашей финансовой панелью — когда дилер размещает заказ, кредитный лимит проверяется за миллисекунды.",
        contentTr: "Supplio'yu tamamen yeniden hayal ettik. Yeni sürüm gerçek zamanlı defter senkronizasyonu, her siparişte anında kredi doğrulama ve yeniden tasarlanmış bir kontrol paneli içeriyor.\n\nHer Telegram bot etkileşimi artık doğrudan finansal kontrol panelinize bağlı — bir bayi sipariş verdiğinde kredi limiti milisaniyeler içinde doğrulanıyor.",
        contentUzCyr: "Биз Supplio-ни бутунлай қайтадан яратдик. Янги версияда реал вақт режимидаги синхронизация, ҳар бир буюртмада тезкор кредит текшируви ва янгиланган бошқарув панели мавжуд.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
        isPublished: true,
      },
      {
        slugEn: "telegram-first-distribution",
        slugUz: "telegram-orqali-distributsiya",
        slugRu: "telegram-pervym-delom",
        slugTr: "once-telegram-dagitim",
        slugUzCyr: "телеграм-орқали-дистрибуция",
        titleEn: "Why Distributors Are Moving to Telegram-First Workflows",
        titleUz: "Nima Uchun Distribyutorlar Telegramga O'tmoqda",
        titleRu: "Почему Дистрибьюторы Переходят на Telegram",
        titleTr: "Distribütörler Neden Telegram'a Geçiyor",
        titleUzCyr: "Нима Учун Дистрибьюторлар Телеграмга Ўтмоқда",
        excerptEn: "More distributors are replacing traditional apps with Telegram-based ordering systems. Here's why.",
        excerptUz: "Ko'proq distribyutorlar an'anaviy ilovalardan Telegram asosidagi buyurtma tizimlariga o'tmoqda.",
        excerptRu: "Всё больше дистрибьюторов заменяют традиционные приложения системами заказов через Telegram.",
        excerptTr: "Giderek daha fazla distribütör geleneksel uygulamaları Telegram tabanlı sipariş sistemleriyle değiştiriyor.",
        excerptUzCyr: "Кўпроқ дистрибьюторлар анъанавий иловалардан Телеграм асосидаги буюртма тизимларига ўтмоқда.",
        contentEn: "Telegram is no longer just a messenger — it's becoming a business operating system. With Supplio's multi-bot architecture, each dealer gets a lightweight interface that works even on slow connections.\n\nOur data shows that Telegram-based ordering reduces order processing time by 73% compared to traditional web forms. Dealers don't need to download an app or remember a URL — they just open their existing Telegram chat.",
        contentUz: "Telegram endi shunchaki messenger emas — bu biznes operatsion tizimiga aylanmoqda. Supplio-ning multi-bot arxitekturasi yordamida har bir diler sekin internetda ham ishlaydigan qulay interfeysga ega bo'ladi.\n\nMa'lumotlarimiz shuni ko'rsatadiki, Telegram orqali buyurtma berish an'anaviy veb-formalarga nisbatan buyurtma qayta ishlash vaqtini 73% ga kamaytiradi.",
        contentRu: "Telegram — это уже не просто мессенджер, а полноценная бизнес-операционная система. С архитектурой multi-bot от Supplio каждый дилер получает лёгкий интерфейс, работающий даже при медленном интернете.\n\nНаши данные показывают, что оформление заказов через Telegram сокращает время обработки на 73% по сравнению с традиционными веб-формами.",
        contentTr: "Telegram artık sadece bir mesajlaşma uygulaması değil — bir iş işletim sistemi haline geliyor. Supplio'nun çoklu-bot mimarisiyle her bayi, yavaş bağlantılarda bile çalışan hafif bir arayüze sahip oluyor.\n\nVerilerimiz, Telegram tabanlı siparişlerin geleneksel web formlarına kıyasla sipariş işleme süresini %73 oranında azalttığını gösteriyor.",
        contentUzCyr: "Телеграм энди шунчаки мессенжер эмас — бу бизнес операцион тизимига айланмоқда. Supplio-нинг мулти-бот архитектураси ёрдамида ҳар бир дилер секин интернетда ҳам ишлайдиган қулай интерфейсга эга бўлади.",
        image: "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=800&q=80",
        isPublished: true,
      },
      {
        slugEn: "credit-control-best-practices",
        slugUz: "kredit-nazorat-amaliyotlari",
        slugRu: "luchshie-praktiki-kreditnogo-kontrolya",
        slugTr: "kredi-kontrolu-en-iyi-uygulamalar",
        slugUzCyr: "кредит-назорат-амалиётлари",
        titleEn: "Credit Control Best Practices for B2B Distributors",
        titleUz: "B2B Distribyutorlar Uchun Kredit Nazoratining Eng Yaxshi Amaliyotlari",
        titleRu: "Лучшие Практики Кредитного Контроля для B2B Дистрибьюторов",
        titleTr: "B2B Distribütörler İçin Kredi Kontrolünün En İyi Uygulamaları",
        titleUzCyr: "B2B Дистрибьюторлар Учун Кредит Назоратининг Энг Яхши Амалиётлари",
        excerptEn: "How leading distributors in Central Asia are using real-time credit monitoring to reduce bad debt by up to 40%.",
        excerptUz: "Markaziy Osiyodagi yetakchi distribyutorlar real vaqt kredit monitoringidan qanday foydalanib, muammoli qarzlarni 40% gacha kamaytirmoqda.",
        excerptRu: "Как ведущие дистрибьюторы Центральной Азии используют мониторинг кредитов в реальном времени для сокращения безнадёжных долгов до 40%.",
        excerptTr: "Orta Asya'daki önde gelen distribütörler, gerçek zamanlı kredi izlemeyi kullanarak şüpheli alacakları %40'a kadar nasıl azaltıyor.",
        excerptUzCyr: "Марказий Осиёдаги етакчи дистрибьюторлар реал вақт кредит мониторингидан қандай фойдаланиб, муаммоли қарзларни 40% гача камайтирмоқда.",
        contentEn: "Setting proper credit limits is only half the battle. The real challenge is enforcing them in real-time across hundreds of dealers and thousands of daily orders.\n\nSupplio's credit engine checks the available balance before every order confirmation. If a dealer is over their limit, the order is blocked automatically — no manual review needed. This alone has helped our customers reduce overdue receivables by an average of 38%.",
        contentUz: "To'g'ri kredit limitlarini belgilash faqat yarim jang. Asosiy qiyinchilik — yuzlab dilerlar va kundalik minglab buyurtmalar bo'yicha ularni real vaqtda qo'llash.\n\nSupplio-ning kredit mexanizmi har bir buyurtmani tasdiqlashdan oldin mavjud qoldiqni tekshiradi. Agar diler o'z limitini oshirsa, buyurtma avtomatik ravishda bloklanadi.",
        contentRu: "Установка правильных кредитных лимитов — это лишь полдела. Настоящая задача — соблюдать их в реальном времени среди сотен дилеров и тысяч ежедневных заказов.\n\nКредитный движок Supplio проверяет доступный остаток перед каждым подтверждением заказа. Если дилер превышает лимит, заказ автоматически блокируется.",
        contentTr: "Uygun kredi limitleri belirlemek savaşın sadece yarısı. Asıl zorluk, bunları yüzlerce bayi ve günde binlerce sipariş genelinde gerçek zamanlı olarak uygulamak.\n\nSupplio'nun kredi motoru, her sipariş onayından önce mevcut bakiyeyi kontrol eder. Bir bayi limitini aşarsa sipariş otomatik olarak engellenir.",
        contentUzCyr: "Тўғри кредит лимитларини белгилаш фақат яримжанг. Асосий қийинчилик — юзлаб дилерлар ва кундалик минглаб буюртмалар бўйича уларни реал вақтда қўллаш.",
        image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
        isPublished: true,
      },
      {
        slugEn: "supplio-web-store-launch",
        slugUz: "supplio-veb-dokon-taqdimoti",
        slugRu: "zapusk-internet-magazina-supplio",
        slugTr: "supplio-web-magaza-tanitimi",
        slugUzCyr: "суппlio-веб-дўкон-тақдимоти",
        titleEn: "Introducing the Supplio Web Store — Your B2B Catalog Online",
        titleUz: "Supplio Veb-Do'koni — Sizning B2B Katalogingiz Onlaynda",
        titleRu: "Онлайн-магазин Supplio — Ваш B2B Каталог в Интернете",
        titleTr: "Supplio Web Mağazası — B2B Kataloğunuz Çevrimiçi",
        titleUzCyr: "Supplio Веб-Дўкони — Сизнинг B2B Каталогингиз Онлайнда",
        excerptEn: "Every company on Supplio now gets a fully branded public web store where dealers can browse and order directly from their browser.",
        excerptUz: "Supplio-dagi har bir kompaniya endi to'liq brendlangan ommaviy veb-do'konga ega — dilerlar brauzerdan to'g'ridan-to'g'ri ko'rib chiqishi va buyurtma berishi mumkin.",
        excerptRu: "Каждая компания на Supplio теперь получает полностью брендированный публичный интернет-магазин, где дилеры могут просматривать товары и делать заказы прямо из браузера.",
        excerptTr: "Supplio'daki her şirket artık tam markalı bir genel web mağazasına kavuştu — bayiler doğrudan tarayıcılarından göz atabilir ve sipariş verebilir.",
        excerptUzCyr: "Supplio-даги ҳар бир компания энди тўлиқ брендланган оммавий веб-дўконга эга — дилерлар браузердан тўғридан-тўғри кўриб чиқиши ва буюртма бериши мумкин.",
        contentEn: "The Supplio Web Store gives every distributor a public-facing catalog page at supplio.uz/store/your-company-slug. Dealers identify themselves by phone number, browse your full product catalog with real-time stock levels, and place orders directly — all credit limit checks happen automatically.\n\nThe web store is fully integrated with your existing dashboard. Every order placed through the store appears instantly in your orders list, stock is deducted, and dealer debt is updated in real-time.",
        contentUz: "Supplio Veb-Do'koni har bir distribyutorga supplio.uz/store/kompaniya-slugi manzilida ommaviy katalog sahifasi beradi. Dilerlar telefon raqami bilan o'zlarini identifikatsiya qiladilar, real vaqtdagi zaxira ko'rsatkichlari bilan to'liq mahsulot katalogingizni ko'rib chiqadilar va bevosita buyurtma beradilar.",
        contentRu: "Интернет-магазин Supplio даёт каждому дистрибьютору публичную страницу каталога по адресу supplio.uz/store/slug-компании. Дилеры идентифицируют себя по номеру телефона, просматривают полный каталог с актуальными остатками и размещают заказы напрямую — все проверки кредитных лимитов происходят автоматически.",
        contentTr: "Supplio Web Mağazası, her distribütöre supplio.uz/store/şirket-slug adresinde genel bir katalog sayfası sağlar. Bayiler telefon numarasıyla kendilerini tanımlar, gerçek zamanlı stok seviyeleriyle tam ürün kataloğunuza göz atar ve doğrudan sipariş verir.",
        contentUzCyr: "Supplio Веб-Дўкони ҳар бир дистрибьюторга supplio.uz/store/компания-слуги манзилида оммавий каталог саҳифаси беради.",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
        isPublished: true,
      },
      {
        slugEn: "supplio-analytics-dashboard",
        slugUz: "supplio-tahlil-paneli",
        slugRu: "supplio-panel-analitiki",
        slugTr: "supplio-analitik-pano",
        slugUzCyr: "суппlio-таҳлил-панели",
        titleEn: "New Analytics Dashboard: Track Every Dealer in Real Time",
        titleUz: "Yangi Tahlil Paneli: Har Bir Dilerni Real Vaqtda Kuzating",
        titleRu: "Новая Аналитическая Панель: Отслеживайте Каждого Дилера в Реальном Времени",
        titleTr: "Yeni Analitik Pano: Her Bayiyi Gerçek Zamanlı Takip Edin",
        titleUzCyr: "Янги Таҳлил Панели: Ҳар Бир Дилерни Реал Вақтда Кузатинг",
        excerptEn: "The new analytics module gives distributors a bird's-eye view of dealer activity, top-selling products, and credit utilization across the entire network.",
        excerptUz: "Yangi tahlil moduli distribyutorlarga diler faoliyati, eng ko'p sotiladigan mahsulotlar va butun tarmoq bo'yicha kredit foydalanishini yuqoridan ko'rish imkonini beradi.",
        excerptRu: "Новый аналитический модуль даёт дистрибьюторам обзор активности дилеров, самых продаваемых товаров и использования кредитных лимитов по всей сети.",
        excerptTr: "Yeni analitik modülü, distribütörlere tüm ağdaki bayi aktivitesi, en çok satan ürünler ve kredi kullanımına kuş bakışı görünüm sağlar.",
        excerptUzCyr: "Янги таҳлил модули дистрибьюторларга дилер фаолияти, энг кўп сотиладиган маҳсулотлар ва бутун тармоқ бўйича кредит фойдаланишини юқоридан кўриш имконини беради.",
        contentEn: "The Supplio Analytics Dashboard is now available for all plans. You can see your top 10 dealers by revenue, track which products are moving fastest, and identify dealers who are approaching their credit limits before issues arise.\n\nWeekly and monthly reports are generated automatically and can be exported to Excel with one click. We built this feature based on feedback from over 50 distributors who told us they were spending hours manually compiling spreadsheets.",
        contentUz: "Supplio Tahlil Paneli endi barcha rejalar uchun mavjud. Siz daromad bo'yicha top 10 dileringizni ko'rishingiz, qaysi mahsulotlar eng tez sotilayotganini kuzatishingiz va muammo yuzaga kelgunga qadar kredit limitlariga yaqinlashayotgan dilerlarni aniqlashingiz mumkin.\n\nHaftalik va oylik hisobotlar avtomatik ravishda yaratiladi va bir bosish bilan Excel formatida eksport qilinishi mumkin.",
        contentRu: "Аналитическая панель Supplio теперь доступна для всех тарифов. Вы можете видеть топ-10 дилеров по выручке, отслеживать, какие товары продаются быстрее всего, и выявлять дилеров, приближающихся к своим кредитным лимитам, до возникновения проблем.\n\nЕженедельные и ежемесячные отчёты формируются автоматически и могут быть экспортированы в Excel одним кликом.",
        contentTr: "Supplio Analitik Panosu artık tüm planlar için kullanılabilir. Gelire göre en iyi 10 bayinizi görebilir, hangi ürünlerin en hızlı satıldığını takip edebilir ve sorunlar ortaya çıkmadan önce kredi limitine yaklaşan bayileri belirleyebilirsiniz.\n\nHaftalık ve aylık raporlar otomatik olarak oluşturulur ve tek tıklamayla Excel'e aktarılabilir.",
        contentUzCyr: "Supplio Таҳлил Панели энди барча режалар учун мавжуд. Сиз даромад бўйича топ 10 дилерингизни кўришингиз, қайси маҳсулотлар энг тез сотилаётганини кузатишингиз ва муаммо юзага келгунга қадар кредит лимитларига яқинлашаётган дилерларни аниқлашингиз мумкин.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
        isPublished: true,
      },
    ];

    await this.prisma.news.createMany({ data: articles });
    return { message: "Seeded successfully", count: articles.length };
  }

  // ── Broadcast ─────────────────────────────────────────────────────────────

  async broadcast(payload: { title: string; message: string; targetPlan?: string }) {
    const where: Record<string, unknown> = { deletedAt: null };
    if (payload.targetPlan) where.subscriptionPlan = payload.targetPlan;

    const companies = await this.prisma.company.findMany({
      where,
      include: {
        users: {
          where: { deletedAt: null, isActive: true, roleType: { notIn: ["SELLER", "SALES", "DELIVERY"] as any } },
          select: { id: true },
        },
      },
    });

    const notifications: any[] = [];
    for (const company of companies) {
      for (const user of company.users) {
        notifications.push({
          companyId: company.id,
          receiverUserId: user.id,
          title: payload.title,
          message: payload.message,
          type: "INFO",
        });
      }
    }

    if (!notifications.length) return { count: 0 };
    return this.prisma.notification.createMany({ data: notifications });
  }

  // ── Audit Logs ────────────────────────────────────────────────────────────

  async getAuditLogs(query: { page?: number; limit?: number; userId?: string } = {}) {
    const { page = 1, limit = 50, userId } = query;
    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { phone: true, fullName: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  // ── Leads ─────────────────────────────────────────────────────────────────

  async getLeads(query: { status?: string; search?: string; page?: number; limit?: number } = {}) {
    const { status, search, page = 1, limit = 20 } = query;
    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.lead.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async updateLead(id: string, data: { status?: string; info?: string }) {
    return this.prisma.lead.update({ where: { id }, data });
  }

  async deleteLead(id: string) {
    return this.prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ── Tariffs (Plan Management) ─────────────────────────────────────────────

  async getAllTariffs() {
    return this.prisma.tariffPlan.findMany({ orderBy: { order: "asc" } });
  }

  async createTariff(data: Record<string, unknown>) {
    return this.prisma.tariffPlan.create({ data: data as any });
  }

  async updateTariff(id: string, data: Record<string, unknown>) {
    return this.prisma.tariffPlan.update({ where: { id }, data: data as any });
  }

  async deleteTariff(id: string) {
    return this.prisma.tariffPlan.delete({ where: { id } });
  }

  // ── Landing CMS ───────────────────────────────────────────────────────────

  async getLandingContent() {
    return (this.prisma as any).landingContent.upsert({
      where: { id: "LANDING" },
      update: {},
      create: { id: "LANDING" },
    });
  }

  async updateLandingContent(data: Record<string, unknown>) {
    return (this.prisma as any).landingContent.upsert({
      where: { id: "LANDING" },
      update: data,
      create: { id: "LANDING", ...data },
    });
  }

  async seedDefaultTariffs() {
    const seededPlans = [
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
        maxBranches: 1,
        maxCustomBots: 0,
        maxUsers: 3,
        maxDealers: 50,
        maxProducts: 200,
        allowCustomBot: false,
        allowWebStore: true,
        allowAnalytics: false,
        allowNotifications: true,
        allowMultiCompany: false,
        allowBulkImport: false,
        trialDays: 14,
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
        maxBranches: 1,
        maxCustomBots: 0,
        maxUsers: 5,
        maxDealers: 150,
        maxProducts: 500,
        allowCustomBot: false,
        allowWebStore: true,
        allowAnalytics: true,
        allowNotifications: true,
        allowMultiCompany: false,
        allowBulkImport: false,
        trialDays: 14,
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
        isPopular: true,
        maxBranches: 3,
        maxCustomBots: 1,
        maxUsers: 15,
        maxDealers: 1000,
        maxProducts: 3000,
        allowCustomBot: true,
        allowWebStore: true,
        allowAnalytics: true,
        allowNotifications: true,
        allowMultiCompany: false,
        allowBulkImport: true,
        trialDays: 14,
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
        maxBranches: 10,
        maxCustomBots: 3,
        maxUsers: 50,
        maxDealers: 5000,
        maxProducts: 15000,
        allowCustomBot: true,
        allowWebStore: true,
        allowAnalytics: true,
        allowNotifications: true,
        allowMultiCompany: false,
        allowBulkImport: true,
        trialDays: 30,
      },
    ];

    await this.prisma.tariffPlan.deleteMany({});
    await this.prisma.tariffPlan.createMany({
      data: seededPlans as any,
    });

    return { seeded: seededPlans.length };

    /*
    const plans = [
      {
        planKey: "FREE",
        order: 0,
        nameUz: "Bepul",
        nameRu: "Бесплатно",
        nameEn: "Free",
        nameTr: "Ücretsiz",
        nameUzCyr: "Бепул",
        price: "0",
        priceMonthly: "0",
        priceYearly: "0",
        featuresUz: ["1 filial", "5 foydalanuvchi", "50 dealer", "200 mahsulot"],
        featuresRu: ["1 филиал", "5 пользователей", "50 дилеров", "200 товаров"],
        featuresEn: ["1 branch", "5 users", "50 dealers", "200 products"],
        featuresTr: ["1 şube", "5 kullanıcı", "50 bayi", "200 ürün"],
        featuresUzCyr: ["1 филиал", "5 фойдаланувчи", "50 дилер", "200 маҳсулот"],
        maxBranches: 1,
        maxCustomBots: 0,
        maxUsers: 5,
        maxDealers: 50,
        maxProducts: 200,
        allowCustomBot: false,
        allowWebStore: true,
        allowAnalytics: false,
        allowNotifications: true,
        allowMultiCompany: false,
        allowBulkImport: false,
        trialDays: 14,
      },
      {
        planKey: "START",
        order: 1,
        nameUz: "Boshlang'ich",
        nameRu: "Стартовый",
        nameEn: "Start",
        nameTr: "Başlangıç",
        nameUzCyr: "Бошланғич",
        price: "99 000",
        priceMonthly: "99000",
        priceYearly: "990000",
        featuresUz: ["3 filial", "15 foydalanuvchi", "500 dealer", "1000 mahsulot", "Analitika"],
        featuresRu: ["3 филиала", "15 пользователей", "500 дилеров", "1000 товаров", "Аналитика"],
        featuresEn: ["3 branches", "15 users", "500 dealers", "1000 products", "Analytics"],
        featuresTr: ["3 şube", "15 kullanıcı", "500 bayi", "1000 ürün", "Analitik"],
        featuresUzCyr: ["3 филиал", "15 фойдаланувчи", "500 дилер", "1000 маҳсулот", "Аналитика"],
        maxBranches: 3,
        maxCustomBots: 0,
        maxUsers: 15,
        maxDealers: 500,
        maxProducts: 1000,
        allowCustomBot: false,
        allowWebStore: true,
        allowAnalytics: true,
        allowNotifications: true,
        allowMultiCompany: false,
        allowBulkImport: false,
        trialDays: 14,
      },
      {
        planKey: "PRO",
        order: 2,
        nameUz: "Professional",
        nameRu: "Профессиональный",
        nameEn: "Professional",
        nameTr: "Profesyonel",
        nameUzCyr: "Профессионал",
        price: "249 000",
        priceMonthly: "249000",
        priceYearly: "2490000",
        featuresUz: ["10 filial", "50 foydalanuvchi", "Cheksiz dealer", "Cheksiz mahsulot", "Bot", "Ommaviy import"],
        featuresRu: ["10 филиалов", "50 пользователей", "Неограниченно дилеров", "Неограниченно товаров", "Бот", "Массовый импорт"],
        featuresEn: ["10 branches", "50 users", "Unlimited dealers", "Unlimited products", "Bot", "Bulk import"],
        featuresTr: ["10 şube", "50 kullanıcı", "Sınırsız bayi", "Sınırsız ürün", "Bot", "Toplu içe aktarma"],
        featuresUzCyr: ["10 филиал", "50 фойдаланувчи", "Чексиз дилер", "Чексиз маҳсулот", "Бот", "Оммавий импорт"],
        isPopular: true,
        maxBranches: 10,
        maxCustomBots: 1,
        maxUsers: 50,
        maxDealers: 99999,
        maxProducts: 99999,
        allowCustomBot: true,
        allowWebStore: true,
        allowAnalytics: true,
        allowNotifications: true,
        allowMultiCompany: false,
        allowBulkImport: true,
        trialDays: 14,
      },
      {
        planKey: "PREMIUM",
        order: 3,
        nameUz: "Enterprise",
        nameRu: "Корпоративный",
        nameEn: "Enterprise",
        nameTr: "Kurumsal",
        nameUzCyr: "Корпоратив",
        price: "499 000",
        priceMonthly: "499000",
        priceYearly: "4990000",
        featuresUz: ["Cheksiz filial", "Cheksiz foydalanuvchi", "Maxsus bot", "Ko'p kompaniya", "Ustuvor support"],
        featuresRu: ["Неограниченно филиалов", "Неограниченно пользователей", "Кастомный бот", "Мультикомпания", "Приоритетная поддержка"],
        featuresEn: ["Unlimited branches", "Unlimited users", "Custom bot", "Multi-company", "Priority support"],
        featuresTr: ["Sınırsız şube", "Sınırsız kullanıcı", "Özel bot", "Çoklu şirket", "Öncelikli destek"],
        featuresUzCyr: ["Чексиз филиал", "Чексиз фойдаланувчи", "Махсус бот", "Кўп компания", "Устувор support"],
        maxBranches: 99999,
        maxCustomBots: 5,
        maxUsers: 99999,
        maxDealers: 99999,
        maxProducts: 99999,
        allowCustomBot: true,
        allowWebStore: true,
        allowAnalytics: true,
        allowNotifications: true,
        allowMultiCompany: true,
        allowBulkImport: true,
        trialDays: 30,
      },
    ];

    for (const plan of plans) {
      await this.prisma.tariffPlan.upsert({
        where: { planKey: plan.planKey },
        update: plan as any,
        create: plan as any,
      });
    }

    return { seeded: plans.length };
    */
  }

  // ── Feature Flags ─────────────────────────────────────────────────────────

  async getAllFeatures() {
    return this.prisma.featureFlag.findMany({ orderBy: { featureKey: "asc" } });
  }

  async setFeature(data: { companyId?: string; featureKey: string; isEnabled: boolean }) {
    const { companyId, featureKey, isEnabled } = data;
    return this.prisma.featureFlag.upsert({
      where: { featureKey_companyId: { featureKey, companyId: companyId ?? null } } as any,
      update: { isEnabled },
      create: { featureKey, isEnabled, companyId: companyId ?? null } as any,
    });
  }

  // ── Server Metrics ────────────────────────────────────────────────────────

  async getServerMetrics() {
    return this.prisma.serverMetric.findMany({
      take: 20,
      orderBy: { timestamp: "desc" },
    });
  }

  // ── Release Notes ─────────────────────────────────────────────────────────

  async getReleaseNotes() {
    return this.prisma.releaseNote.findMany({ orderBy: { createdAt: "desc" } });
  }

  async createReleaseNote(data: { version: string; title: string; content: string }) {
    return this.prisma.releaseNote.create({ data });
  }

  async deleteReleaseNote(id: string) {
    return this.prisma.releaseNote.delete({ where: { id } });
  }

  // ── Upgrade Requests ──────────────────────────────────────────────────────

  async createUpgradeRequest(companyId: string, data: Record<string, unknown>) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: { select: { dealers: true, users: true, branches: true, products: true } },
        users: { where: { deletedAt: null, roleType: "OWNER" }, select: { phone: true, fullName: true }, take: 1 },
      },
    });
    if (!company) throw new Error("Company not found");

    // Avoid duplicate pending requests
    const existing = await (this.prisma as any).upgradeRequest.findFirst({
      where: { companyId, status: "PENDING" },
    });
    if (existing) return existing;

    return (this.prisma as any).upgradeRequest.create({
      data: {
        companyId,
        companyName: company.name,
        currentPlan: company.subscriptionPlan,
        requestedPlan: (data.requestedPlan as string) || null,
        ownerPhone: company.users[0]?.phone || "",
        ownerName: company.users[0]?.fullName || null,
        dealersCount: company._count.dealers,
        usersCount: company._count.users,
        branchesCount: company._count.branches,
        productsCount: company._count.products,
        status: "PENDING",
      },
    });
  }

  async getUpgradeRequests() {
    return (this.prisma as any).upgradeRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: { company: { select: { name: true, slug: true, subscriptionPlan: true, subscriptionStatus: true } } },
    });
  }

  async updateUpgradeRequest(id: string, data: { status: string; note?: string }) {
    return this.prisma.$transaction(async (tx) => {
      const request = await (tx as any).upgradeRequest.findUnique({
        where: { id },
      });
      if (!request) throw new Error("Upgrade request not found");

      const updatedRequest = await (tx as any).upgradeRequest.update({
        where: { id },
        data: { status: data.status, note: data.note },
      });

      if (data.status !== "APPROVED" || !request.requestedPlan) {
        return updatedRequest;
      }

      const planKey = String(request.requestedPlan).toUpperCase();
      const tariff = await tx.tariffPlan.findUnique({
        where: { planKey },
      });
      if (!tariff) throw new Error(`Tariff plan not found: ${planKey}`);

      const company = await tx.company.findUnique({
        where: { id: request.companyId },
        select: { id: true, slug: true, dbConnectionUrl: true },
      });
      if (!company) throw new Error("Company not found");

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + Math.max(tariff.trialDays || 30, 30));

      const tenantDbUrl =
        !company.dbConnectionUrl && planKey !== "FREE"
          ? process.env.DATABASE_URL?.replace("supplio", `supplio_tenant_${company.slug}`)
          : company.dbConnectionUrl;

      await tx.company.update({
        where: { id: request.companyId },
        data: {
          subscriptionPlan: planKey as any,
          subscriptionStatus: "ACTIVE" as any,
          trialExpiresAt: expiresAt,
          ...(tenantDbUrl ? { dbConnectionUrl: tenantDbUrl } : {}),
        },
      });

      await tx.subscription.create({
        data: {
          companyId: request.companyId,
          plan: planKey as any,
          status: "ACTIVE" as any,
          amount: Number(tariff.priceMonthly || 0),
          expiresAt,
        },
      });

      return updatedRequest;
    });
  }

  // ── Misc ──────────────────────────────────────────────────────────────────

  async fixUsers() {
    return this.prisma.user.updateMany({
      where: { OR: [{ photoUrl: null }, { photoUrl: "" }] },
      data: { photoUrl: "/favicon.png" },
    });
  }

  // ── Distributor Management ────────────────────────────────────────────────

  async getDistributors(query: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const { search, status, page = 1, limit = 20 } = query;
    const where: Record<string, unknown> = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) where.subscriptionStatus = status;

    const [items, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          users: {
            where: { roleType: "OWNER", deletedAt: null },
            select: { id: true, phone: true, fullName: true, isActive: true },
            take: 1,
          },
          _count: { select: { dealers: true, orders: true, users: true } },
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async createDistributor(data: {
    companyName: string;
    slug: string;
    phone: string;
    fullName?: string;
    password: string;
    subscriptionPlan?: string;
    trialDays?: number;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const trialDays = data.trialDays ?? 14;
    const trialExpiresAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: data.companyName,
          slug: data.slug,
          subscriptionPlan: (data.subscriptionPlan ?? "FREE") as any,
          subscriptionStatus: "TRIAL" as any,
          trialExpiresAt,
        },
      });

      const user = await tx.user.create({
        data: {
          companyId: company.id,
          phone: data.phone,
          fullName: data.fullName ?? data.companyName,
          passwordHash,
          roleType: "OWNER" as any,
          isActive: true,
        },
      });

      return {
        company,
        user: { id: user.id, phone: user.phone, fullName: user.fullName },
      };
    });
  }

  // ── Notify Distributors (Super Admin → OWNER users) ───────────────────────

  async resetDistributorOwnerPassword(companyId: string, password: string) {
    if (!password || password.length < 6) {
      throw new NotFoundException("Password must be at least 6 characters");
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        users: {
          where: { roleType: "OWNER", deletedAt: null },
          select: { id: true, phone: true, fullName: true },
          take: 1,
        },
      },
    });

    const owner = company?.users[0];
    if (!company || !owner) {
      throw new NotFoundException("Distributor owner not found");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.user.update({
      where: { id: owner.id },
      data: { passwordHash },
    });

    return {
      success: true,
      companyName: company.name,
      owner: {
        id: owner.id,
        phone: owner.phone,
        fullName: owner.fullName,
      },
    };
  }

  async notifyDistributors(payload: {
    title: string;
    message: string;
    type?: string;
    companyIds?: string[];
  }) {
    const where: Record<string, unknown> = { deletedAt: null };
    if (payload.companyIds?.length) {
      where.id = { in: payload.companyIds };
    }

    const companies = await this.prisma.company.findMany({
      where,
      include: {
        users: {
          where: { deletedAt: null, isActive: true, roleType: { notIn: ["SELLER", "SALES", "DELIVERY"] as any } },
          select: { id: true },
        },
      },
    });

    const notifications: any[] = [];
    for (const company of companies) {
      for (const user of company.users) {
        notifications.push({
          companyId: company.id,
          receiverUserId: user.id,
          title: payload.title,
          message: payload.message,
          type: payload.type ?? "INFO",
        });
      }
    }

    if (notifications.length === 0) return { count: 0 };
    const result = await this.prisma.notification.createMany({ data: notifications });
    return { count: result.count, companies: companies.length };
  }

  // ── Billing Reminder Cron — runs daily at 10:00 ───────────────────────────

  @Cron("0 10 * * *")
  async runBillingReminders() {
    this.logger.log("Running billing reminder cron...");
    try {
      const now = new Date();
      // Warn at 7, 3, and 1 day(s) before trial/subscription expires
      for (const days of [7, 3, 1]) {
        const from = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        from.setHours(0, 0, 0, 0);
        const to = new Date(from);
        to.setHours(23, 59, 59, 999);

        const companies = await this.prisma.company.findMany({
          where: {
            deletedAt: null,
            trialExpiresAt: { gte: from, lte: to },
            subscriptionStatus: { in: ["TRIAL", "ACTIVE"] as any },
          },
          include: {
            users: {
              where: { roleType: "OWNER", deletedAt: null, isActive: true },
              select: { id: true },
            },
          },
        });

        const plural = days > 1 ? "s" : "";
        for (const company of companies) {
          for (const user of company.users) {
            await this.prisma.notification.create({
              data: {
                companyId: company.id,
                receiverUserId: user.id,
                title: `Obuna ${days} kun${days > 1 ? "" : "da"} tugaydi`,
                message: `Sizning Supplio obunangiz ${days} kun${plural} ichida tugaydi. Xizmatdan foydalanishni davom ettirish uchun obunani yangilang.`,
                type: "WARNING",
              },
            }).catch(() => {});
          }
        }
      }
      this.logger.log("Billing reminder cron completed.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error("Billing reminder cron failed: " + msg);
    }
  }
}
