import { CategoriesService } from "./categories.service";
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(req: any): Promise<({
        _count: {
            products: number;
        };
        subcategories: {
            deletedAt: Date | null;
            id: string;
            createdAt: Date;
            deletedBy: string | null;
            companyId: string;
            name: string;
            updatedAt: Date;
            categoryId: string;
        }[];
    } & {
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        name: string;
        updatedAt: Date;
    })[]>;
    create(req: any, name: string): Promise<{
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        name: string;
        updatedAt: Date;
    }>;
    update(req: any, id: string, name: string): Promise<{
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        name: string;
        updatedAt: Date;
    }>;
    remove(req: any, id: string): Promise<{
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        name: string;
        updatedAt: Date;
    }>;
    restore(req: any, id: string): Promise<{
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        name: string;
        updatedAt: Date;
    }>;
    createSubcategory(req: any, categoryId: string, name: string): Promise<{
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        name: string;
        updatedAt: Date;
        categoryId: string;
    }>;
    updateSubcategory(req: any, id: string, body: {
        name?: string;
        categoryId?: string;
    }): Promise<{
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        name: string;
        updatedAt: Date;
        categoryId: string;
    }>;
    removeSubcategory(req: any, id: string): Promise<{
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        name: string;
        updatedAt: Date;
        categoryId: string;
    }>;
    restoreSubcategory(req: any, id: string): Promise<{
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        name: string;
        updatedAt: Date;
        categoryId: string;
    }>;
}
