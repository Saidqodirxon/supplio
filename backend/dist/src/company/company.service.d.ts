import { PrismaService } from "../prisma/prisma.service";
import { PlanLimitsService } from "../common/services/plan-limits.service";
export declare class CompanyService {
    private prisma;
    private planLimits;
    constructor(prisma: PrismaService, planLimits: PlanLimitsService);
    getCompany(companyId: string): Promise<{
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
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
        deletedBy: string | null;
        cashbackPercent: number;
    }>;
    updateCompany(companyId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
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
        deletedBy: string | null;
        cashbackPercent: number;
    }>;
    getSubscriptionInfo(companyId: string): Promise<{
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
    getUsers(companyId: string): Promise<{
        id: string;
        createdAt: Date;
        phone: string;
        branchId: string;
        fullName: string;
        roleType: import(".prisma/client").$Enums.RoleType;
        customRole: {
            id: string;
            name: string;
            permissions: import("@prisma/client/runtime/library").JsonValue;
        };
        customRoleId: string;
    }[]>;
    createStaff(companyId: string, data: {
        phone: string;
        fullName: string;
        password: string;
        roleType: string;
        branchId?: string;
        customRoleId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        phone: string;
        branchId: string;
        fullName: string;
        roleType: import(".prisma/client").$Enums.RoleType;
        customRole: {
            id: string;
            name: string;
            permissions: import("@prisma/client/runtime/library").JsonValue;
        };
        customRoleId: string;
    }>;
    deactivateStaff(companyId: string, userId: string): Promise<{
        id: string;
        companyId: string;
        isActive: boolean;
        createdAt: Date;
        deletedAt: Date | null;
        updatedAt: Date;
        deletedBy: string | null;
        phone: string;
        branchId: string | null;
        passwordHash: string;
        fullName: string | null;
        photoUrl: string | null;
        roleType: import(".prisma/client").$Enums.RoleType;
        language: string;
        customRoleId: string | null;
    }>;
    getCustomRoles(companyId: string): Promise<({
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
    createCustomRole(companyId: string, data: {
        name: string;
        permissions: Record<string, boolean>;
    }): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updateCustomRole(companyId: string, roleId: string, data: {
        name?: string;
        permissions?: Record<string, boolean>;
    }): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }>;
    deleteCustomRole(companyId: string, roleId: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getFeatureFlags(companyId: string): Promise<{
        multiBranch: boolean;
        customTG: boolean;
        apiAccess: boolean;
        advanceAnalytics: boolean;
        bulkImport: boolean;
    }>;
}
