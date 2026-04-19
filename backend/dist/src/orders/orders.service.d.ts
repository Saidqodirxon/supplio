import { PrismaService } from "../prisma/prisma.service";
import { TelegramService } from "../telegram/telegram.service";
import { CompanyNotifierService } from "../telegram/company-notifier.service";
export declare class OrdersService {
    private prisma;
    private telegramService;
    private companyNotifier;
    constructor(prisma: PrismaService, telegramService: TelegramService, companyNotifier: CompanyNotifierService);
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
    updateStatus(companyId: string, id: string, status: string, subStatus?: string, actor?: {
        id?: string;
        phone?: string;
        roleType?: string;
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
}
