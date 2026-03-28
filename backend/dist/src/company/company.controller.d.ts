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
