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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCategory(companyId, name) {
        return this.prisma.category.create({
            data: { companyId, name },
        });
    }
    async findAllCategories(companyId) {
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
    async findOneCategory(id, companyId) {
        const cat = await this.prisma.category.findFirst({
            where: { id, companyId, deletedAt: null },
            include: {
                subcategories: { where: { deletedAt: null }, orderBy: { name: "asc" } },
            },
        });
        if (!cat)
            throw new common_1.NotFoundException("Category not found");
        return cat;
    }
    async updateCategory(id, companyId, name) {
        await this.findOneCategory(id, companyId);
        return this.prisma.category.update({ where: { id }, data: { name } });
    }
    async removeCategory(id, companyId, deletedBy) {
        await this.findOneCategory(id, companyId);
        return this.prisma.category.update({
            where: { id },
            data: { deletedAt: new Date(), deletedBy },
        });
    }
    async restoreCategory(id, companyId) {
        return this.prisma.category.update({
            where: { id },
            data: { deletedAt: null, deletedBy: null },
        });
    }
    async createSubcategory(companyId, categoryId, name) {
        await this.findOneCategory(categoryId, companyId);
        return this.prisma.subcategory.create({
            data: { companyId, categoryId, name },
        });
    }
    async updateSubcategory(id, companyId, data) {
        const sub = await this.prisma.subcategory.findFirst({
            where: { id, companyId, deletedAt: null },
        });
        if (!sub)
            throw new common_1.NotFoundException("Subcategory not found");
        return this.prisma.subcategory.update({ where: { id }, data });
    }
    async removeSubcategory(id, companyId, deletedBy) {
        const sub = await this.prisma.subcategory.findFirst({
            where: { id, companyId, deletedAt: null },
        });
        if (!sub)
            throw new common_1.NotFoundException("Subcategory not found");
        return this.prisma.subcategory.update({
            where: { id },
            data: { deletedAt: new Date(), deletedBy },
        });
    }
    async restoreSubcategory(id, companyId) {
        return this.prisma.subcategory.update({
            where: { id },
            data: { deletedAt: null, deletedBy: null },
        });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map