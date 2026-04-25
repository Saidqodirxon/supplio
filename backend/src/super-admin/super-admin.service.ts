import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import * as bcrypt from "bcrypt";
import * as ExcelJS from "exceljs";
import { PrismaService } from "../prisma/prisma.service";
import { AnalyticsService } from "../analytics/analytics.service";

@Injectable()
export class SuperAdminService {
  private readonly logger = new Logger(SuperAdminService.name);

  constructor(
    private prisma: PrismaService,
    private analyticsService: AnalyticsService
  ) {}

  async getGlobalSettings() {
    return this.prisma.systemSettings.upsert({
      where: { id: "GLOBAL" },
      update: {},
      create: {
        backupFrequency: "DAILY",
        superAdminPhone: "+998901112233",
        defaultTrialDays: 14,
        newsEnabled: true,
        termsUz:
          "1. Supplio xizmatidan foydalanganda siz ushbu shartlarga rozilik bildirasiz.\n2. Hisob qaydnomangiz xavfsizligini saqlash sizning javobgarligingizdir.\n3. Tizimdan noqonuniy foydalanish, spam yoki zararli harakatlar taqiqlanadi.\n4. To'lovlar tanlangan tarif va amaldagi shartlarga ko'ra hisoblanadi.\n5. Supplio xizmat sifatini yaxshilash uchun funksiyalarni yangilash yoki cheklash huquqini saqlab qoladi.",
        termsEn:
          "1. By using Supplio, you agree to these terms.\n2. You are responsible for keeping your account secure.\n3. Illegal use, spam, or harmful activity is prohibited.\n4. Payments are calculated based on the selected plan and current terms.\n5. Supplio may update or limit features to improve service quality.",
        privacyUz:
          "1. Biz faqat xizmatni taqdim etish uchun zarur ma'lumotlarni yig'amiz.\n2. Ma'lumotlaringiz hisob boshqaruvi, qo'llab-quvvatlash va tahlil uchun ishlatiladi.\n3. Biz ma'lumotlarni uchinchi tomonlarga faqat qonuniy talab yoki xizmat integratsiyasi bo'lsa uzatamiz.\n4. Foydalanuvchi ma'lumotlari xavfsizligini ta'minlash uchun texnik va tashkiliy choralar qo'llaniladi.\n5. Maxfiylik bo'yicha savollar uchun biz bilan bog'lanishingiz mumkin.",
        privacyEn:
          "1. We collect only the data needed to provide the service.\n2. Your data is used for account management, support, and analytics.\n3. We share data with third parties only when required by law or for service integrations.\n4. Technical and organizational measures are used to protect user data.\n5. Contact us if you have questions about privacy.",
      },
    });
  }

  async updateGlobalSettings(data?: Record<string, unknown>) {
    const input = (data ?? {}) as Record<string, unknown>;
    const { id, updatedAt, ...safeData } = input as any;
    const allowedKeys = new Set([
      "maintenanceMode",
      "backupFrequency",
      "lastBackupAt",
      "defaultTrialDays",
      "newsEnabled",
      "superAdminPhone",
      "systemVersion",
      "globalNotifyUz",
      "globalNotifyRu",
      "globalNotifyEn",
      "globalNotifyTr",
      "termsUz",
      "termsRu",
      "termsEn",
      "termsUzCyr",
      "privacyUz",
      "privacyRu",
      "privacyEn",
      "privacyUzCyr",
    ]);

    const filteredData = Object.fromEntries(
      Object.entries(safeData).filter(
        ([key, value]) => allowedKeys.has(key) && value !== undefined
      )
    );

    const normalizedData: Record<string, unknown> = { ...filteredData };

    if (typeof normalizedData.backupFrequency === "string") {
      const freq = normalizedData.backupFrequency.toUpperCase();
      if (["DAILY", "WEEKLY", "MONTHLY"].includes(freq)) {
        normalizedData.backupFrequency = freq;
      } else {
        delete normalizedData.backupFrequency;
      }
    }

    for (const key of ["maintenanceMode", "newsEnabled"]) {
      const value = normalizedData[key];
      if (value === "true") normalizedData[key] = true;
      if (value === "false") normalizedData[key] = false;
    }

    if (normalizedData.defaultTrialDays !== undefined) {
      const days = Number(normalizedData.defaultTrialDays);
      if (Number.isFinite(days) && days > 0) {
        normalizedData.defaultTrialDays = Math.floor(days);
      } else {
        delete normalizedData.defaultTrialDays;
      }
    }

    return this.prisma.systemSettings.upsert({
      where: { id: "GLOBAL" },
      update: normalizedData as any,
      create: {
        id: "GLOBAL",
        ...(normalizedData as any),
      },
    });
  }

