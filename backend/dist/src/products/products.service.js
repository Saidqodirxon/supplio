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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const plan_limits_service_1 = require("../common/services/plan-limits.service");
let ProductsService = class ProductsService {
    constructor(prisma, planLimits) {
        this.prisma = prisma;
        this.planLimits = planLimits;
    }
    async create(companyId, data) {
        await this.planLimits.checkProductLimit(companyId);
        return this.prisma.product.create({
            data: {
                companyId,
                name: data.name,
                price: Number(data.price),
                costPrice: Number(data.costPrice ?? 0),
                stock: Number(data.stock ?? 0),
                sku: data.sku,
                description: data.description,
                imageUrl: data.imageUrl,
                unit: data.unit ?? "pcs",
                unitId: data.unitId || null,
                categoryId: data.categoryId || null,
                subcategoryId: data.subcategoryId || null,
                isActive: data.isActive ?? true,
            },
            include: {
                category: { select: { id: true, name: true } },
                subcategory: { select: { id: true, name: true } },
                unitRef: { select: { id: true, name: true, symbol: true } },
            },
        });
    }
    async findAll(companyId, query = {}) {
        const { search, categoryId, subcategoryId, unitId, isActive, sortBy = "createdAt", sortOrder = "desc", } = query;
        const page = Math.max(1, Number(query.page ?? 1));
        const limit = Math.min(200, Math.max(1, Number(query.limit ?? 50)));
        const where = { companyId, deletedAt: null };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }
        if (categoryId)
            where.categoryId = categoryId;
        if (subcategoryId)
            where.subcategoryId = subcategoryId;
        if (unitId)
            where.unitId = unitId;
        if (isActive !== undefined)
            where.isActive = isActive === "true";
        const validSortFields = [
            "name", "price", "costPrice", "stock", "createdAt", "updatedAt",
        ];
        const orderField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
        const [items, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                orderBy: { [orderField]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    category: { select: { id: true, name: true } },
                    subcategory: { select: { id: true, name: true } },
                    unitRef: { select: { id: true, name: true, symbol: true } },
                },
            }),
            this.prisma.product.count({ where }),
        ]);
        return { items, total, page, limit, pages: Math.ceil(total / limit) };
    }
    async findOne(id, companyId) {
        const product = await this.prisma.product.findFirst({
            where: { id, companyId, deletedAt: null },
            include: {
                category: { select: { id: true, name: true } },
                subcategory: { select: { id: true, name: true } },
                unitRef: { select: { id: true, name: true, symbol: true } },
            },
        });
        if (!product)
            throw new common_1.NotFoundException("Product not found");
        return product;
    }
    async update(id, companyId, data) {
        await this.findOne(id, companyId);
        const updateData = { ...data };
        if (updateData.categoryId === "")
            updateData.categoryId = null;
        if (updateData.subcategoryId === "")
            updateData.subcategoryId = null;
        if (updateData.unitId === "")
            updateData.unitId = null;
        if (updateData.price !== undefined)
            updateData.price = Number(updateData.price);
        if (updateData.costPrice !== undefined)
            updateData.costPrice = Number(updateData.costPrice);
        if (updateData.stock !== undefined)
            updateData.stock = Number(updateData.stock);
        return this.prisma.product.update({
            where: { id },
            data: updateData,
            include: {
                category: { select: { id: true, name: true } },
                subcategory: { select: { id: true, name: true } },
                unitRef: { select: { id: true, name: true, symbol: true } },
            },
        });
    }
    async updateStock(id, companyId, stock) {
        await this.findOne(id, companyId);
        return this.prisma.product.update({ where: { id }, data: { stock: Number(stock) } });
    }
    async remove(id, companyId, deletedBy) {
        await this.findOne(id, companyId);
        return this.prisma.product.update({
            where: { id },
            data: { deletedAt: new Date(), deletedBy },
        });
    }
    async restore(id, companyId) {
        const product = await this.prisma.product.findFirst({ where: { id, companyId } });
        if (!product)
            throw new common_1.NotFoundException("Product not found");
        return this.prisma.product.update({
            where: { id },
            data: { deletedAt: null, deletedBy: null },
        });
    }
    async getStats(companyId) {
        const [totalCount, activeCount, products] = await Promise.all([
            this.prisma.product.count({ where: { companyId, deletedAt: null } }),
            this.prisma.product.count({ where: { companyId, deletedAt: null, isActive: true } }),
            this.prisma.product.findMany({
                where: { companyId, deletedAt: null },
                select: { price: true, costPrice: true, stock: true },
            }),
        ]);
        const inventoryValue = products.reduce((acc, p) => acc + p.costPrice * p.stock, 0);
        const totalRevenuePotential = products.reduce((acc, p) => acc + p.price * p.stock, 0);
        const avgMargin = products.length > 0
            ? products.reduce((acc, p) => {
                const margin = p.price > 0 ? ((p.price - p.costPrice) / p.price) * 100 : 0;
                return acc + margin;
            }, 0) / products.length
            : 0;
        return {
            totalCount,
            activeCount,
            inventoryValue,
            totalRevenuePotential,
            avgMargin: Math.round(avgMargin * 10) / 10,
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        plan_limits_service_1.PlanLimitsService])
], ProductsService);
//# sourceMappingURL=products.service.js.map