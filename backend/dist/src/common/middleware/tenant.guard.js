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
exports.TenantGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TenantGuard = class TenantGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException("SEC_ERR: Authentication missing");
        }
        if (user.roleType === "SUPER_ADMIN") {
            const targetCompanyId = request.headers['x-company-id'] || user.companyId;
            if (targetCompanyId) {
                request.companyId = targetCompanyId;
            }
            return true;
        }
        if (!user.companyId) {
            throw new common_1.ForbiddenException("SEC_ERR: Tenant identification missing");
        }
        const company = await this.prisma.company.findUnique({
            where: { id: user.companyId },
            include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
        });
        if (!company) {
            throw new common_1.ForbiddenException("SEC_ERR: Registered Company not found");
        }
        const settings = await this.prisma.systemSettings.findUnique({
            where: { id: "GLOBAL" },
        });
        if (settings?.maintenanceMode && user.roleType !== "SUPER_ADMIN") {
            throw new common_1.ServiceUnavailableException("SYSTEM_MAINTENANCE: Try again in 30 minutes.");
        }
        const now = new Date();
        if (company.subscriptionStatus === client_1.SubscriptionStatus.TRIAL &&
            now > company.trialExpiresAt) {
            throw new common_1.ForbiddenException({
                statusCode: 403,
                message: "TRIAL_EXPIRED: Your 14-day evaluation has ended.",
                trialEnd: company.trialExpiresAt,
                action: "UPGRADE_PLAN",
            });
        }
        if (company.subscriptionStatus === client_1.SubscriptionStatus.LOCKED ||
            company.subscriptionStatus === client_1.SubscriptionStatus.PAST_DUE) {
            throw new common_1.ForbiddenException({
                statusCode: 403,
                message: "ACCOUNT_LOCKED: Access restricted due to payment issues.",
                action: "CONTACT_BILLING",
            });
        }
        request.company = company;
        request.companyId = company.id;
        return true;
    }
};
exports.TenantGuard = TenantGuard;
exports.TenantGuard = TenantGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantGuard);
//# sourceMappingURL=tenant.guard.js.map