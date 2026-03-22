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
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        branchId: string;
        phone: string;
        name: string;
        address: string | null;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        isBlocked: boolean;
        cashbackBalance: number;
        approvedAt: Date | null;
        approvedBy: string | null;
        updatedAt: Date;
    }>;
    findAll(req: AuthenticatedRequest): Promise<{
        currentDebt: number;
        status: string;
        branch: {
            name: string;
        };
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        branchId: string;
        phone: string;
        name: string;
        address: string | null;
        creditLimit: number;
        telegramChatId: string | null;
        isApproved: boolean;
        isBlocked: boolean;
        cashbackBalance: number;
        approvedAt: Date | null;
        approvedBy: string | null;
        updatedAt: Date;
    }[]>;
    getPendingApprovals(req: AuthenticatedRequest): Promise<({
        branch: {
            name: string;
        };
    } & {
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        branchId: string;
        phone: string;
        name: string;
        address: string | null;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        isBlocked: boolean;
        cashbackBalance: number;
        approvedAt: Date | null;
        approvedBy: string | null;
        updatedAt: Date;
    })[]>;
    update(req: AuthenticatedRequest, id: string, body: any): Promise<{
        branch: {
            name: string;
        };
    } & {
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        branchId: string;
        phone: string;
        name: string;
        address: string | null;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        isBlocked: boolean;
        cashbackBalance: number;
        approvedAt: Date | null;
        approvedBy: string | null;
        updatedAt: Date;
    }>;
    remove(req: AuthenticatedRequest, id: string): Promise<{
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        branchId: string;
        phone: string;
        name: string;
        address: string | null;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        isBlocked: boolean;
        cashbackBalance: number;
        approvedAt: Date | null;
        approvedBy: string | null;
        updatedAt: Date;
    }>;
    approve(req: AuthenticatedRequest, id: string): Promise<{
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        branchId: string;
        phone: string;
        name: string;
        address: string | null;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        isBlocked: boolean;
        cashbackBalance: number;
        approvedAt: Date | null;
        approvedBy: string | null;
        updatedAt: Date;
    }>;
    reject(req: AuthenticatedRequest, id: string): Promise<{
        success: boolean;
    }>;
    block(req: AuthenticatedRequest, id: string): Promise<{
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        branchId: string;
        phone: string;
        name: string;
        address: string | null;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        isBlocked: boolean;
        cashbackBalance: number;
        approvedAt: Date | null;
        approvedBy: string | null;
        updatedAt: Date;
    }>;
    unblock(req: AuthenticatedRequest, id: string): Promise<{
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        branchId: string;
        phone: string;
        name: string;
        address: string | null;
        creditLimit: number;
        currentDebt: number;
        telegramChatId: string | null;
        isApproved: boolean;
        isBlocked: boolean;
        cashbackBalance: number;
        approvedAt: Date | null;
        approvedBy: string | null;
        updatedAt: Date;
    }>;
}
export {};
