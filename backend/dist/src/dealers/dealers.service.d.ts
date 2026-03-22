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
        updatedAt: Date;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        address: string | null;
        phone: string;
        companyId: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        isBlocked: boolean;
        cashbackBalance: number;
        approvedAt: Date | null;
        approvedBy: string | null;
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
        updatedAt: Date;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        address: string | null;
        phone: string;
        companyId: string;
        branchId: string;
        creditLimit: number;
        telegramChatId: string | null;
        isApproved: boolean;
        isBlocked: boolean;
        cashbackBalance: number;
        approvedAt: Date | null;
        approvedBy: string | null;
    }[]>;
    getPendingApprovals(companyId: string): Promise<({
        branch: {
            name: string;
        };
    } & {
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        address: string | null;
        phone: string;
        companyId: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        isBlocked: boolean;
        cashbackBalance: number;
        approvedAt: Date | null;
        approvedBy: string | null;
    })[]>;
    approveDealer(id: string, companyId: string, userId: string): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        address: string | null;
        phone: string;
        companyId: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        isBlocked: boolean;
        cashbackBalance: number;
        approvedAt: Date | null;
        approvedBy: string | null;
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
        updatedAt: Date;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        address: string | null;
        phone: string;
        companyId: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        isBlocked: boolean;
        cashbackBalance: number;
        approvedAt: Date | null;
        approvedBy: string | null;
    }>;
    block(id: string, companyId: string): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        address: string | null;
        phone: string;
        companyId: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        isBlocked: boolean;
        cashbackBalance: number;
        approvedAt: Date | null;
        approvedBy: string | null;
    }>;
    unblock(id: string, companyId: string): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        address: string | null;
        phone: string;
        companyId: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        isBlocked: boolean;
        cashbackBalance: number;
        approvedAt: Date | null;
        approvedBy: string | null;
    }>;
    remove(id: string, companyId: string, userId: string): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        address: string | null;
        phone: string;
        companyId: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        isBlocked: boolean;
        cashbackBalance: number;
        approvedAt: Date | null;
        approvedBy: string | null;
    }>;
    rejectDealer(id: string, companyId: string, userId: string): Promise<{
        success: boolean;
    }>;
}
