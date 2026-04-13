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
        address: string | null;
        phone: string;
        companyId: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
        isApproved: boolean;
        cashbackBalance: number;
        telegramChatId: string | null;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
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
        address: string | null;
        phone: string;
        companyId: string;
        branchId: string;
        creditLimit: number;
        isApproved: boolean;
        cashbackBalance: number;
        telegramChatId: string | null;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
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
        address: string | null;
        phone: string;
        companyId: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
        isApproved: boolean;
        cashbackBalance: number;
        telegramChatId: string | null;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
    })[]>;
    approveDealer(id: string, companyId: string, userId: string, creditLimit?: number): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        address: string | null;
        phone: string;
        companyId: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
        isApproved: boolean;
        cashbackBalance: number;
        telegramChatId: string | null;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
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
        address: string | null;
        phone: string;
        companyId: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
        isApproved: boolean;
        cashbackBalance: number;
        telegramChatId: string | null;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
    }>;
    block(id: string, companyId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        address: string | null;
        phone: string;
        companyId: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
        isApproved: boolean;
        cashbackBalance: number;
        telegramChatId: string | null;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
    }>;
    unblock(id: string, companyId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        address: string | null;
        phone: string;
        companyId: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
        isApproved: boolean;
        cashbackBalance: number;
        telegramChatId: string | null;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
    }>;
    remove(id: string, companyId: string, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        address: string | null;
        phone: string;
        companyId: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
        isApproved: boolean;
        cashbackBalance: number;
        telegramChatId: string | null;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
    }>;
    rejectDealer(id: string, companyId: string, userId: string): Promise<{
        success: boolean;
    }>;
}
