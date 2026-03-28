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
export declare class ProductsService {
    private prisma;
    private planLimits;
    constructor(prisma: PrismaService, planLimits: PlanLimitsService);
    create(companyId: string, data: {
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
    }): Promise<{
        category: {
            id: string;
            name: string;
        };
        subcategory: {
            id: string;
            name: string;
        };
        unitRef: {
            symbol: string;
            id: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        sku: string | null;
        description: string | null;
        costPrice: number;
        price: number;
        stock: number;
        unit: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        imageUrl: string | null;
        isActive: boolean;
        discountPrice: number | null;
        isPromo: boolean;
        companyId: string;
        categoryId: string | null;
        subcategoryId: string | null;
        unitId: string | null;
    }>;
    findAll(companyId: string, query?: ProductQuery): Promise<{
        items: ({
            category: {
                id: string;
                name: string;
            };
            subcategory: {
                id: string;
                name: string;
            };
            unitRef: {
                symbol: string;
                id: string;
                name: string;
            };
        } & {
            id: string;
            name: string;
            sku: string | null;
            description: string | null;
            costPrice: number;
            price: number;
            stock: number;
            unit: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            deletedBy: string | null;
            imageUrl: string | null;
            isActive: boolean;
            discountPrice: number | null;
            isPromo: boolean;
            companyId: string;
            categoryId: string | null;
            subcategoryId: string | null;
            unitId: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    findOne(id: string, companyId: string): Promise<{
        category: {
            id: string;
            name: string;
        };
        subcategory: {
            id: string;
            name: string;
        };
        unitRef: {
            symbol: string;
            id: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        sku: string | null;
        description: string | null;
        costPrice: number;
        price: number;
        stock: number;
        unit: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        imageUrl: string | null;
        isActive: boolean;
        discountPrice: number | null;
        isPromo: boolean;
        companyId: string;
        categoryId: string | null;
        subcategoryId: string | null;
        unitId: string | null;
    }>;
    update(id: string, companyId: string, data: Record<string, unknown>): Promise<{
        category: {
            id: string;
            name: string;
        };
        subcategory: {
            id: string;
            name: string;
        };
        unitRef: {
            symbol: string;
            id: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        sku: string | null;
        description: string | null;
        costPrice: number;
        price: number;
        stock: number;
        unit: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        imageUrl: string | null;
        isActive: boolean;
        discountPrice: number | null;
        isPromo: boolean;
        companyId: string;
        categoryId: string | null;
        subcategoryId: string | null;
        unitId: string | null;
    }>;
    updateStock(id: string, companyId: string, stock: number): Promise<{
        id: string;
        name: string;
        sku: string | null;
        description: string | null;
        costPrice: number;
        price: number;
        stock: number;
        unit: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        imageUrl: string | null;
        isActive: boolean;
        discountPrice: number | null;
        isPromo: boolean;
        companyId: string;
        categoryId: string | null;
        subcategoryId: string | null;
        unitId: string | null;
    }>;
    remove(id: string, companyId: string, deletedBy: string): Promise<{
        id: string;
        name: string;
        sku: string | null;
        description: string | null;
        costPrice: number;
        price: number;
        stock: number;
        unit: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        imageUrl: string | null;
        isActive: boolean;
        discountPrice: number | null;
        isPromo: boolean;
        companyId: string;
        categoryId: string | null;
        subcategoryId: string | null;
        unitId: string | null;
    }>;
    restore(id: string, companyId: string): Promise<{
        id: string;
        name: string;
        sku: string | null;
        description: string | null;
        costPrice: number;
        price: number;
        stock: number;
        unit: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        imageUrl: string | null;
        isActive: boolean;
        discountPrice: number | null;
        isPromo: boolean;
        companyId: string;
        categoryId: string | null;
        subcategoryId: string | null;
        unitId: string | null;
    }>;
    getStats(companyId: string): Promise<{
        totalCount: number;
        activeCount: number;
        inventoryValue: number;
        totalRevenuePotential: number;
        avgMargin: number;
    }>;
}
