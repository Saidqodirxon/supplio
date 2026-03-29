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
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
        address: string | null;
        phone: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
        cashbackBalance: number;
    }>;
    findAll(req: AuthenticatedRequest): Promise<{
        currentDebt: number;
        status: string;
        branch: {
            name: string;
        };
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
        address: string | null;
        phone: string;
        branchId: string;
        creditLimit: number;
        telegramChatId: string | null;
        isApproved: boolean;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
        cashbackBalance: number;
    }[]>;
    getPendingApprovals(req: AuthenticatedRequest): Promise<({
        branch: {
            name: string;
        };
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
        address: string | null;
        phone: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
        cashbackBalance: number;
    })[]>;
    update(req: AuthenticatedRequest, id: string, body: any): Promise<{
        branch: {
            name: string;
        };
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
        address: string | null;
        phone: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
        cashbackBalance: number;
    }>;
    remove(req: AuthenticatedRequest, id: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
        address: string | null;
        phone: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
        cashbackBalance: number;
    }>;
    approve(req: AuthenticatedRequest, id: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
        address: string | null;
        phone: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
        cashbackBalance: number;
    }>;
    reject(req: AuthenticatedRequest, id: string): Promise<{
        success: boolean;
    }>;
    block(req: AuthenticatedRequest, id: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
        address: string | null;
        phone: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
        cashbackBalance: number;
    }>;
    unblock(req: AuthenticatedRequest, id: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
        address: string | null;
        phone: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        approvedAt: Date | null;
        approvedBy: string | null;
        isBlocked: boolean;
        cashbackBalance: number;
    }>;
}
export {};
