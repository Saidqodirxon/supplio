import { ExpensesService } from "./expenses.service";
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    create(req: any, body: any): Promise<{
        branch: {
            name: string;
        };
    } & {
        category: string;
        deletedAt: Date | null;
        id: string;
        amount: number;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        branchId: string | null;
        description: string | null;
    }>;
    findAll(req: any, branchId?: string): Promise<({
        branch: {
            name: string;
        };
    } & {
        category: string;
        deletedAt: Date | null;
        id: string;
        amount: number;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        branchId: string | null;
        description: string | null;
    })[]>;
    getSummary(req: any): Promise<{
        total: number;
        byCategory: Record<string, number>;
    }>;
    remove(req: any, id: string): Promise<{
        category: string;
        deletedAt: Date | null;
        id: string;
        amount: number;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        branchId: string | null;
        description: string | null;
    }>;
}