  async directUpdate(model: string, id: string, field: string, value: unknown) {
    const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
    const prismaModel = (this.prisma as any)[modelKey];
    if (!prismaModel) throw new NotFoundException(`Model ${model} not found`);

    let processedValue = value;
    if (value === "true") processedValue = true;
    else if (value === "false") processedValue = false;
    else if (
      typeof value === "string" &&
      value.trim() !== "" &&
      !isNaN(Number(value))
    ) {
      processedValue = Number(value);
    }

    return prismaModel.update({
      where: { id },
      data: { [field]: processedValue },
    });
  }

  // â”€â”€ Company Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async getAllCompanies(
    query: {
      search?: string;
      plan?: string;
      status?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
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
          select: {
            id: true,
            phone: true,
            fullName: true,
            roleType: true,
            isActive: true,
          },
        },
        branches: {
          where: { deletedAt: null },
          select: { id: true, name: true },
        },
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

  async extendCompanySubscription(
    id: string,
    expiresAt: Date,
    plan?: string,
    status: string = "ACTIVE"
  ) {
    return this.prisma.$transaction(async (tx) => {
      const company = await tx.company.update({
        where: { id },
        data: {
          ...(plan ? { subscriptionPlan: plan as any } : {}),
          subscriptionStatus: status as any,
          trialExpiresAt: expiresAt,
        },
      });

      await tx.subscription.create({
        data: {
          companyId: id,
          plan: (plan ?? company.subscriptionPlan) as any,
          status: status as any,
          amount: 0,
          expiresAt,
        },
      });

      return company;
    });
  }

  async setCompanyStatus(id: string, status: string) {
    return this.prisma.company.update({
      where: { id },
      data: { subscriptionStatus: status as any },
    });
  }

