import { PrismaService } from "../prisma/prisma.service";
export declare class PaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(companyId: string, data: {
        dealerId: string;
        amount: number;
        method: string;
        reference?: string;
        note?: string;
        branchId?: string;
    }): Promise<{
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
    createAdjustment(companyId: string, data: {
        dealerId: string;
        amount: number;
        note: string;
        branchId?: string;
    }): Promise<{
        success: boolean;
        amount: number;
        note: string;
    }>;
    findAll(companyId: string): Promise<({
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
    getDealerDebt(companyId: string, dealerId: string): Promise<{
        dealerId: string;
        name: string;
        totalOrders: number;
        totalPaid: number;
        debt: number;
        creditLimit: number;
    }>;
}
