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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        isActive: boolean;
        sku: string | null;
        description: string | null;
        costPrice: number;
        price: number;
        stock: number;
        unit: string;
        categoryId: string | null;
        imageUrl: string | null;
        subcategoryId: string | null;
        unitId: string | null;
        discountPrice: number | null;
        isPromo: boolean;
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
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            deletedBy: string | null;
            companyId: string;
            isActive: boolean;
            sku: string | null;
            description: string | null;
            costPrice: number;
            price: number;
            stock: number;
            unit: string;
            categoryId: string | null;
            imageUrl: string | null;
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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        isActive: boolean;
        sku: string | null;
        description: string | null;
        costPrice: number;
        price: number;
        stock: number;
        unit: string;
        categoryId: string | null;
        imageUrl: string | null;
        subcategoryId: string | null;
        unitId: string | null;
        discountPrice: number | null;
        isPromo: boolean;
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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        isActive: boolean;
        sku: string | null;
        description: string | null;
        costPrice: number;
        price: number;
        stock: number;
        unit: string;
        categoryId: string | null;
        imageUrl: string | null;
        subcategoryId: string | null;
        unitId: string | null;
        discountPrice: number | null;
        isPromo: boolean;
    }>;
    updateStock(req: any, id: string, stock: number): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        isActive: boolean;
        sku: string | null;
        description: string | null;
        costPrice: number;
        price: number;
        stock: number;
        unit: string;
        categoryId: string | null;
        imageUrl: string | null;
        subcategoryId: string | null;
        unitId: string | null;
        discountPrice: number | null;
        isPromo: boolean;
    }>;
    restore(req: any, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        isActive: boolean;
        sku: string | null;
        description: string | null;
        costPrice: number;
        price: number;
        stock: number;
        unit: string;
        categoryId: string | null;
        imageUrl: string | null;
        subcategoryId: string | null;
        unitId: string | null;
        discountPrice: number | null;
        isPromo: boolean;
    }>;
    remove(req: any, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        isActive: boolean;
        sku: string | null;
        description: string | null;
        costPrice: number;
        price: number;
        stock: number;
        unit: string;
        categoryId: string | null;
        imageUrl: string | null;
        subcategoryId: string | null;
        unitId: string | null;
        discountPrice: number | null;
        isPromo: boolean;
    }>;
}
