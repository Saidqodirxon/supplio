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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var StoreController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StoreController = StoreController_1 = class StoreController {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(StoreController_1.name);
    }
    async getCompanyInfo(slug) {
        const company = await this.prisma.company.findFirst({
            where: { slug, deletedAt: null, siteActive: true },
            select: {
                name: true,
                slug: true,
                logo: true,
                telegram: true,
                instagram: true,
                website: true,
                subscriptionStatus: true,
                trialExpiresAt: true,
            },
        });
        if (!company) {
            throw new common_1.NotFoundException("Company not found or store is disabled");
        }
        if (company.subscriptionStatus === "LOCKED") {
            throw new common_1.ForbiddenException("Store temporarily suspended");
        }
        if (company.subscriptionStatus === "TRIAL" &&
            new Date() > company.trialExpiresAt) {
            throw new common_1.ForbiddenException("Maintenance in progress");
        }
        return company;
    }
    async getCategories(slug) {
        const company = await this.prisma.company.findFirst({
            where: { slug, deletedAt: null, siteActive: true },
            select: { id: true },
        });
        if (!company)
            throw new common_1.NotFoundException("Company not found");
        return this.prisma.category.findMany({
            where: { companyId: company.id, deletedAt: null },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        });
    }
    async getProducts(slug, categoryId, search) {
        const company = await this.prisma.company.findFirst({
            where: { slug, deletedAt: null, siteActive: true },
            select: { id: true },
        });
        if (!company) {
            throw new common_1.NotFoundException("Company not found");
        }
        const compInfo = await this.prisma.company.findUnique({
            where: { id: company.id },
            select: { subscriptionStatus: true, trialExpiresAt: true },
        });
        if (compInfo?.subscriptionStatus === "LOCKED" ||
            (compInfo?.subscriptionStatus === "TRIAL" &&
                new Date() > (compInfo?.trialExpiresAt || 0))) {
            throw new common_1.ForbiddenException("Catalog unavailable");
        }
        const where = {
            companyId: company.id,
            deletedAt: null,
            isActive: true,
        };
        if (categoryId)
            where.categoryId = categoryId;
        if (search)
            where.name = { contains: search, mode: "insensitive" };
        const products = await this.prisma.product.findMany({
            where,
            select: {
                id: true,
                name: true,
                sku: true,
                description: true,
                price: true,
                stock: true,
                unit: true,
                imageUrl: true,
                categoryId: true,
                category: { select: { id: true, name: true } },
            },
            orderBy: { name: "asc" },
        });
        return products;
    }
    async identifyDealer(slug, phone) {
        const company = await this.prisma.company.findFirst({
            where: { slug, deletedAt: null },
            select: { id: true },
        });
        if (!company)
            throw new common_1.NotFoundException("Company not found");
        let cleanPhone = phone.replace("+", "");
        const dealer = await this.prisma.dealer.findFirst({
            where: {
                companyId: company.id,
                phone: { contains: cleanPhone.slice(-9) },
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                phone: true,
                creditLimit: true,
                currentDebt: true,
                branchId: true,
            },
        });
        if (!dealer)
            throw new common_1.NotFoundException("Diler topilmadi. Iltimos, raqamni tekshiring yoki menejer bilan bog'laning.");
        return dealer;
    }
    async placeOrder(slug, body) {
        const company = await this.prisma.company.findFirst({
            where: { slug, deletedAt: null },
            select: { id: true },
        });
        if (!company)
            throw new common_1.NotFoundException("Company not found");
        const dealer = await this.prisma.dealer.findUnique({
            where: { id: body.dealerId },
        });
        if (!dealer || dealer.companyId !== company.id)
            throw new common_1.BadRequestException("Invalid dealer");
        let total = 0;
        const orderItemsData = [];
        for (const item of body.items) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
            });
            if (!product || product.companyId !== company.id)
                throw new common_1.BadRequestException(`Mahsulot topilmadi: ${item.productId}`);
            if (product.stock < item.quantity)
                throw new common_1.BadRequestException(`${product.name} stogi yetarli emas`);
            total += product.price * item.quantity;
            orderItemsData.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price,
            });
        }
        const availableCredit = (dealer.creditLimit || 0) - (dealer.currentDebt || 0);
        if (total > availableCredit && dealer.creditLimit > 0) {
            throw new common_1.BadRequestException("Kredit limiti yetarli emas!");
        }
        return await this.prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    companyId: company.id,
                    branchId: dealer.branchId,
                    dealerId: dealer.id,
                    totalAmount: total,
                    status: "PENDING",
                    items: orderItemsData,
                },
            });
            for (const item of body.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
            }
            await tx.dealer.update({
                where: { id: dealer.id },
                data: { currentDebt: { increment: total } },
            });
            await tx.ledgerTransaction.create({
                data: {
                    companyId: company.id,
                    dealerId: dealer.id,
                    type: "ORDER",
                    amount: total,
                    reference: order.id,
                },
            });
            return order;
        });
    }
};
exports.StoreController = StoreController;
__decorate([
    (0, common_1.Get)(":slug/info"),
    __param(0, (0, common_1.Param)("slug")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getCompanyInfo", null);
__decorate([
    (0, common_1.Get)(":slug/categories"),
    __param(0, (0, common_1.Param)("slug")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)(":slug/products"),
    __param(0, (0, common_1.Param)("slug")),
    __param(1, (0, common_1.Query)("categoryId")),
    __param(2, (0, common_1.Query)("search")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Post)(":slug/identify"),
    __param(0, (0, common_1.Param)("slug")),
    __param(1, (0, common_1.Body)("phone")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "identifyDealer", null);
__decorate([
    (0, common_1.Post)(":slug/order"),
    __param(0, (0, common_1.Param)("slug")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "placeOrder", null);
exports.StoreController = StoreController = StoreController_1 = __decorate([
    (0, common_1.Controller)("store"),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StoreController);
//# sourceMappingURL=store.controller.js.map