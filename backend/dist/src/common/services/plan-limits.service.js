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
var PlanLimitsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanLimitsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const DEFAULT_LIMITS = {
    maxBranches: 1,
    maxUsers: 5,
    maxCustomBots: 0,
    maxDealers: 50,
    maxProducts: 200,
    allowCustomBot: false,
    allowWebStore: true,
    allowAnalytics: true,
    allowNotifications: true,
    allowMultiCompany: false,
    allowBulkImport: false,
};
let PlanLimitsService = PlanLimitsService_1 = class PlanLimitsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PlanLimitsService_1.name);
    }
    async getLimitsForCompany(companyId) {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { subscriptionPlan: true },
        });
        if (!company)
            return DEFAULT_LIMITS;
        const rows = await this.prisma.$queryRaw `
      SELECT
        "maxBranches",
        "maxUsers",
        COALESCE("maxCustomBots", 0) AS "maxCustomBots",
        "maxDealers",
        "maxProducts",
        "allowCustomBot",
        "allowWebStore",
        "allowAnalytics",
        "allowNotifications",
        "allowMultiCompany",
        "allowBulkImport"
      FROM "TariffPlan"
      WHERE "planKey" = ${company.subscriptionPlan}
      LIMIT 1
    `;
        const plan = rows[0] ?? null;
        if (!plan) {
            this.logger.warn(`No TariffPlan found for planKey=${company.subscriptionPlan}, using defaults`);
            return DEFAULT_LIMITS;
        }
        return {
            maxBranches: plan.maxBranches,
            maxUsers: plan.maxUsers,
            maxCustomBots: plan.maxCustomBots,
            maxDealers: plan.maxDealers,
            maxProducts: plan.maxProducts,
            allowCustomBot: plan.allowCustomBot,
            allowWebStore: plan.allowWebStore,
            allowAnalytics: plan.allowAnalytics,
            allowNotifications: plan.allowNotifications,
            allowMultiCompany: plan.allowMultiCompany,
            allowBulkImport: plan.allowBulkImport,
        };
    }
    getResourceLabel(resource) {
        const labels = {
            branches: "Branch",
            users: "Staff",
            dealers: "Dealer",
            products: "Product",
            customBot: "Telegram bot",
            allowAnalytics: "Analytics",
            allowWebStore: "Web store",
            allowNotifications: "Notifications",
            allowMultiCompany: "Multi-company",
            allowBulkImport: "Bulk import",
        };
        return labels[resource] || resource;
    }
    limitError(resource, max, type = "limit") {
        const label = this.getResourceLabel(resource);
        const message = type === "feature"
            ? `${label} is not available on your current plan. Please upgrade your tariff.`
            : max > 0
                ? `${label} limit reached. Your current plan allows up to ${max}. Please upgrade your tariff.`
                : `${label} is not available on your current plan. Please upgrade your tariff.`;
        throw new common_1.HttpException({ message, limitReached: true, resource, max, code: "PLAN_LIMIT_REACHED" }, 402);
    }
    async checkBranchLimit(companyId) {
        const limits = await this.getLimitsForCompany(companyId);
        const count = await this.prisma.branch.count({ where: { companyId, deletedAt: null } });
        if (count >= limits.maxBranches)
            this.limitError('branches', limits.maxBranches);
    }
    async checkUserLimit(companyId) {
        const limits = await this.getLimitsForCompany(companyId);
        const count = await this.prisma.user.count({ where: { companyId, deletedAt: null } });
        if (count >= limits.maxUsers)
            this.limitError('users', limits.maxUsers);
    }
    async checkDealerLimit(companyId) {
        const limits = await this.getLimitsForCompany(companyId);
        const count = await this.prisma.dealer.count({ where: { companyId, deletedAt: null } });
        if (count >= limits.maxDealers)
            this.limitError('dealers', limits.maxDealers);
    }
    async checkProductLimit(companyId) {
        const limits = await this.getLimitsForCompany(companyId);
        const count = await this.prisma.product.count({ where: { companyId, deletedAt: null } });
        if (count >= limits.maxProducts)
            this.limitError('products', limits.maxProducts);
    }
    async checkBotAllowed(companyId) {
        const limits = await this.getLimitsForCompany(companyId);
        if (!limits.allowCustomBot)
            this.limitError('customBot', 0, 'feature');
    }
    async checkBotLimit(companyId) {
        const limits = await this.getLimitsForCompany(companyId);
        if (!limits.allowCustomBot || limits.maxCustomBots <= 0) {
            this.limitError('customBot', limits.maxCustomBots, 'feature');
        }
        const count = await this.prisma.customBot.count({
            where: { companyId, deletedAt: null },
        });
        if (count >= limits.maxCustomBots)
            this.limitError('customBot', limits.maxCustomBots);
    }
    async checkFeatureAllowed(companyId, feature) {
        const limits = await this.getLimitsForCompany(companyId);
        if (!limits[feature])
            this.limitError(feature, 0, 'feature');
    }
};
exports.PlanLimitsService = PlanLimitsService;
exports.PlanLimitsService = PlanLimitsService = PlanLimitsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlanLimitsService);
//# sourceMappingURL=plan-limits.service.js.map