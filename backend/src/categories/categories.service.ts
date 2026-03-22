import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // ── Categories ────────────────────────────────────────────────────────────

  async createCategory(companyId: string, name: string) {
    return this.prisma.category.create({
      data: { companyId, name },
    });
  }

  async findAllCategories(companyId: string) {
    return this.prisma.category.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { name: "asc" },
      include: {
        subcategories: {
          where: { deletedAt: null },
          orderBy: { name: "asc" },
        },
        _count: { select: { products: { where: { deletedAt: null } } } },
      },
    });
  }

  async findOneCategory(id: string, companyId: string) {
    const cat = await this.prisma.category.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        subcategories: { where: { deletedAt: null }, orderBy: { name: "asc" } },
      },
    });
    if (!cat) throw new NotFoundException("Category not found");
    return cat;
  }

  async updateCategory(id: string, companyId: string, name: string) {
    await this.findOneCategory(id, companyId);
    return this.prisma.category.update({ where: { id }, data: { name } });
  }

  async removeCategory(id: string, companyId: string, deletedBy: string) {
    await this.findOneCategory(id, companyId);
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }

  async restoreCategory(id: string, companyId: string) {
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null },
    });
  }

  // ── Subcategories ────────────────────────────────────────────────────────

  async createSubcategory(companyId: string, categoryId: string, name: string) {
    await this.findOneCategory(categoryId, companyId);
    return this.prisma.subcategory.create({
      data: { companyId, categoryId, name },
    });
  }

  async updateSubcategory(
    id: string,
    companyId: string,
    data: { name?: string; categoryId?: string }
  ) {
    const sub = await this.prisma.subcategory.findFirst({
      where: { id, companyId, deletedAt: null },
    });
    if (!sub) throw new NotFoundException("Subcategory not found");
    return this.prisma.subcategory.update({ where: { id }, data });
  }

  async removeSubcategory(id: string, companyId: string, deletedBy: string) {
    const sub = await this.prisma.subcategory.findFirst({
      where: { id, companyId, deletedAt: null },
    });
    if (!sub) throw new NotFoundException("Subcategory not found");
    return this.prisma.subcategory.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }

  async restoreSubcategory(id: string, companyId: string) {
    return this.prisma.subcategory.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null },
    });
  }
}
