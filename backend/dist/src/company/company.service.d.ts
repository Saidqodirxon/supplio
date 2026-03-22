import { PrismaService } from "../prisma/prisma.service";
export declare class CompanyService {
    private prisma;
    constructor(prisma: PrismaService);
    getCompany(companyId: string): Promise<{
        id: string;
        updatedAt: Date;
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
        cashbackPercent: number;
        dbConnectionUrl: string | null;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
    }>;
    updateCompany(companyId: string, data: any): Promise<{
        id: string;
        updatedAt: Date;
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
        cashbackPercent: number;
        dbConnectionUrl: string | null;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
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
        phone: string;
        branchId: string;
        fullName: string;
        roleType: import(".prisma/client").$Enums.RoleType;
    }[]>;
    getFeatureFlags(companyId: string): Promise<{
        multiBranch: boolean;
        customTG: boolean;
        apiAccess: boolean;
        advanceAnalytics: boolean;
        bulkImport: boolean;
    }>;
}
