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
        updatedAt: Date;
        deletedBy: string | null;
        branchId: string;
        totalAmount: number;
        totalCost: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        items: import("@prisma/client/runtime/library").JsonValue;
        note: string | null;
        dealerId: string;
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
        updatedAt: Date;
        deletedBy: string | null;
        branchId: string;
        totalAmount: number;
        totalCost: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        note: string | null;
        dealerId: string;
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
        updatedAt: Date;
        deletedBy: string | null;
        branchId: string;
        totalAmount: number;
        totalCost: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        note: string | null;
        dealerId: string;
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
        updatedAt: Date;
        deletedBy: string | null;
        branchId: string;
        totalAmount: number;
        totalCost: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        note: string | null;
        dealerId: string;
    }>;
    updateStatus(req: AuthenticatedRequest, id: string, body: {
        status: string;
    }): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        updatedAt: Date;
        deletedBy: string | null;
        branchId: string;
        totalAmount: number;
        totalCost: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        items: import("@prisma/client/runtime/library").JsonValue;
        note: string | null;
        dealerId: string;
    }>;
}
export {};
