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
    updateStock(req: any, id: string, stock: number): Promise<{
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
    restore(req: any, id: string): Promise<{
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
    remove(req: any, id: string): Promise<{
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
}
