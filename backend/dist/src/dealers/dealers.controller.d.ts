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
    findAll(req: AuthenticatedRequest): Promise<{
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
    getPendingApprovals(req: AuthenticatedRequest): Promise<({
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
    update(req: AuthenticatedRequest, id: string, body: any): Promise<{
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
    remove(req: AuthenticatedRequest, id: string): Promise<{
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
    approve(req: AuthenticatedRequest, id: string): Promise<{
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
    reject(req: AuthenticatedRequest, id: string): Promise<{
        success: boolean;
    }>;
    block(req: AuthenticatedRequest, id: string): Promise<{
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
    unblock(req: AuthenticatedRequest, id: string): Promise<{
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
}
export {};
