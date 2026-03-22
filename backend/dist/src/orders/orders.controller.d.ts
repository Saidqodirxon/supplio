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
        deletedAt: Date | null;
        id: string;
        note: string | null;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        branchId: string;
        dealerId: string;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: number;
        totalCost: number;
        items: import("@prisma/client/runtime/library").JsonValue;
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
            phone: string;
            name: string;
        };
        deletedAt: Date | null;
        id: string;
        note: string | null;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        branchId: string;
        dealerId: string;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: number;
        totalCost: number;
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
        deletedAt: Date | null;
        id: string;
        note: string | null;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        branchId: string;
        dealerId: string;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: number;
        totalCost: number;
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
            phone: string;
            name: string;
        };
        deletedAt: Date | null;
        id: string;
        note: string | null;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        branchId: string;
        dealerId: string;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: number;
        totalCost: number;
    }>;
    updateStatus(req: AuthenticatedRequest, id: string, body: {
        status: string;
    }): Promise<{
        deletedAt: Date | null;
        id: string;
        note: string | null;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        branchId: string;
        dealerId: string;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: number;
        totalCost: number;
        items: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
export {};
