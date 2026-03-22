import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PlanLimitsService } from "../common/services/plan-limits.service";

export interface ProductQuery {
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  unitId?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: string | number;
  limit?: string | number;
}

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private planLimits: PlanLimitsService
  ) {}

  async create(
    companyId: string,
    data: {
      name: string;
      price: number;
      costPrice?: number;
      stock?: number;
      sku?: string;
      description?: string;
      imageUrl?: string;
      unit?: string;
      unitId?: string;
      categoryId?: string;
      subcategoryId?: string;
      isActive?: boolean;
    }
  ) {
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

  async findAll(companyId: string, query: ProductQuery = {}) {
    const {
      search,
      categoryId,
      subcategoryId,
      unitId,
      isActive,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(200, Math.max(1, Number(query.limit ?? 50)));

    const where: Record<string, unknown> = { companyId, deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (subcategoryId) where.subcategoryId = subcategoryId;
    if (unitId) where.unitId = unitId;
    if (isActive !== undefined) where.isActive = isActive === "true";

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

  async findOne(id: string, companyId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
        unitRef: { select: { id: true, name: true, symbol: true } },
      },
    });
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  async update(id: string, companyId: string, data: Record<string, unknown>) {
    await this.findOne(id, companyId);
    const updateData: Record<string, unknown> = { ...data };
    if (updateData.categoryId === "") updateData.categoryId = null;
    if (updateData.subcategoryId === "") updateData.subcategoryId = null;
    if (updateData.unitId === "") updateData.unitId = null;
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.costPrice !== undefined) updateData.costPrice = Number(updateData.costPrice);
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);

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

  async updateStock(id: string, companyId: string, stock: number) {
    await this.findOne(id, companyId);
    return this.prisma.product.update({ where: { id }, data: { stock: Number(stock) } });
  }

  async remove(id: string, companyId: string, deletedBy: string) {
    await this.findOne(id, companyId);
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }

  async restore(id: string, companyId: string) {
    const product = await this.prisma.product.findFirst({ where: { id, companyId } });
    if (!product) throw new NotFoundException("Product not found");
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null },
    });
  }

  async getStats(companyId: string) {
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
    const avgMargin =
      products.length > 0
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
}
