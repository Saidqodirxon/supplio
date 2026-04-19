import { PrismaService } from "../prisma/prisma.service";
import { PlanLimitsService } from "../common/services/plan-limits.service";
export declare class StoreController {
    private prisma;
    private planLimits;
    private readonly logger;
    constructor(prisma: PrismaService, planLimits: PlanLimitsService);
    private isCompanyAccessBlocked;
    getCompanyInfo(slug: string): Promise<{
        id: string;
        name: string;
        slug: string;
        logo: string;
        website: string;
        instagram: string;
        telegram: string;
        subscriptionStatus: import(".prisma/client").$Enums.SubscriptionStatus;
        trialExpiresAt: Date;
    }>;
    getCategories(slug: string): Promise<{
        id: string;
        name: string;
    }[]>;
    getProducts(slug: string, categoryId?: string, search?: string): Promise<{
        id: string;
        description: string;
        name: string;
        category: {
            id: string;
            name: string;
        };
        sku: string;
        price: number;
        stock: number;
        unit: string;
        categoryId: string;
        imageUrl: string;
    }[]>;
    identifyDealer(slug: string, phone: string, telegramUserId?: string, name?: string, region?: string, district?: string, contactPhone?: string, channel?: string): Promise<any>;
    placeOrder(slug: string, channel: string | undefined, body: {
        dealerId: string;
        items: {
            productId: string;
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
        subStatus: string | null;
        items: import("@prisma/client/runtime/library").JsonValue;
        note: string | null;
        dealerId: string;
    }>;
}
