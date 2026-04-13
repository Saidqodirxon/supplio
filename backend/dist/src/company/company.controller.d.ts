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
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            amount: number;
            plan: import(".prisma/client").$Enums.SubscriptionPlan;
            expiresAt: Date;
        }[];
    }>;
    getUsers(req: any): Promise<{
        id: string;
        createdAt: Date;
        phone: string;
        fullName: string;
        roleType: import(".prisma/client").$Enums.RoleType;
        customRole: {
            id: string;
            name: string;
            permissions: import("@prisma/client/runtime/library").JsonValue;
        };
        branchId: string;
        customRoleId: string;
    }[]>;
    createStaff(req: any, body: any): Promise<{
        id: string;
        createdAt: Date;
        phone: string;
        fullName: string;
        roleType: import(".prisma/client").$Enums.RoleType;
        customRole: {
            id: string;
            name: string;
            permissions: import("@prisma/client/runtime/library").JsonValue;
        };
        branchId: string;
        customRoleId: string;
    }>;
    deactivateStaff(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        phone: string;
        companyId: string;
        passwordHash: string;
        fullName: string | null;
        photoUrl: string | null;
        roleType: import(".prisma/client").$Enums.RoleType;
        isActive: boolean;
        language: string;
        branchId: string | null;
        customRoleId: string | null;
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
            address: string | null;
            phone: string;
            companyId: string;
            branchId: string;
            creditLimit: number;
            currentDebt: number;
            isApproved: boolean;
            cashbackBalance: number;
            telegramChatId: string | null;
            approvedAt: Date | null;
            approvedBy: string | null;
            isBlocked: boolean;
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
            branchId: string;
            totalAmount: number;
            totalCost: number;
            status: import(".prisma/client").$Enums.OrderStatus;
            items: import("@prisma/client/runtime/library").JsonValue;
            note: string | null;
            dealerId: string;
        })[];
        payments: {
            id: string;
            createdAt: Date;
            deletedAt: Date | null;
            deletedBy: string | null;
            companyId: string;
            branchId: string | null;
            note: string | null;
            dealerId: string;
            amount: number;
            reference: string | null;
            method: string;
        }[];
        expenses: {
            id: string;
            createdAt: Date;
            deletedAt: Date | null;
            deletedBy: string | null;
            companyId: string;
            branchId: string | null;
            description: string | null;
            category: string;
            amount: number;
        }[];
        branches: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            deletedBy: string | null;
            address: string | null;
            phone: string | null;
            companyId: string;
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
