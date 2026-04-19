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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        sku: string | null;
        description: string | null;
        costPrice: number;
        price: number;
        stock: number;
        unit: string;
        categoryId: string | null;
        imageUrl: string | null;
        isActive: boolean;
        subcategoryId: string | null;
        unitId: string | null;
        discountPrice: number | null;
        isPromo: boolean;
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
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            deletedBy: string | null;
            companyId: string;
            sku: string | null;
            description: string | null;
            costPrice: number;
            price: number;
            stock: number;
            unit: string;
            categoryId: string | null;
            imageUrl: string | null;
            isActive: boolean;
            subcategoryId: string | null;
            unitId: string | null;
            discountPrice: number | null;
            isPromo: boolean;
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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        sku: string | null;
        description: string | null;
        costPrice: number;
        price: number;
        stock: number;
        unit: string;
        categoryId: string | null;
        imageUrl: string | null;
        isActive: boolean;
        subcategoryId: string | null;
        unitId: string | null;
        discountPrice: number | null;
        isPromo: boolean;
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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        sku: string | null;
        description: string | null;
        costPrice: number;
        price: number;
        stock: number;
        unit: string;
        categoryId: string | null;
        imageUrl: string | null;
        isActive: boolean;
        subcategoryId: string | null;
        unitId: string | null;
        discountPrice: number | null;
        isPromo: boolean;
    }>;
    updateStock(id: string, companyId: string, stock: number): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        sku: string | null;
        description: string | null;
        costPrice: number;
        price: number;
        stock: number;
        unit: string;
        categoryId: string | null;
        imageUrl: string | null;
        isActive: boolean;
        subcategoryId: string | null;
        unitId: string | null;
        discountPrice: number | null;
        isPromo: boolean;
    }>;
    adjustStock(id: string, companyId: string, delta: number, _note?: string): Promise<{
        category: {
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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        sku: string | null;
        description: string | null;
        costPrice: number;
        price: number;
        stock: number;
        unit: string;
        categoryId: string | null;
        imageUrl: string | null;
        isActive: boolean;
        subcategoryId: string | null;
        unitId: string | null;
        discountPrice: number | null;
        isPromo: boolean;
    }>;
    remove(id: string, companyId: string, deletedBy: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        sku: string | null;
        description: string | null;
        costPrice: number;
        price: number;
        stock: number;
        unit: string;
        categoryId: string | null;
        imageUrl: string | null;
        isActive: boolean;
        subcategoryId: string | null;
        unitId: string | null;
        discountPrice: number | null;
        isPromo: boolean;
    }>;
    restore(id: string, companyId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        sku: string | null;
        description: string | null;
        costPrice: number;
        price: number;
        stock: number;
        unit: string;
        categoryId: string | null;
        imageUrl: string | null;
        isActive: boolean;
        subcategoryId: string | null;
        unitId: string | null;
        discountPrice: number | null;
        isPromo: boolean;
    }>;
    getStats(companyId: string): Promise<{
        totalCount: number;
        activeCount: number;
        inventoryValue: number;
        totalRevenuePotential: number;
        avgMargin: number;
    }>;
}
