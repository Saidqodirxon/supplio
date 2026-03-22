import { PaymentsService } from "./payments.service";
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(req: any, body: any): Promise<{
        deletedAt: Date | null;
        method: string;
        id: string;
        amount: number;
        reference: string | null;
        note: string | null;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        branchId: string | null;
        dealerId: string;
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
            phone: string;
            name: string;
        };
    } & {
        deletedAt: Date | null;
        method: string;
        id: string;
        amount: number;
        reference: string | null;
        note: string | null;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        branchId: string | null;
        dealerId: string;
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
