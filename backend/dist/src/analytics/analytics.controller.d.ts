import { AnalyticsService } from "./analytics.service";
import { Request } from "express";
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        phone: string;
        companyId: string;
        roleType: string;
    };
    companyId: string;
}
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getDashboardStats(req: AuthenticatedRequest, period?: string): Promise<{
        stats: {
            revenue: number;
            profit: number;
            grossProfit: number;
            totalExpenses: number;
            activeDealers: number;
            debt: number;
            collected: number;
            products: number;
            periodRevenue: number;
            periodProfit: number;
            periodOrders: number;
            totalOrders: number;
        };
        chart: {
            revenue: number;
            profit: number;
            orders: number;
            date: string;
        }[];
        statusDistribution: {
            status: import(".prisma/client").$Enums.OrderStatus;
            count: number;
            amount: number;
        }[];
        recentOrders: {
            id: string;
            totalAmount: number;
            status: import(".prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            dealer: {
                name: string;
                phone: string;
            };
        }[];
        period: "7d" | "30d" | "1y" | "all";
    }>;
    getTopDealers(req: AuthenticatedRequest, limit?: string): Promise<{
        id: string;
        name: string;
        totalOrders: number;
        totalAmount: number;
        currentDebt: number;
        creditLimit: number;
    }[]>;
    getTopProducts(req: AuthenticatedRequest, limit?: string): Promise<{
        qty: number;
        revenue: number;
        name: string;
    }[]>;
    getDebtReport(req: AuthenticatedRequest): Promise<{
        dealers: {
            id: string;
            name: string;
            phone: string;
            currentDebt: number;
            creditLimit: number;
            utilizationPercent: number;
            orders: {
                id: string;
                totalAmount: number;
                status: import(".prisma/client").$Enums.OrderStatus;
                createdAt: Date;
            }[];
        }[];
        totalDebt: number;
        totalCreditLimit: number;
        overLimitCount: number;
    }>;
    getRootStats(): Promise<{
        totalCompanies: number;
        totalUsers: number;
        activeBots: number;
        totalOrders: number;
        totalRevenue: number;
        signups: {
            month: string;
            count: number;
        }[];
    }>;
}
export {};
