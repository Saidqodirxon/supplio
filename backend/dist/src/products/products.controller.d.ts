import { ProductsService, ProductQuery } from "./products.service";
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(req: any, body: any): Promise<{
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
    findAll(req: any, query: ProductQuery): Promise<{
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
    getStats(req: any): Promise<{
        totalCount: number;
        activeCount: number;
        inventoryValue: number;
        totalRevenuePotential: number;
        avgMargin: number;
    }>;
    findOne(req: any, id: string): Promise<{
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
    update(req: any, id: string, body: any): Promise<{
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
    updateStock(req: any, id: string, stock: number): Promise<{
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
    restore(req: any, id: string): Promise<{
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
    remove(req: any, id: string): Promise<{
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
}
