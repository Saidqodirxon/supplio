import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PlanLimitsService } from "../common/services/plan-limits.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class DealersService {
  constructor(
    private prisma: PrismaService,
    private planLimits: PlanLimitsService
  ) {}

  async create(
    companyId: string,
    data: {
      name: string;
      phone: string;
      branchId: string;
      creditLimit?: number;
      address?: string;
    }
  ) {
    await this.planLimits.checkDealerLimit(companyId);

    // Basic validation to guarantee branch existence and scope
    const branch = await this.prisma.branch.findUnique({
      where: { id: data.branchId },
    });

    if (!branch || branch.companyId !== companyId) {
      throw new ForbiddenException("Branch access denied or not found");
    }

    const normalizedPhone = data.phone.replace(/\s+/g, "").replace(/^\+?/, "+");

    // Phone uniqueness should be scoped by company.
    const existing = await this.prisma.dealer.findFirst({
      where: { companyId, phone: normalizedPhone, deletedAt: null },
    });

    if (existing) {
      throw new BadRequestException("Dealer with this phone already exists");
    }

    const dealer = await this.prisma.dealer.create({
      data: {
        companyId,
        branchId: data.branchId,
        name: data.name,
        phone: normalizedPhone,
        creditLimit: data.creditLimit || 0,
        address: data.address,
      },
    });

    // Create initial approval request with PENDING status
    await (this.prisma as any).dealerApprovalRequest.create({
      data: {
        companyId,
        dealerId: dealer.id,
        status: "PENDING",
        requestedAt: new Date(),
      },
    });

    return dealer;
  }

  async findAll(
    companyId: string,
    user: { roleType: string; branchId?: string | null }
  ) {
    // If a branchManager calls this, they shouldn't see dealers from other branches
    const whereClause: Prisma.DealerWhereInput = { companyId, deletedAt: null };

    if (
      user.roleType !== "OWNER" &&
      user.roleType !== "SUPER_ADMIN" &&
      user.branchId
    ) {
      whereClause.branchId = user.branchId;
    }

    const dealers = await this.prisma.dealer.findMany({
      where: whereClause,
      include: {
        branch: {
          select: { name: true },
        },
      },
    });

    // Calculate dynamic debts for list view without N+1 problem efficiently via Promise.all
    // For large scale, raw query aggregation is better, but this demonstrates the spec's requirement
    const result = await Promise.all(
      dealers.map(async (dealer) => {
        const debtAggregation = await (
          this.prisma as any
        ).ledgerTransaction.groupBy({
          by: ["type"],
          where: { dealerId: dealer.id, companyId },
          _sum: { amount: true },
        });

        let ordersTotal = 0;
        let paymentsTotal = 0;

        debtAggregation.forEach((agg) => {
          if (agg.type === "ORDER") ordersTotal += agg._sum.amount || 0;
          if (agg.type === "PAYMENT" || agg.type === "ADJUSTMENT")
            paymentsTotal += agg._sum.amount || 0;
        });

        const currentDebt = ordersTotal - paymentsTotal;

        return {
          ...dealer,
          currentDebt,
          status:
            currentDebt >= dealer.creditLimit
              ? "LIMIT_REACHED"
              : currentDebt > 0
                ? "HAS_DEBT"
                : "HEALTHY",
        };
      })
    );

    return result;
  }

  async getPendingApprovals(companyId: string) {
    return this.prisma.dealer.findMany({
      where: { companyId, isApproved: false, deletedAt: null },
      include: {
        branch: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveDealer(id: string, companyId: string, userId: string, creditLimit?: number) {
    const dealer = await this.prisma.dealer.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!dealer) {
      throw new NotFoundException("Dealer not found");
    }

    const updated = await this.prisma.dealer.update({
      where: { id },
      data: {
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: userId,
        ...(creditLimit !== undefined && creditLimit > 0 ? { creditLimit } : {}),
      },
    });

    await (this.prisma as any).dealerApprovalRequest.create({
      data: {
        companyId,
        dealerId: id,
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedBy: userId,
        requestedAt: new Date(),
      },
    });

    return updated;
  }

  async update(
    id: string,
    companyId: string,
    data: {
      name?: string;
      phone?: string;
      branchId?: string;
      creditLimit?: number;
      address?: string;
    }
  ) {
    return this.prisma.dealer.update({
      where: { id, companyId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone && { phone: data.phone }),
        ...(data.branchId && { branchId: data.branchId }),
        ...(data.creditLimit !== undefined && {
          creditLimit: data.creditLimit,
        }),
        ...(data.address !== undefined && { address: data.address }),
      },
      include: { branch: { select: { name: true } } },
    });
  }

  async block(id: string, companyId: string) {
    return this.prisma.dealer.update({
      where: { id, companyId },
      data: { isBlocked: true },
    });
  }

  async unblock(id: string, companyId: string) {
    return this.prisma.dealer.update({
      where: { id, companyId },
      data: { isBlocked: false },
    });
  }

  async remove(id: string, companyId: string, userId: string) {
    return this.prisma.dealer.update({
      where: { id, companyId },
      data: { deletedAt: new Date(), deletedBy: userId },
    });
  }

  async rejectDealer(id: string, companyId: string, userId: string) {
    const dealer = await this.prisma.dealer.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!dealer) {
      throw new NotFoundException("Dealer not found");
    }

    await this.prisma.dealer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await (this.prisma as any).dealerApprovalRequest.create({
      data: {
        companyId,
        dealerId: id,
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewedBy: userId,
        requestedAt: new Date(),
      },
    });

    return { success: true };
  }
}
