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
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        description: string | null;
        deletedBy: string | null;
        branchId: string | null;
        category: string;
        amount: number;
    }>;
    findAll(companyId: string, branchId?: string): Promise<({
        branch: {
            name: string;
        };
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        description: string | null;
        deletedBy: string | null;
        branchId: string | null;
        category: string;
        amount: number;
    })[]>;
    findOne(id: string, companyId: string): Promise<{
        branch: {
            name: string;
        };
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        description: string | null;
        deletedBy: string | null;
        branchId: string | null;
        category: string;
        amount: number;
    }>;
    remove(id: string, companyId: string, deletedBy: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        description: string | null;
        deletedBy: string | null;
        branchId: string | null;
        category: string;
        amount: number;
    }>;
    getSummary(companyId: string): Promise<{
        total: number;
        byCategory: Record<string, number>;
    }>;
}
