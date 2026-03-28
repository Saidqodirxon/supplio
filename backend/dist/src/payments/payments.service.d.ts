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
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        branchId: string | null;
        note: string | null;
        dealerId: string;
        amount: number;
        reference: string | null;
        method: string;
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
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        branchId: string | null;
        note: string | null;
        dealerId: string;
        amount: number;
        reference: string | null;
        method: string;
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
