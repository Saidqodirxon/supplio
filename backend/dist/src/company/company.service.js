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
const plan_limits_service_1 = require("../common/services/plan-limits.service");
const telegram_service_1 = require("../telegram/telegram.service");
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
let CompanyService = class CompanyService {
    constructor(prisma, planLimits, telegramService) {
        this.prisma = prisma;
        this.planLimits = planLimits;
        this.telegramService = telegramService;
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
            "facebook",
            "tiktok",
            "youtube",
            "siteActive",
            "cashbackPercent",
            "workingHours",
            "contactPhone",
            "contactAddress",
            "botPaused",
            "botAutoSchedule",
            "logGroupChatId",
            "orderGroupChatId",
            "preparingVariants",
            "dealerStatusLabels",
        ];
        const filteredData = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                filteredData[field] = data[field];
            }
        }
        const updated = await this.prisma.company.update({
            where: { id: companyId },
            data: filteredData,
        });
        if (filteredData.name !== undefined || filteredData.logo !== undefined) {
            this.prisma.customBot
                .findMany({ where: { companyId, isActive: true, deletedAt: null }, select: { token: true } })
                .then((bots) => {
                for (const bot of bots) {
                    this.telegramService
                        .applyBotBranding(bot.token, companyId)
                        .catch(() => { });
                }
            })
                .catch(() => { });
        }
        return updated;
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
            select: {
                id: true, phone: true, fullName: true, roleType: true,
                branchId: true, customRoleId: true, createdAt: true,
                customRole: { select: { id: true, name: true, permissions: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async createStaff(companyId, data) {
        const builtInRoles = [client_1.RoleType.MANAGER, client_1.RoleType.SALES, client_1.RoleType.DELIVERY, client_1.RoleType.SELLER, client_1.RoleType.CUSTOM];
        const isCustom = data.roleType === client_1.RoleType.CUSTOM;
        if (!builtInRoles.includes(data.roleType)) {
            throw new common_1.BadRequestException("Invalid role type");
        }
        if (isCustom && !data.customRoleId) {
            throw new common_1.BadRequestException("customRoleId required for CUSTOM role");
        }
        if (data.customRoleId) {
            const roleExists = await this.prisma.customRole.findFirst({ where: { id: data.customRoleId, companyId } });
            if (!roleExists)
                throw new common_1.BadRequestException("Custom role not found");
        }
        await this.planLimits.checkUserLimit(companyId);
        const existing = await this.prisma.user.findUnique({ where: { phone: data.phone } });
        if (existing)
            throw new common_1.BadRequestException("Phone already registered");
        const passwordHash = await bcrypt.hash(data.password, 10);
        return this.prisma.user.create({
            data: {
                phone: data.phone,
                fullName: data.fullName,
                passwordHash,
                roleType: isCustom ? client_1.RoleType.CUSTOM : data.roleType,
                companyId,
                branchId: data.branchId || null,
                customRoleId: data.customRoleId || null,
            },
            select: {
                id: true, phone: true, fullName: true, roleType: true,
                branchId: true, customRoleId: true, createdAt: true,
                customRole: { select: { id: true, name: true, permissions: true } },
            },
        });
    }
    async updateStaff(companyId, userId, data) {
        const user = await this.prisma.user.findFirst({ where: { id: userId, companyId } });
        if (!user)
            throw new common_1.NotFoundException("User not found");
        if (user.roleType === client_1.RoleType.OWNER || user.roleType === client_1.RoleType.SUPER_ADMIN) {
            throw new common_1.BadRequestException("Cannot edit owner or super admin");
        }
        if (data.phone && data.phone !== user.phone) {
            const existing = await this.prisma.user.findFirst({ where: { phone: data.phone, deletedAt: null } });
            if (existing)
                throw new common_1.BadRequestException("Bu telefon raqam allaqachon ishlatilmoqda");
        }
        const updateData = {};
        if (data.phone)
            updateData.phone = data.phone;
        if (data.fullName !== undefined)
            updateData.fullName = data.fullName;
        if (data.roleType)
            updateData.roleType = data.roleType;
        if (data.branchId !== undefined)
            updateData.branchId = data.branchId || null;
        if (data.customRoleId !== undefined)
            updateData.customRoleId = data.customRoleId || null;
        return this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true, phone: true, fullName: true, roleType: true,
                branchId: true, customRoleId: true, createdAt: true,
                customRole: { select: { id: true, name: true, permissions: true } },
            },
        });
    }
    async deactivateStaff(companyId, userId) {
        const user = await this.prisma.user.findFirst({ where: { id: userId, companyId } });
        if (!user)
            throw new common_1.NotFoundException("User not found");
        if (user.roleType === client_1.RoleType.OWNER || user.roleType === client_1.RoleType.SUPER_ADMIN) {
            throw new common_1.BadRequestException("Cannot deactivate owner or super admin");
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: { isActive: false },
        });
    }
    async getCustomRoles(companyId) {
        return this.prisma.customRole.findMany({
            where: { companyId },
            include: { _count: { select: { users: true } } },
            orderBy: { createdAt: "asc" },
        });
    }
    async createCustomRole(companyId, data) {
        if (!data.name?.trim())
            throw new common_1.BadRequestException("Role name required");
        const exists = await this.prisma.customRole.findFirst({ where: { companyId, name: data.name.trim() } });
        if (exists)
            throw new common_1.BadRequestException("Role with this name already exists");
        return this.prisma.customRole.create({
            data: {
                companyId,
                name: data.name.trim(),
                permissions: data.permissions ?? {},
            },
        });
    }
    async updateCustomRole(companyId, roleId, data) {
        const role = await this.prisma.customRole.findFirst({ where: { id: roleId, companyId } });
        if (!role)
            throw new common_1.NotFoundException("Role not found");
        return this.prisma.customRole.update({
            where: { id: roleId },
            data: { name: data.name?.trim(), permissions: data.permissions },
        });
    }
    async deleteCustomRole(companyId, roleId) {
        const role = await this.prisma.customRole.findFirst({ where: { id: roleId, companyId }, include: { _count: { select: { users: true } } } });
        if (!role)
            throw new common_1.NotFoundException("Role not found");
        if (role._count.users > 0)
            throw new common_1.BadRequestException("Cannot delete role with assigned users");
        return this.prisma.customRole.delete({ where: { id: roleId } });
    }
    async getBackup(companyId) {
        const [company, dealers, products, orders, payments, expenses, branches, staff] = await Promise.all([
            this.prisma.company.findUnique({
                where: { id: companyId },
                select: { id: true, name: true, slug: true, website: true, instagram: true, telegram: true, subscriptionPlan: true, createdAt: true },
            }),
            this.prisma.dealer.findMany({ where: { companyId, deletedAt: null }, orderBy: { createdAt: 'asc' } }),
            this.prisma.product.findMany({ where: { companyId, deletedAt: null }, orderBy: { createdAt: 'asc' } }),
            this.prisma.order.findMany({
                where: { companyId, deletedAt: null },
                orderBy: { createdAt: 'asc' },
                include: { dealer: { select: { name: true, phone: true } } },
            }),
            this.prisma.payment.findMany({ where: { companyId, deletedAt: null }, orderBy: { createdAt: 'asc' } }),
            this.prisma.expense.findMany({ where: { companyId, deletedAt: null }, orderBy: { createdAt: 'asc' } }),
            this.prisma.branch.findMany({ where: { companyId }, orderBy: { createdAt: 'asc' } }),
            this.prisma.user.findMany({
                where: { companyId, isActive: true },
                select: { id: true, phone: true, fullName: true, roleType: true, createdAt: true },
            }),
        ]);
        return {
            exportedAt: new Date().toISOString(),
            company,
            summary: {
                dealers: dealers.length,
                products: products.length,
                orders: orders.length,
                payments: payments.length,
                expenses: expenses.length,
                branches: branches.length,
                staff: staff.length,
            },
            dealers,
            products,
            orders,
            payments,
            expenses,
            branches,
            staff,
        };
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        plan_limits_service_1.PlanLimitsService,
        telegram_service_1.TelegramService])
], CompanyService);
//# sourceMappingURL=company.service.js.map