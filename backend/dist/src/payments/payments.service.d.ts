import { PrismaService } from "../prisma/prisma.service";
import { TelegramService } from "../telegram/telegram.service";
export declare class PaymentsService {
    private prisma;
    private telegram;
    constructor(prisma: PrismaService, telegram: TelegramService);
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
        dealerId: string;
        amount: number;
        note: string | null;
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
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        branchId: string | null;
        dealerId: string;
        amount: number;
        note: string | null;
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
