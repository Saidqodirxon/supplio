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
        unit: string;
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        name: string;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        price: number;
        sku: string | null;
        imageUrl: string | null;
        costPrice: number;
        discountPrice: number | null;
        isPromo: boolean;
        stock: number;
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
            unit: string;
            deletedAt: Date | null;
            id: string;
            createdAt: Date;
            deletedBy: string | null;
            companyId: string;
            name: string;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
            price: number;
            sku: string | null;
            imageUrl: string | null;
            costPrice: number;
            discountPrice: number | null;
            isPromo: boolean;
            stock: number;
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
        unit: string;
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        name: string;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        price: number;
        sku: string | null;
        imageUrl: string | null;
        costPrice: number;
        discountPrice: number | null;
        isPromo: boolean;
        stock: number;
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
        unit: string;
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        name: string;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        price: number;
        sku: string | null;
        imageUrl: string | null;
        costPrice: number;
        discountPrice: number | null;
        isPromo: boolean;
        stock: number;
        categoryId: string | null;
        subcategoryId: string | null;
        unitId: string | null;
    }>;
    updateStock(req: any, id: string, stock: number): Promise<{
        unit: string;
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        name: string;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        price: number;
        sku: string | null;
        imageUrl: string | null;
        costPrice: number;
        discountPrice: number | null;
        isPromo: boolean;
        stock: number;
        categoryId: string | null;
        subcategoryId: string | null;
        unitId: string | null;
    }>;
    restore(req: any, id: string): Promise<{
        unit: string;
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        name: string;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        price: number;
        sku: string | null;
        imageUrl: string | null;
        costPrice: number;
        discountPrice: number | null;
        isPromo: boolean;
        stock: number;
        categoryId: string | null;
        subcategoryId: string | null;
        unitId: string | null;
    }>;
    remove(req: any, id: string): Promise<{
        unit: string;
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        name: string;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        price: number;
        sku: string | null;
        imageUrl: string | null;
        costPrice: number;
        discountPrice: number | null;
        isPromo: boolean;
        stock: number;
        categoryId: string | null;
        subcategoryId: string | null;
        unitId: string | null;
    }>;
}
