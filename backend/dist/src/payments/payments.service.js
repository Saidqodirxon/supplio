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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const telegram_service_1 = require("../telegram/telegram.service");
let PaymentsService = class PaymentsService {
    constructor(prisma, telegram) {
        this.prisma = prisma;
        this.telegram = telegram;
    }
    async create(companyId, data) {
        const payment = await this.prisma.$transaction(async (tx) => {
            const dealer = await tx.dealer.findUnique({
                where: { id: data.dealerId },
                select: { branchId: true },
            });
            if (!dealer)
                throw new common_1.BadRequestException("Dealer not found");
            const p = await tx.payment.create({
                data: {
                    companyId,
                    branchId: data.branchId ?? dealer.branchId,
                    dealerId: data.dealerId,
                    amount: data.amount,
                    method: data.method,
                    reference: data.reference,
                    note: data.note,
                },
            });
            await tx.ledgerTransaction.create({
                data: {
                    companyId,
                    branchId: dealer.branchId,
                    dealerId: data.dealerId,
                    type: "PAYMENT",
                    amount: data.amount,
                    reference: data.reference,
                    note: data.note,
                },
            });
            await tx.dealer.update({
                where: { id: data.dealerId },
                data: { currentDebt: { decrement: data.amount } },
            });
            return p;
        });
        this.telegram
            .notifyDealerPayment(companyId, data.dealerId, data.amount, "PAYMENT", data.note)
            .catch(() => { });
        return payment;
    }
    async createAdjustment(companyId, data) {
        const result = await this.prisma.$transaction(async (tx) => {
            const dealer = await tx.dealer.findUnique({
                where: { id: data.dealerId },
                select: { branchId: true },
            });
            if (!dealer)
                throw new common_1.BadRequestException("Dealer not found");
            await tx.ledgerTransaction.create({
                data: {
                    companyId,
                    branchId: data.branchId ?? dealer.branchId,
                    dealerId: data.dealerId,
                    type: "ADJUSTMENT",
                    amount: data.amount,
                    note: data.note,
                },
            });
            await tx.dealer.update({
                where: { id: data.dealerId },
                data: { currentDebt: { decrement: data.amount } },
            });
            return { success: true, amount: data.amount, note: data.note };
        });
        this.telegram
            .notifyDealerPayment(companyId, data.dealerId, data.amount, "ADJUSTMENT", data.note)
            .catch(() => { });
        return result;
    }
    async findAll(companyId) {
        return this.prisma.payment.findMany({
            where: { companyId, deletedAt: null },
            include: {
                dealer: { select: { name: true, phone: true } },
                branch: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async getDealerDebt(companyId, dealerId) {
        const [ordersAgg, paymentsAgg, dealer] = await Promise.all([
            this.prisma.ledgerTransaction.aggregate({
                where: { companyId, dealerId, type: "ORDER" },
                _sum: { amount: true },
            }),
            this.prisma.ledgerTransaction.aggregate({
                where: { companyId, dealerId, type: { in: ["PAYMENT", "ADJUSTMENT"] } },
                _sum: { amount: true },
            }),
            this.prisma.dealer.findFirst({
                where: { id: dealerId, companyId },
                select: { name: true, creditLimit: true, currentDebt: true },
            }),
        ]);
        const totalOrders = ordersAgg._sum.amount ?? 0;
        const totalPaid = paymentsAgg._sum.amount ?? 0;
        const debt = totalOrders - totalPaid;
        return {
            dealerId,
            name: dealer?.name,
            totalOrders,
            totalPaid,
            debt,
            creditLimit: dealer?.creditLimit ?? 0,
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        telegram_service_1.TelegramService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map