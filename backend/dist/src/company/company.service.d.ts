import { PrismaService } from "../prisma/prisma.service";
import { PlanLimitsService } from "../common/services/plan-limits.service";
import { TelegramService } from "../telegram/telegram.service";
export declare class CompanyService {
    private prisma;
    private planLimits;
    private telegramService;
    constructor(prisma: PrismaService, planLimits: PlanLimitsService, telegramService: TelegramService);
    getCompany(companyId: string): Promise<{
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
        preparingVariants: import("@prisma/client/runtime/library").JsonValue | null;
        dealerStatusLabels: import("@prisma/client/runtime/library").JsonValue | null;
        workingHours: string | null;
        adminLogBotToken: string | null;
        facebook: string | null;
        tiktok: string | null;
        youtube: string | null;
    }>;
    updateCompany(companyId: string, data: any): Promise<{
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
        preparingVariants: import("@prisma/client/runtime/library").JsonValue | null;
        dealerStatusLabels: import("@prisma/client/runtime/library").JsonValue | null;
        workingHours: string | null;
        adminLogBotToken: string | null;
        facebook: string | null;
        tiktok: string | null;
        youtube: string | null;
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
            plan: import(".prisma/client").$Enums.SubscriptionPlan;
            amount: number;
            expiresAt: Date;
        }[];
    }>;
    getUsers(companyId: string): Promise<{
        id: string;
        createdAt: Date;
        customRole: {
            id: string;
            name: string;
            permissions: import("@prisma/client/runtime/library").JsonValue;
        };
        branchId: string;
        phone: string;
        fullName: string;
        roleType: import(".prisma/client").$Enums.RoleType;
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
        customRole: {
            id: string;
            name: string;
            permissions: import("@prisma/client/runtime/library").JsonValue;
        };
        branchId: string;
        phone: string;
        fullName: string;
        roleType: import(".prisma/client").$Enums.RoleType;
        customRoleId: string;
    }>;
    updateStaff(companyId: string, userId: string, data: {
        phone?: string;
        fullName?: string;
        roleType?: string;
        branchId?: string;
        customRoleId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        customRole: {
            id: string;
            name: string;
            permissions: import("@prisma/client/runtime/library").JsonValue;
        };
        branchId: string;
        phone: string;
        fullName: string;
        roleType: import(".prisma/client").$Enums.RoleType;
        customRoleId: string;
    }>;
    deactivateStaff(companyId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        isActive: boolean;
        branchId: string | null;
        phone: string;
        passwordHash: string;
        fullName: string | null;
        photoUrl: string | null;
        roleType: import(".prisma/client").$Enums.RoleType;
        customRoleId: string | null;
        language: string;
    }>;
    getCustomRoles(companyId: string): Promise<({
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
    createCustomRole(companyId: string, data: {
        name: string;
        permissions: Record<string, boolean>;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updateCustomRole(companyId: string, roleId: string, data: {
        name?: string;
        permissions?: Record<string, boolean>;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }>;
    deleteCustomRole(companyId: string, roleId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getBackup(companyId: string): Promise<{
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
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            deletedBy: string | null;
            companyId: string;
            sku: string | null;
            description: string | null;
            costPrice: number;
            price: number;
            stock: number;
            unit: string;
            categoryId: string | null;
            imageUrl: string | null;
            isActive: boolean;
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
            totalAmount: number;
            totalCost: number;
            status: import(".prisma/client").$Enums.OrderStatus;
            subStatus: string | null;
            items: import("@prisma/client/runtime/library").JsonValue;
            note: string | null;
            dealerId: string;
            branchId: string;
        })[];
        payments: {
            id: string;
            createdAt: Date;
            deletedAt: Date | null;
            deletedBy: string | null;
            companyId: string;
            note: string | null;
            dealerId: string;
            branchId: string | null;
            amount: number;
            method: string;
            reference: string | null;
        }[];
        expenses: {
            id: string;
            createdAt: Date;
            deletedAt: Date | null;
            deletedBy: string | null;
            category: string;
            companyId: string;
            description: string | null;
            branchId: string | null;
            amount: number;
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
    getFeatureFlags(companyId: string): Promise<{
        multiBranch: boolean;
        customTG: boolean;
        apiAccess: boolean;
        advanceAnalytics: boolean;
        bulkImport: boolean;
    }>;
}
