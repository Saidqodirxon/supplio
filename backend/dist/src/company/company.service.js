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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CompanyService = class CompanyService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCompany(companyId) {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
        });
        if (!company)
            throw new common_1.NotFoundException("Company not found");
        return company;
    }
    async updateCompany(companyId, data) {
        const allowedFields = [
            "name",
            "logo",
            "website",
            "instagram",
            "telegram",
            "siteActive",
            "cashbackPercent",
        ];
        const filteredData = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                filteredData[field] = data[field];
            }
        }
        return this.prisma.company.update({
            where: { id: companyId },
            data: filteredData,
        });
    }
    async getSubscriptionInfo(companyId) {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: {
                subscriptionPlan: true,
                subscriptionStatus: true,
                trialExpiresAt: true,
                subscriptions: {
                    orderBy: { createdAt: "desc" },
                    take: 5,
                    select: {
                        plan: true,
                        status: true,
                        amount: true,
                        expiresAt: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (!company)
            throw new common_1.NotFoundException("Company not found");
        const now = new Date();
        const isTrialExpired = company.subscriptionStatus === "TRIAL" &&
            company.trialExpiresAt < now;
        const daysLeft = company.subscriptionStatus === "TRIAL"
            ? Math.max(0, Math.ceil((company.trialExpiresAt.getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24)))
            : null;
        return {
            plan: company.subscriptionPlan,
            status: company.subscriptionStatus,
            trialExpiresAt: company.trialExpiresAt,
            isTrialExpired,
            daysLeft,
            history: company.subscriptions,
        };
    }
    async getUsers(companyId) {
        return this.prisma.user.findMany({
            where: { companyId, isActive: true },
            select: { id: true, phone: true, fullName: true, roleType: true, branchId: true },
            orderBy: { createdAt: "desc" },
        });
    }
    async getFeatureFlags(companyId) {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { subscriptionPlan: true },
        });
        const flags = await this.prisma.featureFlag.findMany({
            where: {
                OR: [{ companyId }, { companyId: null }],
            },
        });
        const plan = company?.subscriptionPlan || "FREE";
        const capabilities = {
            multiBranch: plan === "PRO" || plan === "PREMIUM",
            customTG: plan === "PREMIUM",
            apiAccess: plan === "PREMIUM",
            advanceAnalytics: plan === "PRO" || plan === "PREMIUM",
            bulkImport: plan !== "FREE",
        };
        flags.forEach((f) => {
            capabilities[f.featureKey] = f.isEnabled;
        });
        return capabilities;
    }
};
exports.CompanyService = CompanyService;
exports.CompanyService = CompanyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompanyService);
//# sourceMappingURL=company.service.js.map