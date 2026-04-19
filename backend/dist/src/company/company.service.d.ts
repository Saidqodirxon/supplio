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
    updateStaff(companyId: string, userId: string, data: {
        phone?: string;
        fullName?: string;
        roleType?: string;
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
    getBackup(companyId: string): Promise<{
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
            address: string | null;
            phone: string;
            branchId: string;
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
            branchId: string;
            totalAmount: number;
            totalCost: number;
            status: import(".prisma/client").$Enums.OrderStatus;
            subStatus: string | null;
            items: import("@prisma/client/runtime/library").JsonValue;
            note: string | null;
            dealerId: string;
        })[];
        payments: {
            id: string;
            companyId: string;
            createdAt: Date;
            deletedAt: Date | null;
            deletedBy: string | null;
            branchId: string | null;
            note: string | null;
            dealerId: string;
            amount: number;
            reference: string | null;
            method: string;
        }[];
        expenses: {
            id: string;
            companyId: string;
            createdAt: Date;
            deletedAt: Date | null;
            description: string | null;
            deletedBy: string | null;
            branchId: string | null;
            category: string;
            amount: number;
        }[];
        branches: {
            id: string;
            companyId: string;
            createdAt: Date;
            deletedAt: Date | null;
            name: string;
            updatedAt: Date;
            deletedBy: string | null;
            address: string | null;
            phone: string | null;
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
