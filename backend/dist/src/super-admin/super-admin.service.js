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
var SuperAdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const bcrypt = require("bcrypt");
const ExcelJS = require("exceljs");
const prisma_service_1 = require("../prisma/prisma.service");
const analytics_service_1 = require("../analytics/analytics.service");
let SuperAdminService = SuperAdminService_1 = class SuperAdminService {
    constructor(prisma, analyticsService) {
        this.prisma = prisma;
        this.analyticsService = analyticsService;
        this.logger = new common_1.Logger(SuperAdminService_1.name);
    }
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
    async updateGlobalSettings(data) {
        const { id, updatedAt, ...safeData } = data;
        return this.prisma.systemSettings.update({
            where: { id: "GLOBAL" },
            data: safeData,
        });
    }
    async directUpdate(model, id, field, value) {
        const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
        const prismaModel = this.prisma[modelKey];
        if (!prismaModel)
            throw new common_1.NotFoundException(`Model ${model} not found`);
        let processedValue = value;
        if (value === "true")
            processedValue = true;
        else if (value === "false")
            processedValue = false;
        else if (typeof value === "string" &&
            value.trim() !== "" &&
            !isNaN(Number(value))) {
            processedValue = Number(value);
        }
        return prismaModel.update({
            where: { id },
            data: { [field]: processedValue },
        });
    }
    async getAllCompanies(query = {}) {
        const { search, plan, status, page = 1, limit = 20 } = query;
        const where = { deletedAt: null };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { slug: { contains: search, mode: "insensitive" } },
            ];
        }
        if (plan)
            where.subscriptionPlan = plan;
        if (status)
            where.subscriptionStatus = status;
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
    async getCompanyById(id) {
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
        if (!company)
            throw new common_1.NotFoundException("Company not found");
        return company;
    }
    async updateCompany(id, data) {
        return this.prisma.company.update({ where: { id }, data: data });
    }
    async deleteCompany(id, deletedBy) {
        return this.prisma.company.update({
            where: { id },
            data: { deletedAt: new Date(), deletedBy },
        });
    }
    async setCompanyPlan(id, plan, status) {
        const trialDays = 30;
        return this.prisma.company.update({
            where: { id },
            data: {
                subscriptionPlan: plan,
                subscriptionStatus: status,
                trialExpiresAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
            },
        });
    }
    async extendCompanySubscription(id, expiresAt, plan, status = "ACTIVE") {
        return this.prisma.$transaction(async (tx) => {
            const company = await tx.company.update({
                where: { id },
                data: {
                    ...(plan ? { subscriptionPlan: plan } : {}),
                    subscriptionStatus: status,
                    trialExpiresAt: expiresAt,
                },
            });
            await tx.subscription.create({
                data: {
                    companyId: id,
                    plan: (plan ?? company.subscriptionPlan),
                    status: status,
                    amount: 0,
                    expiresAt,
                },
            });
            return company;
        });
    }
    async setCompanyStatus(id, status) {
        return this.prisma.company.update({
            where: { id },
            data: { subscriptionStatus: status },
        });
    }
    async getAllNews() {
        return this.prisma.news.findMany({ orderBy: { createdAt: "desc" } });
    }
    async createNews(authorId, data) {
        return this.prisma.news.create({ data: { ...data, authorId } });
    }
    async updateNews(id, data) {
        return this.prisma.news.update({ where: { id }, data: data });
    }
    async deleteNews(id) {
        return this.prisma.news.delete({ where: { id } });
    }
    async broadcast(payload) {
        const where = { deletedAt: null };
        if (payload.targetPlan)
            where.subscriptionPlan = payload.targetPlan;
        const companies = await this.prisma.company.findMany({
            where,
            include: {
                users: {
                    where: {
                        deletedAt: null,
                        isActive: true,
                        roleType: { notIn: ["SELLER", "SALES", "DELIVERY"] },
                    },
                    select: { id: true },
                },
            },
        });
        const notifications = [];
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
        if (!notifications.length)
            return { count: 0 };
        return this.prisma.notification.createMany({ data: notifications });
    }
    async getAuditLogs(query = {}) {
        const { page = 1, limit = 50, userId } = query;
        const where = {};
        if (userId)
            where.userId = userId;
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
    async getLeads(query = {}) {
        const { status, search, page = 1, limit = 20 } = query;
        const where = { deletedAt: null };
        if (status)
            where.status = status;
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
    async updateLead(id, data) {
        return this.prisma.lead.update({ where: { id }, data });
    }
    async deleteLead(id) {
        return this.prisma.lead.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async getAllTariffs() {
        return this.prisma.tariffPlan.findMany({ orderBy: { order: "asc" } });
    }
    async createTariff(data) {
        return this.prisma.tariffPlan.create({ data: data });
    }
    async updateTariff(id, data) {
        const { id: _id, createdAt, updatedAt, ...updateData } = data;
        return this.prisma.tariffPlan.update({
            where: { id },
            data: updateData,
        });
    }
    async deleteTariff(id) {
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
        distributorsSheet.addRows(distributors.map((company) => ({
            name: company.name,
            slug: company.slug,
            plan: company.subscriptionPlan,
            status: company.subscriptionStatus,
            expiresAt: company.trialExpiresAt?.toISOString?.() ?? "",
            createdAt: company.createdAt.toISOString(),
        })));
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
        tariffsSheet.addRows(tariffs.map((tariff) => ({
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
        })));
        return workbook;
    }
    async exportDistributorAnalyticsToWorkbook(companyId, period = "30d") {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { id: true, name: true, slug: true },
        });
        if (!company)
            throw new common_1.NotFoundException("Company not found");
        const [dashboard, topDealers, topProducts, debtReport] = await Promise.all([
            this.analyticsService.getDashboardStats(companyId, period),
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
    async getLandingContent() {
        return this.prisma.landingContent.upsert({
            where: { id: "LANDING" },
            update: {},
            create: { id: "LANDING" },
        });
    }
    async updateLandingContent(data) {
        return this.prisma.landingContent.upsert({
            where: { id: "LANDING" },
            update: data,
            create: { id: "LANDING", ...data },
        });
    }
    async getAllFeatures() {
        return this.prisma.featureFlag.findMany({ orderBy: { featureKey: "asc" } });
    }
    async setFeature(data) {
        const { companyId, featureKey, isEnabled } = data;
        return this.prisma.featureFlag.upsert({
            where: {
                featureKey_companyId: { featureKey, companyId: companyId ?? null },
            },
            update: { isEnabled },
            create: { featureKey, isEnabled, companyId: companyId ?? null },
        });
    }
    async getServerMetrics() {
        return this.prisma.serverMetric.findMany({
            take: 20,
            orderBy: { timestamp: "desc" },
        });
    }
    async getOverviewSummary() {
        const [totalCompanies, totalLeads, openTickets, pendingUpgrades, collectedPayments, subscriptionRevenue, activeSubscriptions,] = await Promise.all([
            this.prisma.company.count({ where: { deletedAt: null } }),
            this.prisma.lead.count({ where: { deletedAt: null } }),
            this.prisma.supportTicket.count({
                where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
            }),
            this.prisma.upgradeRequest.count({
                where: { status: "PENDING" },
            }),
            this.prisma.payment.aggregate({ _sum: { amount: true } }),
            this.prisma.subscription.aggregate({ _sum: { amount: true } }),
            this.prisma.subscription.count({ where: { status: "ACTIVE" } }),
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
    async getReleaseNotes() {
        return this.prisma.releaseNote.findMany({ orderBy: { createdAt: "desc" } });
    }
    async createReleaseNote(data) {
        return this.prisma.releaseNote.create({ data });
    }
    async deleteReleaseNote(id) {
        return this.prisma.releaseNote.delete({ where: { id } });
    }
    async createUpgradeRequest(companyId, data) {
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
        if (!company)
            throw new Error("Company not found");
        const existing = await this.prisma.upgradeRequest.findFirst({
            where: { companyId, status: "PENDING" },
        });
        if (existing)
            return existing;
        return this.prisma.upgradeRequest.create({
            data: {
                companyId,
                companyName: company.name,
                currentPlan: company.subscriptionPlan,
                requestedPlan: data.requestedPlan || null,
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
        return this.prisma.upgradeRequest.findMany({
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
    async updateUpgradeRequest(id, data) {
        return this.prisma.$transaction(async (tx) => {
            const request = await tx.upgradeRequest.findUnique({
                where: { id },
            });
            if (!request)
                throw new Error("Upgrade request not found");
            const updatedRequest = await tx.upgradeRequest.update({
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
            if (!tariff)
                throw new Error(`Tariff plan not found: ${planKey}`);
            const company = await tx.company.findUnique({
                where: { id: request.companyId },
                select: { id: true, slug: true, dbConnectionUrl: true },
            });
            if (!company)
                throw new Error("Company not found");
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + Math.max(tariff.trialDays || 30, 30));
            const tenantDbUrl = !company.dbConnectionUrl && planKey !== "FREE"
                ? process.env.DATABASE_URL?.replace("supplio", `supplio_tenant_${company.slug}`)
                : company.dbConnectionUrl;
            await tx.company.update({
                where: { id: request.companyId },
                data: {
                    subscriptionPlan: planKey,
                    subscriptionStatus: "ACTIVE",
                    trialExpiresAt: expiresAt,
                    ...(tenantDbUrl ? { dbConnectionUrl: tenantDbUrl } : {}),
                },
            });
            await tx.subscription.create({
                data: {
                    companyId: request.companyId,
                    plan: planKey,
                    status: "ACTIVE",
                    amount: Number(tariff.priceMonthly || 0),
                    expiresAt,
                },
            });
            return updatedRequest;
        });
    }
    async getDistributors(query = {}) {
        const { search, status, page = 1, limit = 20 } = query;
        const where = { deletedAt: null };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { slug: { contains: search, mode: "insensitive" } },
            ];
        }
        if (status)
            where.subscriptionStatus = status;
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
    async createDistributor(data) {
        const passwordHash = await bcrypt.hash(data.password, 10);
        const trialDays = data.trialDays ?? 14;
        const trialExpiresAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);
        return this.prisma.$transaction(async (tx) => {
            const company = await tx.company.create({
                data: {
                    name: data.companyName,
                    slug: data.slug,
                    subscriptionPlan: (data.subscriptionPlan ?? "FREE"),
                    subscriptionStatus: "TRIAL",
                    trialExpiresAt,
                },
            });
            const user = await tx.user.create({
                data: {
                    companyId: company.id,
                    phone: data.phone,
                    fullName: data.fullName ?? data.companyName,
                    passwordHash,
                    roleType: "OWNER",
                    isActive: true,
                },
            });
            return {
                company,
                user: { id: user.id, phone: user.phone, fullName: user.fullName },
            };
        });
    }
    async resetDistributorOwnerPassword(companyId, password) {
        if (!password || password.length < 6) {
            throw new common_1.NotFoundException("Password must be at least 6 characters");
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
            throw new common_1.NotFoundException("Distributor owner not found");
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
    async notifyDistributors(payload) {
        const where = { deletedAt: null };
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
                        roleType: { notIn: ["SELLER", "SALES", "DELIVERY"] },
                    },
                    select: { id: true },
                },
            },
        });
        const notifications = [];
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
        if (notifications.length === 0)
            return { count: 0 };
        const result = await this.prisma.notification.createMany({
            data: notifications,
        });
        return { count: result.count, companies: companies.length };
    }
    async runBillingReminders() {
        this.logger.log("Running billing reminder cron...");
        try {
            const now = new Date();
            for (const days of [7, 3, 1]) {
                const from = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
                from.setHours(0, 0, 0, 0);
                const to = new Date(from);
                to.setHours(23, 59, 59, 999);
                const companies = await this.prisma.company.findMany({
                    where: {
                        deletedAt: null,
                        trialExpiresAt: { gte: from, lte: to },
                        subscriptionStatus: { in: ["TRIAL", "ACTIVE"] },
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
                            .catch(() => { });
                    }
                }
            }
            this.logger.log("Billing reminder cron completed.");
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.error("Billing reminder cron failed: " + msg);
        }
    }
};
exports.SuperAdminService = SuperAdminService;
__decorate([
    (0, schedule_1.Cron)("0 10 * * *"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminService.prototype, "runBillingReminders", null);
exports.SuperAdminService = SuperAdminService = SuperAdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        analytics_service_1.AnalyticsService])
], SuperAdminService);
//# sourceMappingURL=super-admin.service.js.map