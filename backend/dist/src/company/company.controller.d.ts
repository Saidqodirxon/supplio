import { CompanyService } from "./company.service";
export declare class CompanyController {
    private readonly companyService;
    constructor(companyService: CompanyService);
    getMyCompany(req: any): Promise<{
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        slug: string;
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
        updatedAt: Date;
        deletedBy: string | null;
        cashbackPercent: number;
        preparingVariants: import("@prisma/client/runtime/library").JsonValue | null;
        dealerStatusLabels: import("@prisma/client/runtime/library").JsonValue | null;
        workingHours: string | null;
        adminLogBotToken: string | null;
        facebook: string | null;
        tiktok: string | null;
        youtube: string | null;
    }>;
    updateMyCompany(req: any, body: any): Promise<{
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        slug: string;
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
        updatedAt: Date;
        deletedBy: string | null;
        cashbackPercent: number;
        preparingVariants: import("@prisma/client/runtime/library").JsonValue | null;
        dealerStatusLabels: import("@prisma/client/runtime/library").JsonValue | null;
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
            plan: import(".prisma/client").$Enums.SubscriptionPlan;
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
    updateStaff(req: any, id: string, body: any): Promise<{
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
        companyId: string;
        isActive: boolean;
        createdAt: Date;
        deletedAt: Date | null;
        updatedAt: Date;
        deletedBy: string | null;
        branchId: string | null;
        phone: string;
        passwordHash: string;
        fullName: string | null;
        photoUrl: string | null;
        roleType: import(".prisma/client").$Enums.RoleType;
        customRoleId: string | null;
        language: string;
    }>;
    getBackup(req: any): Promise<{
        exportedAt: string;
        company: {
            id: string;
            createdAt: Date;
            name: string;
            slug: string;
            website: string;
            instagram: string;
            telegram: string;
            subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
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
            companyId: string;
            createdAt: Date;
            deletedAt: Date | null;
            name: string;
            updatedAt: Date;
            deletedBy: string | null;
            branchId: string;
            phone: string;
            address: string | null;
            region: string | null;
            district: string | null;
            contactPhone: string | null;
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
            companyId: string;
            isActive: boolean;
            createdAt: Date;
            deletedAt: Date | null;
            description: string | null;
            name: string;
            updatedAt: Date;
            deletedBy: string | null;
            sku: string | null;
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
            subStatus: string | null;
            items: import("@prisma/client/runtime/library").JsonValue;
            note: string | null;
        })[];
        payments: {
            id: string;
            companyId: string;
            createdAt: Date;
            deletedAt: Date | null;
            deletedBy: string | null;
            branchId: string | null;
            dealerId: string;
            amount: number;
            note: string | null;
            method: string;
            reference: string | null;
        }[];
        expenses: {
            id: string;
            companyId: string;
            createdAt: Date;
            deletedAt: Date | null;
            description: string | null;
            deletedBy: string | null;
            branchId: string | null;
            amount: number;
            category: string;
        }[];
        branches: {
            id: string;
            companyId: string;
            createdAt: Date;
            deletedAt: Date | null;
            name: string;
            updatedAt: Date;
            deletedBy: string | null;
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
        companyId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    })[]>;
    createCustomRole(req: any, body: any): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updateCustomRole(req: any, id: string, body: any): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }>;
    deleteCustomRole(req: any, id: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
