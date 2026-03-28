import { DealersService } from "./dealers.service";
import { Request } from "express";
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        phone: string;
        companyId: string;
        branchId?: string | null;
        roleType: string;
    };
    companyId: string;
}
export declare class DealersController {
    private readonly dealersService;
    constructor(dealersService: DealersService);
    create(req: AuthenticatedRequest, body: any): Promise<{
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
    findAll(req: AuthenticatedRequest): Promise<{
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
    getPendingApprovals(req: AuthenticatedRequest): Promise<({
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
    update(req: AuthenticatedRequest, id: string, body: any): Promise<{
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
    remove(req: AuthenticatedRequest, id: string): Promise<{
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
    approve(req: AuthenticatedRequest, id: string): Promise<{
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
    reject(req: AuthenticatedRequest, id: string): Promise<{
        success: boolean;
    }>;
    block(req: AuthenticatedRequest, id: string): Promise<{
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
    unblock(req: AuthenticatedRequest, id: string): Promise<{
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
}
export {};
