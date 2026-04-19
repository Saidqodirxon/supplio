import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { TelegramService } from "../telegram/telegram.service";
import { CompanyNotifierService } from "../telegram/company-notifier.service";

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private telegramService: TelegramService,
    private companyNotifier: CompanyNotifierService
  ) {}

  async create(
    companyId: string,
    data: {
      dealerId: string;
      branchId: string;
      products: {
        productId?: string;
        price: number;
        cost?: number;
        quantity: number;
      }[];
    }
  ) {
    const { dealerId, branchId, products } = data;

    const createdOrder = await this.prisma.$transaction(async (tx) => {
      const totalAmount = products.reduce(
        (acc, p) => acc + p.price * p.quantity,
        0
      );

      // Resolve cost + name per product
      const productIds = products
        .filter((p) => p.productId)
        .map((p) => p.productId as string);
      const productCosts: Record<string, number> = {};
      const productNames: Record<string, string> = {};
      const productUnits: Record<string, string> = {};

      if (productIds.length > 0) {
        const dbProducts = await tx.product.findMany({
          where: { id: { in: productIds }, companyId },
          select: { id: true, costPrice: true, name: true, unit: true },
        });
        dbProducts.forEach((p) => {
          productCosts[p.id] = p.costPrice;
          productNames[p.id] = p.name;
          productUnits[p.id] = p.unit ?? "pcs";
        });
      }

      const totalCost = products.reduce((acc, p) => {
        const cost =
          p.cost ?? (p.productId ? (productCosts[p.productId] ?? 0) : 0);
        return acc + cost * p.quantity;
      }, 0);

      const dealer = await tx.dealer.findFirst({
        where: { id: dealerId, companyId },
      });
      if (!dealer) throw new BadRequestException("Dealer not found");

      const ordersTotal = await tx.ledgerTransaction.aggregate({
        where: { dealerId, companyId, type: "ORDER" },
        _sum: { amount: true },
      });
      const paymentsTotal = await tx.ledgerTransaction.aggregate({
        where: { dealerId, companyId, type: { in: ["PAYMENT", "ADJUSTMENT"] } },
        _sum: { amount: true },
      });
      const currentDebt =
        (ordersTotal._sum.amount || 0) - (paymentsTotal._sum.amount || 0);

      // Only enforce credit limit when it is explicitly set (> 0)
      if (
        dealer.creditLimit > 0 &&
        currentDebt + totalAmount > dealer.creditLimit
      ) {
        throw new BadRequestException("Credit limit exceeded");
      }

      // Normalise items: always store as { productId, name, qty, unit, price, total }
      const orderItems = products.map((p) => ({
        productId: p.productId ?? null,
        name: p.productId
          ? (productNames[p.productId] ?? "Unknown")
          : "Unknown",
        qty: p.quantity,
        unit: p.productId ? (productUnits[p.productId] ?? "pcs") : "pcs",
        price: p.price,
        total: p.price * p.quantity,
      }));

      const order = await tx.order.create({
        data: {
          companyId,
          dealerId,
          branchId,
          totalAmount,
          totalCost,
          items: orderItems as any,
          status: "PENDING",
        },
      });

      await tx.ledgerTransaction.create({
        data: { companyId, dealerId, type: "ORDER", amount: totalAmount },
      });

      // Cashback
      const company = await tx.company.findUnique({
        where: { id: companyId },
        select: { cashbackPercent: true },
      });
      const cashbackPct = (company as any)?.cashbackPercent ?? 0;
      const cashbackEarned =
        cashbackPct > 0 ? Math.floor((totalAmount * cashbackPct) / 100) : 0;

      await tx.dealer.update({
        where: { id: dealerId },
        data: {
          currentDebt: { increment: totalAmount },
          ...(cashbackEarned > 0
            ? { cashbackBalance: { increment: cashbackEarned } }
            : {}),
        },
      });

      return order;
    });

    // Fire-and-forget group notifications (outside transaction)
    const branch = await this.prisma.branch
      .findUnique({ where: { id: data.branchId }, select: { name: true } })
      .catch(() => null);
    this.companyNotifier
      .notifyNewOrder(companyId, {
        id: (createdOrder as any).id,
        totalAmount: (createdOrder as any).totalAmount,
        dealerName:
          (
            await this.prisma.dealer
              .findUnique({
                where: { id: data.dealerId },
                select: { name: true },
              })
              .catch(() => null)
          )?.name ?? "Unknown",
        dealerPhone:
          (
            await this.prisma.dealer
              .findUnique({
                where: { id: data.dealerId },
                select: { phone: true },
              })
              .catch(() => null)
          )?.phone ?? "",
        branchName: branch?.name ?? "",
        items: (createdOrder as any).items ?? [],
      })
      .catch(() => {});

    return createdOrder;
  }

  async findAll(companyId: string) {
    const orders = await this.prisma.order.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        dealer: { select: { name: true, phone: true } },
        branch: { select: { name: true } },
      },
    });

    // Collect all productIds referenced in items JSON so we can enrich with names in one query
    const productIdSet = new Set<string>();
    for (const order of orders) {
      const items = order.items as any[];
      if (Array.isArray(items)) {
        items.forEach((item) => {
          if (item.productId) productIdSet.add(item.productId);
        });
      }
    }

    const productMap = new Map<string, string>();
    if (productIdSet.size > 0) {
      const products = await this.prisma.product.findMany({
        where: { id: { in: Array.from(productIdSet) }, companyId },
        select: { id: true, name: true, unit: true },
      });
      products.forEach((p) => productMap.set(p.id, p.name));
    }

    // Normalise items structure: qty vs quantity, add name if missing
    return orders.map((order) => {
      const rawItems = order.items as any[];
      const items = Array.isArray(rawItems)
        ? rawItems.map((item) => ({
            productId: item.productId ?? null,
            name:
              item.name ||
              (item.productId
                ? (productMap.get(item.productId) ?? "Unknown")
                : "Unknown"),
            qty: item.qty ?? item.quantity ?? 1,
            unit: item.unit ?? "pcs",
            price: item.price ?? 0,
            total:
              item.total ??
              (item.qty ?? item.quantity ?? 1) * (item.price ?? 0),
          }))
        : [];
      return { ...order, items };
    });
  }

  async findByDealer(companyId: string, dealerId: string) {
    const orders = await this.prisma.order.findMany({
      where: { companyId, dealerId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        branch: { select: { name: true } },
      },
    });

    const productIdSet = new Set<string>();
    for (const order of orders) {
      const items = order.items as any[];
      if (Array.isArray(items)) {
        items.forEach((item) => {
          if (item.productId) productIdSet.add(item.productId);
        });
      }
    }

    const productMap = new Map<string, string>();
    if (productIdSet.size > 0) {
      const products = await this.prisma.product.findMany({
        where: { id: { in: Array.from(productIdSet) }, companyId },
        select: { id: true, name: true, unit: true },
      });
      products.forEach((p) => productMap.set(p.id, p.name));
    }

    return orders.map((order) => {
      const rawItems = order.items as any[];
      const items = Array.isArray(rawItems)
        ? rawItems.map((item) => ({
            productId: item.productId ?? null,
            name:
              item.name ||
              (item.productId
                ? (productMap.get(item.productId) ?? "Unknown")
                : "Unknown"),
            qty: item.qty ?? item.quantity ?? 1,
            unit: item.unit ?? "pcs",
            price: item.price ?? 0,
            total:
              item.total ??
              (item.qty ?? item.quantity ?? 1) * (item.price ?? 0),
          }))
        : [];
      return { ...order, items };
    });
  }

  async updateStatus(
    companyId: string,
    id: string,
    status: string,
    subStatus?: string,
    actor?: { id?: string; phone?: string; roleType?: string }
  ) {
    const prev = await this.prisma.order.findFirst({
      where: { id, companyId },
      select: { id: true, dealerId: true, status: true, updatedAt: true },
    });
    if (!prev) throw new BadRequestException("Order not found");

    const order = await this.prisma.order.update({
      where: { id, companyId },
      data: { status: status as any, subStatus },
    });

    // Notify dealer via Telegram (fire-and-forget)
    this.telegramService
      .sendOrderStatusUpdate(companyId, id, status, order.dealerId, subStatus)
      .catch(() => {});

    // Distributor log group: only order status changes + who/when edited
    this.companyNotifier
      .notifyOrderStatusChanged(companyId, {
        orderId: id,
        oldStatus: String(prev.status),
        newStatus: String(status),
        editorId: actor?.id,
        editorPhone: actor?.phone,
        editorRole: actor?.roleType,
        changedAt: order.updatedAt,
      })
      .catch(() => {});

    return order;
  }

  async findOne(companyId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        dealer: { select: { name: true, phone: true } },
        branch: { select: { name: true } },
      },
    });
    if (!order) return null;

    const rawItems = order.items as any[];
    const productIdSet = new Set<string>();
    if (Array.isArray(rawItems)) {
      rawItems.forEach((item) => {
        if (item.productId) productIdSet.add(item.productId);
      });
    }

    const productMap = new Map<string, string>();
    if (productIdSet.size > 0) {
      const products = await this.prisma.product.findMany({
        where: { id: { in: Array.from(productIdSet) }, companyId },
        select: { id: true, name: true, unit: true },
      });
      products.forEach((p) => productMap.set(p.id, p.name));
    }

    const items = Array.isArray(rawItems)
      ? rawItems.map((item) => ({
          productId: item.productId ?? null,
          name:
            item.name ||
            (item.productId
              ? (productMap.get(item.productId) ?? "Unknown")
              : "Unknown"),
          qty: item.qty ?? item.quantity ?? 1,
          unit: item.unit ?? "pcs",
          price: item.price ?? 0,
          total:
            item.total ?? (item.qty ?? item.quantity ?? 1) * (item.price ?? 0),
        }))
      : [];

    return { ...order, items };
  }
}
