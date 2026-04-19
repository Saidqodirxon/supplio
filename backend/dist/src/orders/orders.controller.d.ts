import { OrdersService } from "./orders.service";
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
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(req: AuthenticatedRequest, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        totalAmount: number;
        totalCost: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        subStatus: string | null;
        items: import("@prisma/client/runtime/library").JsonValue;
        note: string | null;
        dealerId: string;
        branchId: string;
    }>;
    findAll(req: AuthenticatedRequest): Promise<{
        items: {
            productId: any;
            name: any;
            qty: any;
            unit: any;
            price: any;
            total: any;
        }[];
        branch: {
            name: string;
        };
        dealer: {
            name: string;
            phone: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        totalAmount: number;
        totalCost: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        subStatus: string | null;
        note: string | null;
        dealerId: string;
        branchId: string;
    }[]>;
    findByDealer(req: AuthenticatedRequest, dealerId: string): Promise<{
        items: {
            productId: any;
            name: any;
            qty: any;
            unit: any;
            price: any;
            total: any;
        }[];
        branch: {
            name: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        totalAmount: number;
        totalCost: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        subStatus: string | null;
        note: string | null;
        dealerId: string;
        branchId: string;
    }[]>;
    findOne(req: AuthenticatedRequest, id: string): Promise<{
        items: {
            productId: any;
            name: any;
            qty: any;
            unit: any;
            price: any;
            total: any;
        }[];
        branch: {
            name: string;
        };
        dealer: {
            name: string;
            phone: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        totalAmount: number;
        totalCost: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        subStatus: string | null;
        note: string | null;
        dealerId: string;
        branchId: string;
    }>;
    updateStatus(req: AuthenticatedRequest, id: string, body: {
        status: string;
        subStatus?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        totalAmount: number;
        totalCost: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        subStatus: string | null;
        items: import("@prisma/client/runtime/library").JsonValue;
        note: string | null;
        dealerId: string;
        branchId: string;
    }>;
}
export {};
