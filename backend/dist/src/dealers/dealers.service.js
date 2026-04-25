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
exports.DealersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const plan_limits_service_1 = require("../common/services/plan-limits.service");
let DealersService = class DealersService {
    constructor(prisma, planLimits) {
        this.prisma = prisma;
        this.planLimits = planLimits;
    }
    async create(companyId, data) {
        await this.planLimits.checkDealerLimit(companyId);
        const branch = await this.prisma.branch.findUnique({
            where: { id: data.branchId },
        });
        if (!branch || branch.companyId !== companyId) {
            throw new common_1.ForbiddenException("Branch access denied or not found");
        }
        const normalizedPhone = data.phone.replace(/\s+/g, "").replace(/^\+?/, "+");
        const existing = await this.prisma.dealer.findFirst({
            where: { companyId, phone: normalizedPhone, deletedAt: null },
        });
        if (existing) {
            throw new common_1.BadRequestException("Dealer with this phone already exists");
        }
        const dealer = await this.prisma.dealer.create({
            data: {
                companyId,
                branchId: data.branchId,
                name: data.name,
                phone: normalizedPhone,
                creditLimit: data.creditLimit || 0,
                address: data.address,
            },
        });
        await this.prisma.dealerApprovalRequest.create({
            data: {
                companyId,
                dealerId: dealer.id,
                status: "PENDING",
                requestedAt: new Date(),
            },
        });
        return dealer;
    }
    async findAll(companyId, user) {
        const whereClause = { companyId, deletedAt: null };
        if (user.roleType !== "OWNER" &&
            user.roleType !== "SUPER_ADMIN" &&
            user.branchId) {
            whereClause.branchId = user.branchId;
        }
        const dealers = await this.prisma.dealer.findMany({
            where: whereClause,
            include: {
                branch: { select: { name: true } },
                _count: { select: { orders: { where: { deletedAt: null } } } },
            },
        });
        const result = await Promise.all(dealers.map(async (dealer) => {
            const debtAggregation = await this.prisma.ledgerTransaction.groupBy({
                by: ["type"],
                where: { dealerId: dealer.id, companyId },
                _sum: { amount: true },
            });
            let ordersTotal = 0;
            let paymentsTotal = 0;
            debtAggregation.forEach((agg) => {
                if (agg.type === "ORDER")
                    ordersTotal += agg._sum.amount || 0;
                if (agg.type === "PAYMENT" || agg.type === "ADJUSTMENT")
                    paymentsTotal += agg._sum.amount || 0;
            });
            const currentDebt = ordersTotal - paymentsTotal;
            return {
                ...dealer,
                currentDebt,
                ordersCount: dealer._count?.orders ?? 0,
                status: currentDebt >= dealer.creditLimit
                    ? "LIMIT_REACHED"
                    : currentDebt > 0
                        ? "HAS_DEBT"
                        : "HEALTHY",
            };
        }));
        return result;
    }
    async getPendingApprovals(companyId) {
        return this.prisma.dealer.findMany({
            where: { companyId, isApproved: false, deletedAt: null },
            include: {
                branch: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approveDealer(id, companyId, userId, creditLimit) {
        const dealer = await this.prisma.dealer.findFirst({
            where: { id, companyId, deletedAt: null },
        });
        if (!dealer) {
            throw new common_1.NotFoundException("Dealer not found");
        }
        const updated = await this.prisma.dealer.update({
            where: { id },
            data: {
                isApproved: true,
                approvedAt: new Date(),
                approvedBy: userId,
                ...(creditLimit !== undefined && creditLimit > 0 ? { creditLimit } : {}),
            },
        });
        await this.prisma.dealerApprovalRequest.create({
            data: {
                companyId,
                dealerId: id,
                status: "APPROVED",
                reviewedAt: new Date(),
                reviewedBy: userId,
                requestedAt: new Date(),
            },
        });
        return updated;
    }
    async update(id, companyId, data) {
        return this.prisma.dealer.update({
            where: { id, companyId },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.phone && { phone: data.phone }),
                ...(data.branchId && { branchId: data.branchId }),
                ...(data.creditLimit !== undefined && {
                    creditLimit: data.creditLimit,
                }),
                ...(data.address !== undefined && { address: data.address }),
            },
            include: { branch: { select: { name: true } } },
        });
    }
    async block(id, companyId) {
        return this.prisma.dealer.update({
            where: { id, companyId },
            data: { isBlocked: true },
        });
    }
    async unblock(id, companyId) {
        return this.prisma.dealer.update({
            where: { id, companyId },
            data: { isBlocked: false },
        });
    }
    async remove(id, companyId, userId) {
        return this.prisma.dealer.update({
            where: { id, companyId },
            data: { deletedAt: new Date(), deletedBy: userId },
        });
    }
    async rejectDealer(id, companyId, userId) {
        const dealer = await this.prisma.dealer.findFirst({
            where: { id, companyId, deletedAt: null },
        });
        if (!dealer) {
            throw new common_1.NotFoundException("Dealer not found");
        }
        await this.prisma.dealer.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        await this.prisma.dealerApprovalRequest.create({
            data: {
                companyId,
                dealerId: id,
                status: "REJECTED",
                reviewedAt: new Date(),
                reviewedBy: userId,
                requestedAt: new Date(),
            },
        });
        return { success: true };
    }
};
exports.DealersService = DealersService;
exports.DealersService = DealersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        plan_limits_service_1.PlanLimitsService])
], DealersService);
//# sourceMappingURL=dealers.service.js.map