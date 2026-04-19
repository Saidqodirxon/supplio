import { ExpensesService } from "./expenses.service";
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    create(req: any, body: any): Promise<{
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
    findAll(req: any, branchId?: string): Promise<({
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
    getSummary(req: any): Promise<{
        total: number;
        byCategory: Record<string, number>;
    }>;
    remove(req: any, id: string): Promise<{
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
}
