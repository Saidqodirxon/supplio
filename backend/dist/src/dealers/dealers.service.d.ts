import { PrismaService } from "../prisma/prisma.service";
import { PlanLimitsService } from "../common/services/plan-limits.service";
export declare class DealersService {
    private prisma;
    private planLimits;
    constructor(prisma: PrismaService, planLimits: PlanLimitsService);
    create(companyId: string, data: {
        name: string;
        phone: string;
        branchId: string;
        creditLimit?: number;
        address?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        address: string | null;
        phone: string;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
        cashbackBalance: number;
        branchId: string;
    }>;
    findAll(companyId: string, user: {
        roleType: string;
        branchId?: string | null;
    }): Promise<{
        currentDebt: number;
        status: string;
        branch: {
            name: string;
        };
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        address: string | null;
        phone: string;
        creditLimit: number;
        telegramChatId: string | null;
        isApproved: boolean;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
        cashbackBalance: number;
        branchId: string;
    }[]>;
    getPendingApprovals(companyId: string): Promise<({
        branch: {
            name: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        address: string | null;
        phone: string;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
        cashbackBalance: number;
        branchId: string;
    })[]>;
    approveDealer(id: string, companyId: string, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        address: string | null;
        phone: string;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
        cashbackBalance: number;
        branchId: string;
    }>;
    update(id: string, companyId: string, data: {
        name?: string;
        phone?: string;
        branchId?: string;
        creditLimit?: number;
        address?: string;
    }): Promise<{
        branch: {
            name: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        address: string | null;
        phone: string;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
        cashbackBalance: number;
        branchId: string;
    }>;
    block(id: string, companyId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        address: string | null;
        phone: string;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
        cashbackBalance: number;
        branchId: string;
    }>;
    unblock(id: string, companyId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        address: string | null;
        phone: string;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
        cashbackBalance: number;
        branchId: string;
    }>;
    remove(id: string, companyId: string, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        address: string | null;
        phone: string;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
        cashbackBalance: number;
        branchId: string;
    }>;
    rejectDealer(id: string, companyId: string, userId: string): Promise<{
        success: boolean;
    }>;
}
