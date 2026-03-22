import { PrismaService } from "../prisma/prisma.service";
export declare class StoreController {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getCompanyInfo(slug: string): Promise<{
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
        name: string;
        category: {
            id: string;
            name: string;
        };
        categoryId: string;
        sku: string;
        description: string;
        imageUrl: string;
        price: number;
        stock: number;
        unit: string;
    }[]>;
    identifyDealer(slug: string, phone: string): Promise<{
        id: string;
        name: string;
        phone: string;
        branchId: string;
        creditLimit: number;
        currentDebt: number;
    }>;
    placeOrder(slug: string, body: {
        dealerId: string;
        items: {
            productId: string;
            quantity: number;
        }[];
    }): Promise<{
        id: string;
        updatedAt: Date;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        branchId: string;
        totalAmount: number;
        totalCost: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        items: import("@prisma/client/runtime/library").JsonValue;
        note: string | null;
        dealerId: string;
    }>;
}
