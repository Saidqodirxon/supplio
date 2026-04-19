import { CategoriesService } from "./categories.service";
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(req: any): Promise<({
        subcategories: {
            id: string;
            companyId: string;
            createdAt: Date;
            deletedAt: Date | null;
            name: string;
            updatedAt: Date;
            deletedBy: string | null;
            categoryId: string;
        }[];
        _count: {
            products: number;
        };
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
    })[]>;
    create(req: any, name: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
    }>;
    update(req: any, id: string, name: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
    }>;
    remove(req: any, id: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
    }>;
    restore(req: any, id: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
    }>;
    createSubcategory(req: any, categoryId: string, name: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
        categoryId: string;
    }>;
    updateSubcategory(req: any, id: string, body: {
        name?: string;
        categoryId?: string;
    }): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
        categoryId: string;
    }>;
    removeSubcategory(req: any, id: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
        categoryId: string;
    }>;
    restoreSubcategory(req: any, id: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
        categoryId: string;
    }>;
}
