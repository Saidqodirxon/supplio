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
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        branchId: string;
        updatedAt: Date;
        deletedBy: string | null;
        dealerId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: number;
        totalCost: number;
        items: import("@prisma/client/runtime/library").JsonValue;
        note: string | null;
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
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        branchId: string;
        updatedAt: Date;
        deletedBy: string | null;
        dealerId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: number;
        totalCost: number;
        note: string | null;
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
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        branchId: string;
        updatedAt: Date;
        deletedBy: string | null;
        dealerId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: number;
        totalCost: number;
        note: string | null;
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
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        branchId: string;
        updatedAt: Date;
        deletedBy: string | null;
        dealerId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: number;
        totalCost: number;
        note: string | null;
    }>;
    updateStatus(req: AuthenticatedRequest, id: string, body: {
        status: string;
    }): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        branchId: string;
        updatedAt: Date;
        deletedBy: string | null;
        dealerId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: number;
        totalCost: number;
        items: import("@prisma/client/runtime/library").JsonValue;
        note: string | null;
    }>;
}
export {};
