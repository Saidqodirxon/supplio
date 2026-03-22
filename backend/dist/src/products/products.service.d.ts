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
        updatedAt: Date;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        categoryId: string | null;
        subcategoryId: string | null;
        unitId: string | null;
        sku: string | null;
        description: string | null;
        imageUrl: string | null;
        costPrice: number;
        price: number;
        discountPrice: number | null;
        isPromo: boolean;
        stock: number;
        unit: string;
        isActive: boolean;
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
            updatedAt: Date;
            name: string;
            createdAt: Date;
            deletedAt: Date | null;
            deletedBy: string | null;
            companyId: string;
            categoryId: string | null;
            subcategoryId: string | null;
            unitId: string | null;
            sku: string | null;
            description: string | null;
            imageUrl: string | null;
            costPrice: number;
            price: number;
            discountPrice: number | null;
            isPromo: boolean;
            stock: number;
            unit: string;
            isActive: boolean;
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
        updatedAt: Date;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        categoryId: string | null;
        subcategoryId: string | null;
        unitId: string | null;
        sku: string | null;
        description: string | null;
        imageUrl: string | null;
        costPrice: number;
        price: number;
        discountPrice: number | null;
        isPromo: boolean;
        stock: number;
        unit: string;
        isActive: boolean;
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
        updatedAt: Date;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        categoryId: string | null;
        subcategoryId: string | null;
        unitId: string | null;
        sku: string | null;
        description: string | null;
        imageUrl: string | null;
        costPrice: number;
        price: number;
        discountPrice: number | null;
        isPromo: boolean;
        stock: number;
        unit: string;
        isActive: boolean;
    }>;
    updateStock(id: string, companyId: string, stock: number): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        categoryId: string | null;
        subcategoryId: string | null;
        unitId: string | null;
        sku: string | null;
        description: string | null;
        imageUrl: string | null;
        costPrice: number;
        price: number;
        discountPrice: number | null;
        isPromo: boolean;
        stock: number;
        unit: string;
        isActive: boolean;
    }>;
    remove(id: string, companyId: string, deletedBy: string): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        categoryId: string | null;
        subcategoryId: string | null;
        unitId: string | null;
        sku: string | null;
        description: string | null;
        imageUrl: string | null;
        costPrice: number;
        price: number;
        discountPrice: number | null;
        isPromo: boolean;
        stock: number;
        unit: string;
        isActive: boolean;
    }>;
    restore(id: string, companyId: string): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        categoryId: string | null;
        subcategoryId: string | null;
        unitId: string | null;
        sku: string | null;
        description: string | null;
        imageUrl: string | null;
        costPrice: number;
        price: number;
        discountPrice: number | null;
        isPromo: boolean;
        stock: number;
        unit: string;
        isActive: boolean;
    }>;
    getStats(companyId: string): Promise<{
        totalCount: number;
        activeCount: number;
        inventoryValue: number;
        totalRevenuePotential: number;
        avgMargin: number;
    }>;
}
