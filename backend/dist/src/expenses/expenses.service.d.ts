import { PrismaService } from "../prisma/prisma.service";
export declare class ExpensesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(companyId: string, data: {
        amount: number;
        category: string;
        description?: string;
        branchId?: string;
    }): Promise<{
        branch: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        branchId: string | null;
        category: string;
        description: string | null;
        amount: number;
    }>;
    findAll(companyId: string, branchId?: string): Promise<({
        branch: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        branchId: string | null;
        category: string;
        description: string | null;
        amount: number;
    })[]>;
    findOne(id: string, companyId: string): Promise<{
        branch: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        branchId: string | null;
        category: string;
        description: string | null;
        amount: number;
    }>;
    remove(id: string, companyId: string, deletedBy: string): Promise<{
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        branchId: string | null;
        category: string;
        description: string | null;
        amount: number;
    }>;
    getSummary(companyId: string): Promise<{
        total: number;
        byCategory: Record<string, number>;
    }>;
}
