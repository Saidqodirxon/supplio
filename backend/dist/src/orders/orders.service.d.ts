import { PrismaService } from "../prisma/prisma.service";
import { TelegramService } from "../telegram/telegram.service";
export declare class OrdersService {
    private prisma;
    private telegramService;
    constructor(prisma: PrismaService, telegramService: TelegramService);
    create(companyId: string, data: {
        dealerId: string;
        branchId: string;
        products: {
            productId?: string;
            price: number;
            cost?: number;
            quantity: number;
        }[];
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
    findAll(companyId: string): Promise<{
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
    findByDealer(companyId: string, dealerId: string): Promise<{
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
    updateStatus(companyId: string, id: string, status: string): Promise<{
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
    findOne(companyId: string, id: string): Promise<{
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
}
