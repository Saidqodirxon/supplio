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
        status: import(".prisma/client").$Enums.OrderStatus;
        branchId: string;
        dealerId: string;
        totalAmount: number;
        totalCost: number;
        items: import("@prisma/client/runtime/library").JsonValue;
        note: string | null;
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
        status: import(".prisma/client").$Enums.OrderStatus;
        branchId: string;
        dealerId: string;
        totalAmount: number;
        totalCost: number;
        note: string | null;
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
        status: import(".prisma/client").$Enums.OrderStatus;
        branchId: string;
        dealerId: string;
        totalAmount: number;
        totalCost: number;
        note: string | null;
    }[]>;
    updateStatus(companyId: string, id: string, status: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        updatedAt: Date;
        deletedBy: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        branchId: string;
        dealerId: string;
        totalAmount: number;
        totalCost: number;
        items: import("@prisma/client/runtime/library").JsonValue;
        note: string | null;
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
        status: import(".prisma/client").$Enums.OrderStatus;
        branchId: string;
        dealerId: string;
        totalAmount: number;
        totalCost: number;
        note: string | null;
    }>;
}
