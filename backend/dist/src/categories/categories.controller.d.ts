import { CategoriesService } from "./categories.service";
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(req: any): Promise<({
        subcategories: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            deletedBy: string | null;
            companyId: string;
            categoryId: string;
        }[];
        _count: {
            products: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
    })[]>;
    create(req: any, name: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
    }>;
    update(req: any, id: string, name: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
    }>;
    remove(req: any, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
    }>;
    restore(req: any, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
    }>;
    createSubcategory(req: any, categoryId: string, name: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        categoryId: string;
    }>;
    updateSubcategory(req: any, id: string, body: {
        name?: string;
        categoryId?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        categoryId: string;
    }>;
    removeSubcategory(req: any, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        categoryId: string;
    }>;
    restoreSubcategory(req: any, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        categoryId: string;
    }>;
}
