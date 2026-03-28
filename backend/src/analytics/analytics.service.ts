import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

type Period = "7d" | "30d" | "1y" | "all";

function getPeriodStart(period: Period): Date | null {
  const now = new Date();
  if (period === "7d") { now.setDate(now.getDate() - 7); return now; }
  if (period === "30d") { now.setDate(now.getDate() - 30); return now; }
  if (period === "1y") { now.setFullYear(now.getFullYear() - 1); return now; }
  return null;
}

function dateKey(d: Date, period: Period): string {
  if (period === "1y" || period === "all") {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  return d.toISOString().split("T")[0];
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(companyId: string, period: Period = "7d") {
    const since = getPeriodStart(period);
    const dateFilter = since ? { gte: since } : undefined;

    const [allOrders, periodOrders, payments, activeDealers, orderStatusGroups, products, expensesAgg] =
      await Promise.all([
        this.prisma.order.findMany({
          where: { companyId, deletedAt: null },
          select: { totalAmount: true, totalCost: true },
        }),
        this.prisma.order.findMany({
          where: { companyId, deletedAt: null, ...(dateFilter ? { createdAt: dateFilter } : {}) },
          select: { createdAt: true, totalAmount: true, totalCost: true, status: true },
        }),
        this.prisma.payment.findMany({
          where: { companyId, deletedAt: null },
          select: { amount: true },
        }),
        this.prisma.dealer.count({ where: { companyId, deletedAt: null } }),
        this.prisma.order.groupBy({
          by: ["status"],
          where: { companyId, deletedAt: null },
          _count: { id: true },
          _sum: { totalAmount: true },
        }),
        this.prisma.product.count({ where: { companyId, deletedAt: null } }),
        this.prisma.expense.aggregate({
          where: { companyId, deletedAt: null },
          _sum: { amount: true },
        }),
      ]);

    const totalRevenue = allOrders.reduce((s, o) => s + o.totalAmount, 0);
    const totalCost = allOrders.reduce((s, o) => s + o.totalCost, 0);
    const grossProfit = totalRevenue - totalCost;
    const totalExpenses = expensesAgg._sum.amount ?? 0;
    const totalProfit = grossProfit - totalExpenses;
    const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
    const totalDebt = totalRevenue - totalCollected;

    // Period revenue/profit chart
    const buckets = new Map<string, { revenue: number; profit: number; orders: number }>();
    const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "1y" ? 12 : 0;

    if (period === "7d" || period === "30d") {
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        buckets.set(d.toISOString().split("T")[0], { revenue: 0, profit: 0, orders: 0 });
      }
    } else if (period === "1y") {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        buckets.set(k, { revenue: 0, profit: 0, orders: 0 });
      }
    }

    periodOrders.forEach((o) => {
      const k = dateKey(o.createdAt, period);
      const existing = buckets.get(k) || { revenue: 0, profit: 0, orders: 0 };
      existing.revenue += o.totalAmount;
      existing.profit += o.totalAmount - o.totalCost;
      existing.orders += 1;
      buckets.set(k, existing);
    });

    const chart = Array.from(buckets.entries())
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Period totals
    const periodRevenue = periodOrders.reduce((s, o) => s + o.totalAmount, 0);
    const periodProfit = periodOrders.reduce((s, o) => s + (o.totalAmount - o.totalCost), 0);

    // Order status distribution
    const statusDistribution = orderStatusGroups.map((g) => ({
      status: g.status,
      count: g._count.id,
      amount: g._sum.totalAmount ?? 0,
    }));

    return {
      stats: {
        revenue: totalRevenue,
        profit: totalProfit,
        grossProfit,
        totalExpenses,
        activeDealers,
        debt: totalDebt,
        collected: totalCollected,
        products,
        periodRevenue,
        periodProfit,
        periodOrders: periodOrders.length,
      },
      chart,
      statusDistribution,
      period,
    };
  }

  async getTopDealers(companyId: string, limit = 5) {
    const dealers = await this.prisma.dealer.findMany({
      where: { companyId, deletedAt: null },
      select: { id: true, name: true, currentDebt: true, creditLimit: true },
      take: 50,
    });

    const orderTotals = await this.prisma.order.groupBy({
      by: ["dealerId"],
      where: { companyId, deletedAt: null },
      _sum: { totalAmount: true },
      _count: { id: true },
      orderBy: { _sum: { totalAmount: "desc" } },
      take: limit,
    });

    return orderTotals.map((row) => {
      const dealer = dealers.find((d) => d.id === row.dealerId);
      return {
        id: row.dealerId,
        name: dealer?.name ?? "Unknown",
        totalOrders: row._count.id,
        totalAmount: row._sum.totalAmount ?? 0,
        currentDebt: dealer?.currentDebt ?? 0,
        creditLimit: dealer?.creditLimit ?? 0,
      };
    });
  }

  async getTopProducts(companyId: string, limit = 5) {
    const orders = await this.prisma.order.findMany({
      where: { companyId, deletedAt: null },
      select: { items: true },
    });

    const productMap = new Map<string, { qty: number; revenue: number; name: string }>();
    for (const order of orders) {
      const items = order.items as Array<{ productId?: string; name: string; qty: number; price: number }>;
      if (!Array.isArray(items)) continue;
      for (const item of items) {
        const key = item.productId ?? item.name;
        const existing = productMap.get(key) ?? { qty: 0, revenue: 0, name: item.name };
        existing.qty += item.qty ?? 1;
        existing.revenue += (item.price ?? 0) * (item.qty ?? 1);
        productMap.set(key, existing);
      }
    }

    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  async getDebtReport(companyId: string) {
    const dealers = await this.prisma.dealer.findMany({
      where: { companyId, deletedAt: null, isApproved: true },
      select: { id: true, name: true, phone: true, currentDebt: true, creditLimit: true },
    });

    const dealerResults = await Promise.all(
      dealers.map(async (dealer) => {
        const orders = await this.prisma.order.findMany({
          where: { companyId, dealerId: dealer.id, deletedAt: null },
          select: { id: true, totalAmount: true, createdAt: true, status: true },
          orderBy: { createdAt: "desc" },
          take: 3,
        });

        const currentDebt = dealer.currentDebt ?? 0;
        const creditLimit = dealer.creditLimit ?? 0;
        const utilizationPercent =
          creditLimit > 0 ? Math.round((currentDebt / creditLimit) * 100) : 0;

        return {
          id: dealer.id,
          name: dealer.name,
          phone: dealer.phone,
          currentDebt,
          creditLimit,
          utilizationPercent,
          orders,
        };
      })
    );

    const totalDebt = dealerResults.reduce((s, d) => s + d.currentDebt, 0);
    const totalCreditLimit = dealerResults.reduce((s, d) => s + d.creditLimit, 0);
    const overLimitCount = dealerResults.filter(
      (d) => d.currentDebt >= d.creditLimit && d.creditLimit > 0
    ).length;

    return {
      dealers: dealerResults,
      totalDebt,
      totalCreditLimit,
      overLimitCount,
    };
  }

  async getSuperAdminGlobalStats() {
    const [totalCompanies, totalUsers, activeBots, totalOrders, totalRevenue] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.user.count(),
      this.prisma.customBot.count({ where: { isActive: true, deletedAt: null } }),
      this.prisma.order.count(),
      this.prisma.order.aggregate({ _sum: { totalAmount: true } }),
    ]);

    // Monthly signups (last 6 months)
    const signups: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const from = new Date(); from.setMonth(from.getMonth() - i); from.setDate(1); from.setHours(0, 0, 0, 0);
      const to = new Date(from); to.setMonth(to.getMonth() + 1);
      const count = await this.prisma.company.count({ where: { createdAt: { gte: from, lt: to } } });
      signups.push({ month: `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}`, count });
    }

    return {
      totalCompanies,
      totalUsers,
      activeBots,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount ?? 0,
      signups,
    };
  }
}
