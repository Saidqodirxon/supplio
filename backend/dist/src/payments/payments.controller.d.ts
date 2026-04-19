import { PaymentsService } from "./payments.service";
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(req: any, body: any): Promise<{
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        note: string | null;
        dealerId: string;
        branchId: string | null;
        amount: number;
        method: string;
        reference: string | null;
    }>;
    createAdjustment(req: any, body: any): Promise<{
        success: boolean;
        amount: number;
        note: string;
    }>;
    findAll(req: any): Promise<({
        branch: {
            name: string;
        };
        dealer: {
            name: string;
            phone: string;
        };
    } & {
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        note: string | null;
        dealerId: string;
        branchId: string | null;
        amount: number;
        method: string;
        reference: string | null;
    })[]>;
    getDealerDebt(req: any, dealerId: string): Promise<{
        dealerId: string;
        name: string;
        totalOrders: number;
        totalPaid: number;
        debt: number;
        creditLimit: number;
    }>;
}
