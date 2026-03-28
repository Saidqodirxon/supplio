import { PrismaService } from "../prisma/prisma.service";
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    createCategory(companyId: string, name: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
    }>;
    findAllCategories(companyId: string): Promise<({
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
    findOneCategory(id: string, companyId: string): Promise<{
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
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
    }>;
    updateCategory(id: string, companyId: string, name: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
    }>;
    removeCategory(id: string, companyId: string, deletedBy: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
    }>;
    restoreCategory(id: string, companyId: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
    }>;
    createSubcategory(companyId: string, categoryId: string, name: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
        categoryId: string;
    }>;
    updateSubcategory(id: string, companyId: string, data: {
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
    removeSubcategory(id: string, companyId: string, deletedBy: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
        categoryId: string;
    }>;
    restoreSubcategory(id: string, companyId: string): Promise<{
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
