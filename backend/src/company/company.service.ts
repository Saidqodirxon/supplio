import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PlanLimitsService } from "../common/services/plan-limits.service";
import { TelegramService } from "../telegram/telegram.service";
import { RoleType } from "@prisma/client";
import * as bcrypt from "bcrypt";

@Injectable()
export class CompanyService {
  constructor(
    private prisma: PrismaService,
    private planLimits: PlanLimitsService,
    private telegramService: TelegramService,
  ) {}

  async getCompany(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) throw new NotFoundException("Company not found");
    return company;
  }

  async updateCompany(companyId: string, data: any) {
    // Only allow specific fields to be updated by owner
    const allowedFields = [
      "name",
      "logo",
      "website",
      "instagram",
      "telegram",
      "facebook",
      "tiktok",
      "youtube",
      "siteActive",
      "cashbackPercent",
      "workingHours",
      "contactPhone",
      "contactAddress",
      "botPaused",
      "botAutoSchedule",
      "logGroupChatId",
      "orderGroupChatId",
      "preparingVariants",
      "dealerStatusLabels",
    ];
    const filteredData: any = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        filteredData[field] = data[field];
      }
    }

    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: filteredData,
    });

    if (filteredData.name !== undefined || filteredData.logo !== undefined) {
      this.prisma.customBot
        .findMany({ where: { companyId, isActive: true, deletedAt: null }, select: { token: true } })
        .then((bots) => {
          for (const bot of bots) {
            this.telegramService
              .applyBotBranding(bot.token, companyId)
              .catch(() => {});
          }
        })
        .catch(() => {});
    }

    return updated;
  }

  async getSubscriptionInfo(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        subscriptionPlan: true,
        subscriptionStatus: true,
        trialExpiresAt: true,
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            plan: true,
            status: true,
            amount: true,
            expiresAt: true,
            createdAt: true,
          },
        },
      },
    });
    if (!company) throw new NotFoundException("Company not found");

    const now = new Date();
    const isTrialExpired =
      company.subscriptionStatus === "TRIAL" &&
      company.trialExpiresAt < now;

    const daysLeft =
      company.subscriptionStatus === "TRIAL"
        ? Math.max(
            0,
            Math.ceil(
              (company.trialExpiresAt.getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          )
        : null;

    return {
      plan: company.subscriptionPlan,
      status: company.subscriptionStatus,
      trialExpiresAt: company.trialExpiresAt,
      isTrialExpired,
      daysLeft,
      history: company.subscriptions,
    };
  }

  async getUsers(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId, isActive: true },
      select: {
        id: true, phone: true, fullName: true, roleType: true,
        branchId: true, customRoleId: true, createdAt: true,
        customRole: { select: { id: true, name: true, permissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createStaff(
    companyId: string,
    data: { phone: string; fullName: string; password: string; roleType: string; branchId?: string; customRoleId?: string }
  ) {
    const builtInRoles: RoleType[] = [RoleType.MANAGER, RoleType.SALES, RoleType.DELIVERY, RoleType.SELLER, RoleType.CUSTOM];
    const isCustom = data.roleType === RoleType.CUSTOM;

    if (!builtInRoles.includes(data.roleType as RoleType)) {
      throw new BadRequestException("Invalid role type");
    }
    if (isCustom && !data.customRoleId) {
      throw new BadRequestException("customRoleId required for CUSTOM role");
    }
    if (data.customRoleId) {
      const roleExists = await this.prisma.customRole.findFirst({ where: { id: data.customRoleId, companyId } });
      if (!roleExists) throw new BadRequestException("Custom role not found");
    }

    await this.planLimits.checkUserLimit(companyId);

    const existing = await this.prisma.user.findUnique({ where: { phone: data.phone } });
    if (existing) throw new BadRequestException("Phone already registered");

    const passwordHash = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        phone: data.phone,
        fullName: data.fullName,
        passwordHash,
        roleType: isCustom ? RoleType.CUSTOM : (data.roleType as RoleType),
        companyId,
        branchId: data.branchId || null,
        customRoleId: data.customRoleId || null,
      },
      select: {
        id: true, phone: true, fullName: true, roleType: true,
        branchId: true, customRoleId: true, createdAt: true,
        customRole: { select: { id: true, name: true, permissions: true } },
      },
    });
  }

  async updateStaff(
    companyId: string,
    userId: string,
    data: { phone?: string; fullName?: string; roleType?: string; branchId?: string; customRoleId?: string }
  ) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, companyId } });
    if (!user) throw new NotFoundException("User not found");
    if (user.roleType === RoleType.OWNER || user.roleType === RoleType.SUPER_ADMIN) {
      throw new BadRequestException("Cannot edit owner or super admin");
    }
    if (data.phone && data.phone !== user.phone) {
      const existing = await this.prisma.user.findFirst({ where: { phone: data.phone, deletedAt: null } });
      if (existing) throw new BadRequestException("Bu telefon raqam allaqachon ishlatilmoqda");
    }
    const updateData: any = {};
    if (data.phone) updateData.phone = data.phone;
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.roleType) updateData.roleType = data.roleType as RoleType;
    if (data.branchId !== undefined) updateData.branchId = data.branchId || null;
    if (data.customRoleId !== undefined) updateData.customRoleId = data.customRoleId || null;
    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true, phone: true, fullName: true, roleType: true,
        branchId: true, customRoleId: true, createdAt: true,
        customRole: { select: { id: true, name: true, permissions: true } },
      },
    });
  }

  async deactivateStaff(companyId: string, userId: string) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, companyId } });
    if (!user) throw new NotFoundException("User not found");
    if (user.roleType === RoleType.OWNER || user.roleType === RoleType.SUPER_ADMIN) {
      throw new BadRequestException("Cannot deactivate owner or super admin");
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  // ── Custom roles ──────────────────────────────────────────────────────────

  async getCustomRoles(companyId: string) {
    return this.prisma.customRole.findMany({
      where: { companyId },
      include: { _count: { select: { users: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  async createCustomRole(companyId: string, data: { name: string; permissions: Record<string, boolean> }) {
    if (!data.name?.trim()) throw new BadRequestException("Role name required");
    const exists = await this.prisma.customRole.findFirst({ where: { companyId, name: data.name.trim() } });
    if (exists) throw new BadRequestException("Role with this name already exists");

    return this.prisma.customRole.create({
      data: {
        companyId,
        name: data.name.trim(),
        permissions: data.permissions ?? {},
      },
    });
  }

  async updateCustomRole(companyId: string, roleId: string, data: { name?: string; permissions?: Record<string, boolean> }) {
    const role = await this.prisma.customRole.findFirst({ where: { id: roleId, companyId } });
    if (!role) throw new NotFoundException("Role not found");
    return this.prisma.customRole.update({
      where: { id: roleId },
      data: { name: data.name?.trim(), permissions: data.permissions },
    });
  }

  async deleteCustomRole(companyId: string, roleId: string) {
    const role = await this.prisma.customRole.findFirst({ where: { id: roleId, companyId }, include: { _count: { select: { users: true } } } });
    if (!role) throw new NotFoundException("Role not found");
    if ((role as any)._count.users > 0) throw new BadRequestException("Cannot delete role with assigned users");
    return this.prisma.customRole.delete({ where: { id: roleId } });
  }

  async getBackup(companyId: string) {
    const [company, dealers, products, orders, payments, expenses, branches, staff] = await Promise.all([
      this.prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true, name: true, slug: true, website: true, instagram: true, telegram: true, subscriptionPlan: true, createdAt: true },
      }),
      this.prisma.dealer.findMany({ where: { companyId, deletedAt: null }, orderBy: { createdAt: 'asc' } }),
      this.prisma.product.findMany({ where: { companyId, deletedAt: null }, orderBy: { createdAt: 'asc' } }),
      this.prisma.order.findMany({
        where: { companyId, deletedAt: null },
        orderBy: { createdAt: 'asc' },
        include: { dealer: { select: { name: true, phone: true } } },
      }),
      this.prisma.payment.findMany({ where: { companyId, deletedAt: null }, orderBy: { createdAt: 'asc' } }),
      this.prisma.expense.findMany({ where: { companyId, deletedAt: null }, orderBy: { createdAt: 'asc' } }),
      this.prisma.branch.findMany({ where: { companyId }, orderBy: { createdAt: 'asc' } }),
      this.prisma.user.findMany({
        where: { companyId, isActive: true },
        select: { id: true, phone: true, fullName: true, roleType: true, createdAt: true },
      }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      company,
      summary: {
        dealers: dealers.length,
        products: products.length,
        orders: orders.length,
        payments: payments.length,
        expenses: expenses.length,
        branches: branches.length,
        staff: staff.length,
      },
      dealers,
      products,
      orders,
      payments,
      expenses,
      branches,
      staff,
    };
  }

  async getFeatureFlags(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { subscriptionPlan: true },
    });

    const flags = await this.prisma.featureFlag.findMany({
      where: {
        OR: [{ companyId }, { companyId: null }],
      },
    });

    // Default plan-based capabilities
    const plan = company?.subscriptionPlan || "FREE";
    const capabilities = {
      multiBranch: plan === "PRO" || plan === "PREMIUM",
      customTG: plan === "PREMIUM",
      apiAccess: plan === "PREMIUM",
      advanceAnalytics: plan === "PRO" || plan === "PREMIUM",
      bulkImport: plan !== "FREE",
    };

    // Override with explicit flags
    flags.forEach((f) => {
      (capabilities as any)[f.featureKey] = f.isEnabled;
    });

    return capabilities;
  }
}
