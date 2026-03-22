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
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ExpensesService = class ExpensesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(companyId, data) {
        await this.prisma.ledgerTransaction.create({
            data: {
                companyId,
                branchId: data.branchId,
                type: "EXPENSE",
                amount: data.amount,
                note: `${data.category}: ${data.description || ""}`,
            },
        });
        return this.prisma.expense.create({
            data: {
                companyId,
                branchId: data.branchId,
                amount: data.amount,
                category: data.category,
                description: data.description,
            },
            include: { branch: { select: { name: true } } },
        });
    }
    async findAll(companyId, branchId) {
        return this.prisma.expense.findMany({
            where: {
                companyId,
                deletedAt: null,
                ...(branchId ? { branchId } : {}),
            },
            include: { branch: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
        });
    }
    async findOne(id, companyId) {
        const expense = await this.prisma.expense.findFirst({
            where: { id, companyId, deletedAt: null },
            include: { branch: { select: { name: true } } },
        });
        if (!expense)
            throw new common_1.NotFoundException("Expense not found");
        return expense;
    }
    async remove(id, companyId, deletedBy) {
        await this.findOne(id, companyId);
        return this.prisma.expense.update({
            where: { id },
            data: { deletedAt: new Date(), deletedBy },
        });
    }
    async getSummary(companyId) {
        const expenses = await this.prisma.expense.findMany({
            where: { companyId, deletedAt: null },
            select: { amount: true, category: true },
        });
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        const byCategory = {};
        expenses.forEach((e) => {
            byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
        });
        return { total, byCategory };
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map