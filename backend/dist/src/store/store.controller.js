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
const plan_limits_service_1 = require("../common/services/plan-limits.service");
let StoreController = StoreController_1 = class StoreController {
    constructor(prisma, planLimits) {
        this.prisma = prisma;
        this.planLimits = planLimits;
        this.logger = new common_1.Logger(StoreController_1.name);
    }
    isCompanyAccessBlocked(company) {
        if (!company)
            return true;
        if (company.subscriptionStatus === "LOCKED")
            return true;
        if (company.trialExpiresAt &&
            ["TRIAL", "ACTIVE"].includes(String(company.subscriptionStatus || "")) &&
            new Date() > new Date(company.trialExpiresAt)) {
            return true;
        }
        return false;
    }
    async getCompanyInfo(slug) {
        const company = await this.prisma.company.findFirst({
            where: { slug, deletedAt: null, siteActive: true },
            select: {
                id: true,
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
        if (this.isCompanyAccessBlocked(company)) {
            throw new common_1.ForbiddenException("Store temporarily suspended");
        }
        await this.planLimits.checkFeatureAllowed(company.id, "allowWebStore");
        return company;
    }
    async getCategories(slug) {
        const company = await this.prisma.company.findFirst({
            where: { slug, deletedAt: null, siteActive: true },
            select: { id: true },
        });
        if (!company)
            throw new common_1.NotFoundException("Company not found");
        await this.planLimits.checkFeatureAllowed(company.id, "allowWebStore");
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
        if (this.isCompanyAccessBlocked(compInfo)) {
            throw new common_1.ForbiddenException("Catalog unavailable");
        }
        await this.planLimits.checkFeatureAllowed(company.id, "allowWebStore");
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
    async identifyDealer(slug, phone, telegramUserId, name, region, district, contactPhone, channel) {
        if (channel !== "telegram-webapp") {
            throw new common_1.ForbiddenException("Buyurtma berish faqat Telegram bot ichida mavjud");
        }
        const company = await this.prisma.company.findFirst({
            where: { slug, deletedAt: null },
            select: { id: true },
        });
        if (!company)
            throw new common_1.NotFoundException("Company not found");
        const companyAccess = await this.prisma.company.findUnique({
            where: { id: company.id },
            select: { subscriptionStatus: true, trialExpiresAt: true },
        });
        if (this.isCompanyAccessBlocked(companyAccess)) {
            throw new common_1.ForbiddenException("Store temporarily suspended");
        }
        await this.planLimits.checkFeatureAllowed(company.id, "allowWebStore");
        const chatId = telegramUserId ? String(telegramUserId) : "";
        if (chatId) {
            const dealerByChat = await this.prisma.dealer.findFirst({
                where: {
                    companyId: company.id,
                    telegramChatId: chatId,
                    deletedAt: null,
                },
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    creditLimit: true,
                    currentDebt: true,
                    branchId: true,
                    isApproved: true,
                    isBlocked: true,
                },
            });
            if (dealerByChat) {
                if (dealerByChat.isBlocked) {
                    throw new common_1.ForbiddenException("Hisob bloklangan. Distributor bilan bog'laning.");
                }
                if (!dealerByChat.isApproved) {
                    return { pending: true, message: "Ma'lumotlaringiz distributorga yuborildi. Ular siz bilan bog'lanadi." };
                }
                const { isApproved, isBlocked, ...dealerPayload } = dealerByChat;
                return dealerPayload;
            }
        }
        const cleanPhone = (phone || "").replace("+", "");
        if (!cleanPhone) {
            throw new common_1.BadRequestException("Telefon raqami talab qilinadi");
        }
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
                telegramChatId: true,
                creditLimit: true,
                currentDebt: true,
                branchId: true,
                isApproved: true,
                isBlocked: true,
            },
        });
        if (dealer) {
            if (dealer.isBlocked) {
                throw new common_1.ForbiddenException("Hisob bloklangan. Distributor bilan bog'laning.");
            }
            if (chatId && dealer.telegramChatId !== chatId) {
                await this.prisma.dealer.update({
                    where: { id: dealer.id },
                    data: { telegramChatId: chatId },
                });
            }
            if (!dealer.isApproved) {
                const pending = await this.prisma.dealerApprovalRequest.findFirst({
                    where: { dealerId: dealer.id, status: "PENDING" },
                });
                if (!pending) {
                    await this.prisma.dealerApprovalRequest.create({
                        data: {
                            companyId: company.id,
                            dealerId: dealer.id,
                            status: "PENDING",
                            requestedAt: new Date(),
                        },
                    });
                }
                return { pending: true, message: "Ma'lumotlaringiz distributorga yuborildi. Ular siz bilan bog'lanadi." };
            }
            const { isApproved, isBlocked, ...dealerPayload } = dealer;
            return dealerPayload;
        }
        const defaultBranch = await this.prisma.branch.findFirst({
            where: { companyId: company.id, deletedAt: null },
            select: { id: true },
            orderBy: { createdAt: "asc" },
        });
        if (!defaultBranch?.id) {
            throw new common_1.BadRequestException("Filial topilmadi. Distributor bilan bog'laning.");
        }
        const pendingDealer = await this.prisma.dealer.create({
            data: {
                companyId: company.id,
                branchId: defaultBranch.id,
                name: (name || "Yangi diler").trim(),
                phone: cleanPhone.startsWith("+") ? cleanPhone : `+${cleanPhone}`,
                telegramChatId: chatId || null,
                isApproved: false,
                region: region || null,
                district: district || null,
                contactPhone: contactPhone || null,
            },
        });
        await this.prisma.dealerApprovalRequest.create({
            data: {
                companyId: company.id,
                dealerId: pendingDealer.id,
                status: "PENDING",
                requestedAt: new Date(),
            },
        });
        return { pending: true, message: "Ma'lumotlaringiz distributorga yuborildi. Ular siz bilan bog'lanadi." };
    }
    async placeOrder(slug, channel, body) {
        if (channel !== "telegram-webapp") {
            throw new common_1.ForbiddenException("Buyurtma berish faqat Telegram bot ichida mavjud");
        }
        const company = await this.prisma.company.findFirst({
            where: { slug, deletedAt: null },
            select: { id: true },
        });
        if (!company)
            throw new common_1.NotFoundException("Company not found");
        const companyAccess = await this.prisma.company.findUnique({
            where: { id: company.id },
            select: { subscriptionStatus: true, trialExpiresAt: true },
        });
        if (this.isCompanyAccessBlocked(companyAccess)) {
            throw new common_1.ForbiddenException("Store temporarily suspended");
        }
        await this.planLimits.checkFeatureAllowed(company.id, "allowWebStore");
        const dealer = await this.prisma.dealer.findUnique({
            where: { id: body.dealerId },
        });
        if (!dealer || dealer.companyId !== company.id)
            throw new common_1.BadRequestException("Invalid dealer");
        if (!dealer.isApproved) {
            throw new common_1.ForbiddenException("Dealer hali tasdiqlanmagan");
        }
        if (dealer.isBlocked) {
            throw new common_1.ForbiddenException("Dealer bloklangan");
        }
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
    __param(2, (0, common_1.Body)("telegramUserId")),
    __param(3, (0, common_1.Body)("name")),
    __param(4, (0, common_1.Body)("region")),
    __param(5, (0, common_1.Body)("district")),
    __param(6, (0, common_1.Body)("contactPhone")),
    __param(7, (0, common_1.Headers)("x-supplio-channel")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "identifyDealer", null);
__decorate([
    (0, common_1.Post)(":slug/order"),
    __param(0, (0, common_1.Param)("slug")),
    __param(1, (0, common_1.Headers)("x-supplio-channel")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "placeOrder", null);
exports.StoreController = StoreController = StoreController_1 = __decorate([
    (0, common_1.Controller)("store"),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        plan_limits_service_1.PlanLimitsService])
], StoreController);
//# sourceMappingURL=store.controller.js.map