  // â”€â”€ News â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  // â”€â”€ Broadcast â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async broadcast(payload: {
    title: string;
    message: string;
    targetPlan?: string;
  }) {
    const where: Record<string, unknown> = { deletedAt: null };
    if (payload.targetPlan) where.subscriptionPlan = payload.targetPlan;

    const companies = await this.prisma.company.findMany({
      where,
      include: {
        users: {
          where: {
            deletedAt: null,
            isActive: true,
            roleType: { notIn: ["SELLER", "SALES", "DELIVERY"] as any },
          },
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

  // â”€â”€ Audit Logs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async getAuditLogs(
    query: { page?: number; limit?: number; userId?: string } = {}
  ) {
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

  // â”€â”€ Leads â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async getLeads(
    query: {
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
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

  // â”€â”€ Tariffs (Plan Management) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async getAllTariffs() {
    return this.prisma.tariffPlan.findMany({ orderBy: { order: "asc" } });
  }

  async createTariff(data: Record<string, unknown>) {
    return this.prisma.tariffPlan.create({ data: data as any });
  }

  async updateTariff(id: string, data: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, createdAt, updatedAt, ...updateData } = data;
    return this.prisma.tariffPlan.update({
      where: { id },
      data: updateData as any,
    });
  }

  async deleteTariff(id: string) {
    return this.prisma.tariffPlan.delete({ where: { id } });
  }

  async exportOverviewToWorkbook() {
    const [summary, distributors, tariffs] = await Promise.all([
      this.getOverviewSummary(),
      this.prisma.company.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          subscriptionPlan: true,
          subscriptionStatus: true,
          trialExpiresAt: true,
          createdAt: true,
        },
        take: 100,
      }),
      this.getAllTariffs(),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Supplio";
    workbook.created = new Date();

    const summarySheet = workbook.addWorksheet("Overview");
    summarySheet.columns = [
      { header: "Metric", key: "metric", width: 28 },
      { header: "Value", key: "value", width: 18 },
    ];
    summarySheet.addRows([
      { metric: "Total Companies", value: summary.totalCompanies },
      { metric: "Total Leads", value: summary.totalLeads },
      { metric: "Open Tickets", value: summary.openTickets },
      { metric: "Pending Upgrades", value: summary.pendingUpgrades },
      { metric: "Active Subscriptions", value: summary.activeSubscriptions },
      { metric: "Collected Payments", value: summary.collectedPayments },
      { metric: "Subscription Revenue", value: summary.subscriptionRevenue },
    ]);

    const distributorsSheet = workbook.addWorksheet("Distributors");
    distributorsSheet.columns = [
      { header: "Name", key: "name", width: 30 },
      { header: "Slug", key: "slug", width: 20 },
      { header: "Plan", key: "plan", width: 14 },
      { header: "Status", key: "status", width: 14 },
      { header: "Expires At", key: "expiresAt", width: 22 },
      { header: "Created At", key: "createdAt", width: 22 },
    ];
    distributorsSheet.addRows(
      distributors.map((company) => ({
        name: company.name,
        slug: company.slug,
        plan: company.subscriptionPlan,
        status: company.subscriptionStatus,
        expiresAt: company.trialExpiresAt?.toISOString?.() ?? "",
        createdAt: company.createdAt.toISOString(),
      }))
    );

    const tariffsSheet = workbook.addWorksheet("Tariffs");
    tariffsSheet.columns = [
      { header: "Plan", key: "plan", width: 14 },
      { header: "Name", key: "name", width: 24 },
      { header: "Price Monthly", key: "priceMonthly", width: 16 },
      { header: "Price Yearly", key: "priceYearly", width: 16 },
      { header: "Trial Days", key: "trialDays", width: 14 },
      { header: "Max Branches", key: "maxBranches", width: 14 },
      { header: "Max Users", key: "maxUsers", width: 12 },
      { header: "Max Dealers", key: "maxDealers", width: 14 },
      { header: "Max Products", key: "maxProducts", width: 14 },
      { header: "Bots", key: "maxCustomBots", width: 10 },
    ];
    tariffsSheet.addRows(
      tariffs.map((tariff) => ({
        plan: tariff.planKey,
        name: tariff.nameUz || tariff.nameEn || tariff.planKey,
        priceMonthly: tariff.priceMonthly,
        priceYearly: tariff.priceYearly,
        trialDays: tariff.trialDays,
        maxBranches: tariff.maxBranches,
        maxUsers: tariff.maxUsers,
        maxDealers: tariff.maxDealers,
        maxProducts: tariff.maxProducts,
        maxCustomBots: tariff.maxCustomBots,
      }))
    );

    return workbook;
  }

  async exportDistributorAnalyticsToWorkbook(
    companyId: string,
    period: string = "30d"
  ) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, slug: true },
    });
    if (!company) throw new NotFoundException("Company not found");

    const [dashboard, topDealers, topProducts, debtReport] = await Promise.all([
      this.analyticsService.getDashboardStats(companyId, period as any),
      this.analyticsService.getTopDealers(companyId, 10),
      this.analyticsService.getTopProducts(companyId, 10),
      this.analyticsService.getDebtReport(companyId),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Supplio";
    workbook.created = new Date();

    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.columns = [
      { header: "Metric", key: "metric", width: 28 },
      { header: "Value", key: "value", width: 20 },
    ];
    summarySheet.addRows([
      { metric: "Company", value: company.name },
      { metric: "Slug", value: company.slug },
      { metric: "Period", value: dashboard.period },
      { metric: "Revenue", value: dashboard.stats.revenue },
      { metric: "Profit", value: dashboard.stats.profit },
      { metric: "Gross Profit", value: dashboard.stats.grossProfit },
      { metric: "Total Expenses", value: dashboard.stats.totalExpenses },
      { metric: "Active Dealers", value: dashboard.stats.activeDealers },
      { metric: "Debt", value: dashboard.stats.debt },
      { metric: "Collected", value: dashboard.stats.collected },
      { metric: "Products", value: dashboard.stats.products },
      { metric: "Period Revenue", value: dashboard.stats.periodRevenue },
      { metric: "Period Profit", value: dashboard.stats.periodProfit },
      { metric: "Period Orders", value: dashboard.stats.periodOrders },
      { metric: "Total Orders", value: dashboard.stats.totalOrders },
    ]);

    const chartSheet = workbook.addWorksheet("Chart");
    chartSheet.columns = [
      { header: "Date", key: "date", width: 18 },
      { header: "Revenue", key: "revenue", width: 16 },
      { header: "Profit", key: "profit", width: 16 },
      { header: "Orders", key: "orders", width: 12 },
    ];
    chartSheet.addRows(dashboard.chart);

    const dealersSheet = workbook.addWorksheet("Top Dealers");
    dealersSheet.columns = [
      { header: "Name", key: "name", width: 28 },
      { header: "Orders", key: "totalOrders", width: 12 },
      { header: "Amount", key: "totalAmount", width: 16 },
      { header: "Debt", key: "currentDebt", width: 16 },
      { header: "Credit Limit", key: "creditLimit", width: 16 },
    ];
    dealersSheet.addRows(topDealers);

    const productsSheet = workbook.addWorksheet("Top Products");
    productsSheet.columns = [
      { header: "Name", key: "name", width: 28 },
      { header: "Qty", key: "qty", width: 12 },
      { header: "Revenue", key: "revenue", width: 16 },
    ];
    productsSheet.addRows(topProducts);

    const debtsSheet = workbook.addWorksheet("Debts");
    debtsSheet.columns = [
      { header: "Name", key: "name", width: 28 },
      { header: "Phone", key: "phone", width: 18 },
      { header: "Current Debt", key: "currentDebt", width: 16 },
      { header: "Credit Limit", key: "creditLimit", width: 16 },
      { header: "Utilization %", key: "utilizationPercent", width: 14 },
    ];
    debtsSheet.addRows(debtReport.dealers);

    return workbook;
  }

  // â”€â”€ Landing CMS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async getLandingContent() {
    const landing = await (this.prisma as any).landingContent.upsert({
      where: { id: "LANDING" },
      update: {},
      create: {
        id: "LANDING",
        contactPhone: "+998 90 111 22 33",
        contactEmail: "support@supplio.uz",
        socialTelegram: "https://t.me/supplioapp",
        socialInstagram: "https://www.instagram.com/supplio__app/",
        socialLinkedin: "https://www.linkedin.com/company/supplioapp",
        footerDescUz:
          "Supplio — O'zbekistondagi yetakchi B2B savdo boshqaruv platformasi. Buyurtmalar, dilerlar va to'lovlarni bir joyda boshqaring.",
        footerDescRu:
          "Supplio — ведущая платформа управления B2B продажами в Узбекистане. Управляйте заказами, дилерами и платежами в одном месте.",
        footerDescEn:
          "Supplio — the leading B2B sales management platform in Uzbekistan. Manage orders, dealers and payments in one place.",
      },
    });

    try {
      await this.prisma.$executeRawUnsafe(
        'ALTER TABLE "LandingContent" ADD COLUMN IF NOT EXISTS "supportTelegramUsername" TEXT'
      );
      const rows = await this.prisma.$queryRawUnsafe<
        Array<{ supportTelegramUsername: string | null }>
      >(
        'SELECT "supportTelegramUsername" FROM "LandingContent" WHERE id = $1 LIMIT 1',
        "LANDING"
      );
      return {
        ...landing,
        supportTelegramUsername:
          rows[0]?.supportTelegramUsername ?? "@supplio_support",
      };
    } catch {
      return {
        ...landing,
        supportTelegramUsername: "@supplio_support",
      };
    }
  }

  async updateLandingContent(data: Record<string, unknown>) {
    const { supportTelegramUsername, ...safeData } = data as any;

    const landing = await (this.prisma as any).landingContent.upsert({
      where: { id: "LANDING" },
      update: safeData,
      create: { id: "LANDING", ...safeData },
    });

    try {
      await this.prisma.$executeRawUnsafe(
        'ALTER TABLE "LandingContent" ADD COLUMN IF NOT EXISTS "supportTelegramUsername" TEXT'
      );
      if (supportTelegramUsername !== undefined) {
        const value = String(supportTelegramUsername ?? "").trim() || null;
        await this.prisma.$executeRawUnsafe(
          'UPDATE "LandingContent" SET "supportTelegramUsername" = $1 WHERE id = $2',
          value,
          "LANDING"
        );
      }
      const rows = await this.prisma.$queryRawUnsafe<
        Array<{ supportTelegramUsername: string | null }>
      >(
        'SELECT "supportTelegramUsername" FROM "LandingContent" WHERE id = $1 LIMIT 1',
        "LANDING"
      );
      return {
        ...landing,
        supportTelegramUsername: rows[0]?.supportTelegramUsername ?? null,
      };
    } catch {
      return landing;
    }
  }

  // â”€â”€ Feature Flags â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async getAllFeatures() {
    return this.prisma.featureFlag.findMany({ orderBy: { featureKey: "asc" } });
  }

  async setFeature(data: {
    companyId?: string;
    featureKey: string;
    isEnabled: boolean;
  }) {
    const { companyId, featureKey, isEnabled } = data;
    return this.prisma.featureFlag.upsert({
      where: {
        featureKey_companyId: { featureKey, companyId: companyId ?? null },
      } as any,
      update: { isEnabled },
      create: { featureKey, isEnabled, companyId: companyId ?? null } as any,
    });
  }

  // â”€â”€ Server Metrics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async getServerMetrics() {
    return this.prisma.serverMetric.findMany({
      take: 20,
      orderBy: { timestamp: "desc" },
    });
  }

  async getOverviewSummary() {
    const [
      totalCompanies,
      totalLeads,
      openTickets,
      pendingUpgrades,
      collectedPayments,
      subscriptionRevenue,
      activeSubscriptions,
    ] = await Promise.all([
      this.prisma.company.count({ where: { deletedAt: null } }),
      this.prisma.lead.count({ where: { deletedAt: null } }),
      (this.prisma as any).supportTicket.count({
        where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      }),
      (this.prisma as any).upgradeRequest.count({
        where: { status: "PENDING" },
      }),
      this.prisma.payment.aggregate({ _sum: { amount: true } }),
      this.prisma.subscription.aggregate({ _sum: { amount: true } }),
      this.prisma.subscription.count({ where: { status: "ACTIVE" as any } }),
    ]);

    return {
      totalCompanies,
      totalLeads,
      openTickets,
      pendingUpgrades,
      activeSubscriptions,
      collectedPayments: collectedPayments._sum.amount ?? 0,
      subscriptionRevenue: subscriptionRevenue._sum.amount ?? 0,
    };
  }

  // â”€â”€ Release Notes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async getReleaseNotes() {
    return this.prisma.releaseNote.findMany({ orderBy: { createdAt: "desc" } });
  }

  async createReleaseNote(data: {
    version: string;
    title: string;
    content: string;
  }) {
    return this.prisma.releaseNote.create({ data });
  }

  async deleteReleaseNote(id: string) {
    return this.prisma.releaseNote.delete({ where: { id } });
  }

  // â”€â”€ Upgrade Requests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async createUpgradeRequest(companyId: string, data: Record<string, unknown>) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            dealers: true,
            users: true,
            branches: true,
            products: true,
          },
        },
        users: {
          where: { deletedAt: null, roleType: "OWNER" },
          select: { phone: true, fullName: true },
          take: 1,
        },
      },
    });
    if (!company) throw new NotFoundException("Company not found");

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
      include: {
        company: {
          select: {
            name: true,
            slug: true,
            subscriptionPlan: true,
            subscriptionStatus: true,
          },
        },
      },
    });
  }

  async updateUpgradeRequest(
    id: string,
    data: { status: string; note?: string }
  ) {
    return this.prisma.$transaction(async (tx) => {
      const request = await (tx as any).upgradeRequest.findUnique({
        where: { id },
      });
      if (!request) throw new NotFoundException("Upgrade request not found");

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
      if (!tariff) throw new NotFoundException(`Tariff plan not found: ${planKey}`);

      const company = await tx.company.findUnique({
        where: { id: request.companyId },
        select: { id: true, slug: true, dbConnectionUrl: true },
      });
      if (!company) throw new NotFoundException("Company not found");

      const expiresAt = new Date();
      expiresAt.setDate(
        expiresAt.getDate() + Math.max(tariff.trialDays || 30, 30)
      );

      const tenantDbUrl =
        !company.dbConnectionUrl && planKey !== "FREE"
          ? process.env.DATABASE_URL?.replace(
              "supplio",
              `supplio_tenant_${company.slug}`
            )
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

  // â”€â”€ Misc â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // ── Distributor Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async getDistributors(
    query: {
      search?: string;
      status?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
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
    const trialExpiresAt = new Date(
      Date.now() + trialDays * 24 * 60 * 60 * 1000
    );

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

  // â”€â”€ Notify Distributors (Super Admin â†’ OWNER users) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
          where: {
            deletedAt: null,
            isActive: true,
            roleType: { notIn: ["SELLER", "SALES", "DELIVERY"] as any },
          },
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
    const result = await this.prisma.notification.createMany({
      data: notifications,
    });
    return { count: result.count, companies: companies.length };
  }

  // â”€â”€ Billing Reminder Cron â€” runs daily at 10:00 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
            await this.prisma.notification
              .create({
                data: {
                  companyId: company.id,
                  receiverUserId: user.id,
                  title: `Obuna ${days} kun${days > 1 ? "" : "da"} tugaydi`,
                  message: `Sizning Supplio obunangiz ${days} kun${plural} ichida tugaydi. Xizmatdan foydalanishni davom ettirish uchun obunani yangilang.`,
                  type: "WARNING",
                },
              })
              .catch(() => {});
          }
        }
      }
      this.logger.log("Billing reminder cron completed.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error("Billing reminder cron failed: " + msg);
    }
  }

  // ── Testimonials ──────────────────────────────────────────────────────────

  async getTestimonials() {
    return (this.prisma as any).testimonial.findMany({
      orderBy: { order: "asc" },
    });
  }

  async createTestimonial(data: {
    name: string;
    company?: string;
    roleTitle?: string;
    contentUz: string;
    contentRu: string;
    contentEn: string;
    contentTr?: string;
    rating?: number;
    isActive?: boolean;
    order?: number;
  }) {
    return (this.prisma as any).testimonial.create({ data });
  }

  async updateTestimonial(
    id: string,
    data: Partial<{
      name: string;
      company: string;
      roleTitle: string;
      contentUz: string;
      contentRu: string;
      contentEn: string;
      contentTr: string;
      rating: number;
      isActive: boolean;
      order: number;
    }>
  ) {
    return (this.prisma as any).testimonial.update({ where: { id }, data });
  }

  async deleteTestimonial(id: string) {
    return (this.prisma as any).testimonial.delete({ where: { id } });
  }

  // ── Team Members ──────────────────────────────────────────────────────────

  async getTeamMembers() {
    return this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "TeamMember" ORDER BY "order" ASC, "createdAt" ASC`
    );
  }

  async createTeamMember(data: {
    name: string;
    roleUz?: string;
    roleRu?: string;
    roleEn?: string;
    roleTr?: string;
    bioUz?: string;
    bioRu?: string;
    bioEn?: string;
    bioTr?: string;
    avatar?: string;
    order?: number;
    isActive?: boolean;
  }) {
    const id = require("crypto").randomUUID();
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO "TeamMember" (id, name, "roleUz", "roleRu", "roleEn", "roleTr", "bioUz", "bioRu", "bioEn", "bioTr", avatar, "order", "isActive", "createdAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())`,
      id,
      data.name,
      data.roleUz ?? "",
      data.roleRu ?? "",
      data.roleEn ?? "",
      data.roleTr ?? "",
      data.bioUz ?? "",
      data.bioRu ?? "",
      data.bioEn ?? "",
      data.bioTr ?? "",
      data.avatar ?? null,
      data.order ?? 0,
      data.isActive ?? true
    );
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "TeamMember" WHERE id = $1`,
      id
    );
    return rows[0];
  }

  async updateTeamMember(
    id: string,
    data: Partial<{
      name: string;
      roleUz: string;
      roleRu: string;
      roleEn: string;
      roleTr: string;
      bioUz: string;
      bioRu: string;
      bioEn: string;
      bioTr: string;
      avatar: string;
      order: number;
      isActive: boolean;
    }>
  ) {
    const fields = Object.entries(data)
      .filter(([, v]) => v !== undefined)
      .map(([k], i) => `"${k}" = $${i + 2}`)
      .join(", ");
    const values = Object.values(data).filter((v) => v !== undefined);
    if (!fields)
      return this.prisma
        .$queryRawUnsafe<any[]>(`SELECT * FROM "TeamMember" WHERE id = $1`, id)
        .then((r) => r[0]);
    await this.prisma.$executeRawUnsafe(
      `UPDATE "TeamMember" SET ${fields} WHERE id = $1`,
      id,
      ...values
    );
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "TeamMember" WHERE id = $1`,
      id
    );
    return rows[0];
  }

  async deleteTeamMember(id: string) {
    await this.prisma.$executeRawUnsafe(
      `DELETE FROM "TeamMember" WHERE id = $1`,
      id
    );
    return { id };
  }
}
