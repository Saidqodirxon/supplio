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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const telegram_service_1 = require("../telegram/telegram.service");
const company_notifier_service_1 = require("../telegram/company-notifier.service");
let OrdersService = class OrdersService {
    constructor(prisma, telegramService, companyNotifier) {
        this.prisma = prisma;
        this.telegramService = telegramService;
        this.companyNotifier = companyNotifier;
    }
    async create(companyId, data) {
        const { dealerId, branchId, products } = data;
        const createdOrder = await this.prisma.$transaction(async (tx) => {
            const totalAmount = products.reduce((acc, p) => acc + p.price * p.quantity, 0);
            const productIds = products
                .filter((p) => p.productId)
                .map((p) => p.productId);
            const productCosts = {};
            const productNames = {};
            const productUnits = {};
            if (productIds.length > 0) {
                const dbProducts = await tx.product.findMany({
                    where: { id: { in: productIds }, companyId },
                    select: { id: true, costPrice: true, name: true, unit: true },
                });
                dbProducts.forEach((p) => {
                    productCosts[p.id] = p.costPrice;
                    productNames[p.id] = p.name;
                    productUnits[p.id] = p.unit ?? "pcs";
                });
            }
            const totalCost = products.reduce((acc, p) => {
                const cost = p.cost ?? (p.productId ? (productCosts[p.productId] ?? 0) : 0);
                return acc + cost * p.quantity;
            }, 0);
            const dealer = await tx.dealer.findFirst({
                where: { id: dealerId, companyId },
            });
            if (!dealer)
                throw new common_1.BadRequestException("Dealer not found");
            const ordersTotal = await tx.ledgerTransaction.aggregate({
                where: { dealerId, companyId, type: "ORDER" },
                _sum: { amount: true },
            });
            const paymentsTotal = await tx.ledgerTransaction.aggregate({
                where: { dealerId, companyId, type: { in: ["PAYMENT", "ADJUSTMENT"] } },
                _sum: { amount: true },
            });
            const currentDebt = (ordersTotal._sum.amount || 0) - (paymentsTotal._sum.amount || 0);
            if (dealer.creditLimit > 0 &&
                currentDebt + totalAmount > dealer.creditLimit) {
                throw new common_1.BadRequestException("Credit limit exceeded");
            }
            const orderItems = products.map((p) => ({
                productId: p.productId ?? null,
                name: p.productId
                    ? (productNames[p.productId] ?? "Unknown")
                    : "Unknown",
                qty: p.quantity,
                unit: p.productId ? (productUnits[p.productId] ?? "pcs") : "pcs",
                price: p.price,
                total: p.price * p.quantity,
            }));
            const order = await tx.order.create({
                data: {
                    companyId,
                    dealerId,
                    branchId,
                    totalAmount,
                    totalCost,
                    items: orderItems,
                    status: "PENDING",
                },
            });
            await tx.ledgerTransaction.create({
                data: { companyId, dealerId, type: "ORDER", amount: totalAmount },
            });
            const company = await tx.company.findUnique({
                where: { id: companyId },
                select: { cashbackPercent: true },
            });
            const cashbackPct = company?.cashbackPercent ?? 0;
            const cashbackEarned = cashbackPct > 0 ? Math.floor((totalAmount * cashbackPct) / 100) : 0;
            await tx.dealer.update({
                where: { id: dealerId },
                data: {
                    currentDebt: { increment: totalAmount },
                    ...(cashbackEarned > 0
                        ? { cashbackBalance: { increment: cashbackEarned } }
                        : {}),
                },
            });
            return order;
        });
        const branch = await this.prisma.branch
            .findUnique({ where: { id: data.branchId }, select: { name: true } })
            .catch(() => null);
        this.companyNotifier
            .notifyNewOrder(companyId, {
            id: createdOrder.id,
            totalAmount: createdOrder.totalAmount,
            dealerName: (await this.prisma.dealer
                .findUnique({
                where: { id: data.dealerId },
                select: { name: true },
            })
                .catch(() => null))?.name ?? "Unknown",
            dealerPhone: (await this.prisma.dealer
                .findUnique({
                where: { id: data.dealerId },
                select: { phone: true },
            })
                .catch(() => null))?.phone ?? "",
            branchName: branch?.name ?? "",
            items: createdOrder.items ?? [],
        })
            .catch(() => { });
        return createdOrder;
    }
    async findAll(companyId) {
        const orders = await this.prisma.order.findMany({
            where: { companyId, deletedAt: null },
            orderBy: { createdAt: "desc" },
            include: {
                dealer: { select: { name: true, phone: true } },
                branch: { select: { name: true } },
            },
        });
        const productIdSet = new Set();
        for (const order of orders) {
            const items = order.items;
            if (Array.isArray(items)) {
                items.forEach((item) => {
                    if (item.productId)
                        productIdSet.add(item.productId);
                });
            }
        }
        const productMap = new Map();
        if (productIdSet.size > 0) {
            const products = await this.prisma.product.findMany({
                where: { id: { in: Array.from(productIdSet) }, companyId },
                select: { id: true, name: true, unit: true },
            });
            products.forEach((p) => productMap.set(p.id, p.name));
        }
        return orders.map((order) => {
            const rawItems = order.items;
            const items = Array.isArray(rawItems)
                ? rawItems.map((item) => ({
                    productId: item.productId ?? null,
                    name: item.name ||
                        (item.productId
                            ? (productMap.get(item.productId) ?? "Unknown")
                            : "Unknown"),
                    qty: item.qty ?? item.quantity ?? 1,
                    unit: item.unit ?? "pcs",
                    price: item.price ?? 0,
                    total: item.total ??
                        (item.qty ?? item.quantity ?? 1) * (item.price ?? 0),
                }))
                : [];
            return { ...order, items };
        });
    }
    async findByDealer(companyId, dealerId) {
        const orders = await this.prisma.order.findMany({
            where: { companyId, dealerId, deletedAt: null },
            orderBy: { createdAt: "desc" },
            include: {
                branch: { select: { name: true } },
            },
        });
        const productIdSet = new Set();
        for (const order of orders) {
            const items = order.items;
            if (Array.isArray(items)) {
                items.forEach((item) => {
                    if (item.productId)
                        productIdSet.add(item.productId);
                });
            }
        }
        const productMap = new Map();
        if (productIdSet.size > 0) {
            const products = await this.prisma.product.findMany({
                where: { id: { in: Array.from(productIdSet) }, companyId },
                select: { id: true, name: true, unit: true },
            });
            products.forEach((p) => productMap.set(p.id, p.name));
        }
        return orders.map((order) => {
            const rawItems = order.items;
            const items = Array.isArray(rawItems)
                ? rawItems.map((item) => ({
                    productId: item.productId ?? null,
                    name: item.name ||
                        (item.productId
                            ? (productMap.get(item.productId) ?? "Unknown")
                            : "Unknown"),
                    qty: item.qty ?? item.quantity ?? 1,
                    unit: item.unit ?? "pcs",
                    price: item.price ?? 0,
                    total: item.total ??
                        (item.qty ?? item.quantity ?? 1) * (item.price ?? 0),
                }))
                : [];
            return { ...order, items };
        });
    }
    async updateStatus(companyId, id, status, subStatus, actor) {
        const prev = await this.prisma.order.findFirst({
            where: { id, companyId },
            select: { id: true, dealerId: true, status: true, updatedAt: true },
        });
        if (!prev)
            throw new common_1.BadRequestException("Order not found");
        const order = await this.prisma.order.update({
            where: { id, companyId },
            data: { status: status, subStatus },
        });
        this.telegramService
            .sendOrderStatusUpdate(companyId, id, status, order.dealerId, subStatus)
            .catch(() => { });
        this.companyNotifier
            .notifyOrderStatusChanged(companyId, {
            orderId: id,
            oldStatus: String(prev.status),
            newStatus: String(status),
            editorId: actor?.id,
            editorPhone: actor?.phone,
            editorRole: actor?.roleType,
            changedAt: order.updatedAt,
        })
            .catch(() => { });
        return order;
    }
    async findOne(companyId, id) {
        const order = await this.prisma.order.findFirst({
            where: { id, companyId, deletedAt: null },
            include: {
                dealer: { select: { name: true, phone: true } },
                branch: { select: { name: true } },
            },
        });
        if (!order)
            return null;
        const rawItems = order.items;
        const productIdSet = new Set();
        if (Array.isArray(rawItems)) {
            rawItems.forEach((item) => {
                if (item.productId)
                    productIdSet.add(item.productId);
            });
        }
        const productMap = new Map();
        if (productIdSet.size > 0) {
            const products = await this.prisma.product.findMany({
                where: { id: { in: Array.from(productIdSet) }, companyId },
                select: { id: true, name: true, unit: true },
            });
            products.forEach((p) => productMap.set(p.id, p.name));
        }
        const items = Array.isArray(rawItems)
            ? rawItems.map((item) => ({
                productId: item.productId ?? null,
                name: item.name ||
                    (item.productId
                        ? (productMap.get(item.productId) ?? "Unknown")
                        : "Unknown"),
                qty: item.qty ?? item.quantity ?? 1,
                unit: item.unit ?? "pcs",
                price: item.price ?? 0,
                total: item.total ?? (item.qty ?? item.quantity ?? 1) * (item.price ?? 0),
            }))
            : [];
        return { ...order, items };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        telegram_service_1.TelegramService,
        company_notifier_service_1.CompanyNotifierService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map