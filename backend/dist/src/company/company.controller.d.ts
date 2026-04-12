import { CompanyService } from "./company.service";
export declare class CompanyController {
    private readonly companyService;
    constructor(companyService: CompanyService);
    getMyCompany(req: any): Promise<{
        id: string;
        slug: string;
        name: string;
        logo: string | null;
        website: string | null;
        instagram: string | null;
        telegram: string | null;
        siteActive: boolean;
        isDemo: boolean;
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        subscriptionStatus: import(".prisma/client").$Enums.SubscriptionStatus;
        trialExpiresAt: Date;
        dbConnectionUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        cashbackPercent: number;
        workingHours: string | null;
        adminLogBotToken: string | null;
        facebook: string | null;
        tiktok: string | null;
        youtube: string | null;
    }>;
    updateMyCompany(req: any, body: any): Promise<{
        id: string;
        slug: string;
        name: string;
        logo: string | null;
        website: string | null;
        instagram: string | null;
        telegram: string | null;
        siteActive: boolean;
        isDemo: boolean;
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        subscriptionStatus: import(".prisma/client").$Enums.SubscriptionStatus;
        trialExpiresAt: Date;
        dbConnectionUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        cashbackPercent: number;
        workingHours: string | null;
        adminLogBotToken: string | null;
        facebook: string | null;
        tiktok: string | null;
        youtube: string | null;
    }>;
    getSubscription(req: any): Promise<{
        plan: import(".prisma/client").$Enums.SubscriptionPlan;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        trialExpiresAt: Date;
        isTrialExpired: boolean;
        daysLeft: number;
        history: {
            createdAt: Date;
            plan: import(".prisma/client").$Enums.SubscriptionPlan;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            amount: number;
            expiresAt: Date;
        }[];
    }>;
    getUsers(req: any): Promise<{
        id: string;
        createdAt: Date;
        branchId: string;
        phone: string;
        fullName: string;
        roleType: import(".prisma/client").$Enums.RoleType;
        customRoleId: string;
        customRole: {
            id: string;
            name: string;
            permissions: import("@prisma/client/runtime/library").JsonValue;
        };
    }[]>;
    createStaff(req: any, body: any): Promise<{
        id: string;
        createdAt: Date;
        branchId: string;
        phone: string;
        fullName: string;
        roleType: import(".prisma/client").$Enums.RoleType;
        customRoleId: string;
        customRole: {
            id: string;
            name: string;
            permissions: import("@prisma/client/runtime/library").JsonValue;
        };
    }>;
    deactivateStaff(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        branchId: string | null;
        phone: string;
        passwordHash: string;
        fullName: string | null;
        photoUrl: string | null;
        roleType: import(".prisma/client").$Enums.RoleType;
        customRoleId: string | null;
        isActive: boolean;
        language: string;
    }>;
    getBackup(req: any): Promise<{
        exportedAt: string;
        company: {
            id: string;
            slug: string;
            name: string;
            website: string;
            instagram: string;
            telegram: string;
            subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
            createdAt: Date;
        };
        summary: {
            dealers: number;
            products: number;
            orders: number;
            payments: number;
            expenses: number;
            branches: number;
            staff: number;
        };
        dealers: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            deletedBy: string | null;
            companyId: string;
            branchId: string;
            phone: string;
            address: string | null;
            creditLimit: number;
            currentDebt: number;
            telegramChatId: string | null;
            isApproved: boolean;
            approvedAt: Date | null;
            approvedBy: string | null;
            isBlocked: boolean;
            cashbackBalance: number;
        }[];
        products: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            deletedBy: string | null;
            companyId: string;
            isActive: boolean;
            sku: string | null;
            description: string | null;
            costPrice: number;
            price: number;
            stock: number;
            unit: string;
            categoryId: string | null;
            imageUrl: string | null;
            subcategoryId: string | null;
            unitId: string | null;
            discountPrice: number | null;
            isPromo: boolean;
        }[];
        orders: ({
            dealer: {
                name: string;
                phone: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            deletedBy: string | null;
            companyId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            branchId: string;
            dealerId: string;
            totalAmount: number;
            totalCost: number;
            items: import("@prisma/client/runtime/library").JsonValue;
            note: string | null;
        })[];
        payments: {
            id: string;
            createdAt: Date;
            deletedAt: Date | null;
            deletedBy: string | null;
            companyId: string;
            amount: number;
            branchId: string | null;
            dealerId: string;
            note: string | null;
            method: string;
            reference: string | null;
        }[];
        expenses: {
            id: string;
            createdAt: Date;
            deletedAt: Date | null;
            deletedBy: string | null;
            companyId: string;
            amount: number;
            branchId: string | null;
            description: string | null;
            category: string;
        }[];
        branches: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            deletedBy: string | null;
            companyId: string;
            phone: string | null;
            address: string | null;
        }[];
        staff: {
            id: string;
            createdAt: Date;
            phone: string;
            fullName: string;
            roleType: import(".prisma/client").$Enums.RoleType;
        }[];
    }>;
    getFeatures(req: any): Promise<{
        multiBranch: boolean;
        customTG: boolean;
        apiAccess: boolean;
        advanceAnalytics: boolean;
        bulkImport: boolean;
    }>;
    getCustomRoles(req: any): Promise<({
        _count: {
            users: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    })[]>;
    createCustomRole(req: any, body: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updateCustomRole(req: any, id: string, body: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }>;
    deleteCustomRole(req: any, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
