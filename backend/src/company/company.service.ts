import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

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
      "siteActive",
      "cashbackPercent",
    ];
    const filteredData: any = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        filteredData[field] = data[field];
      }
    }

    return this.prisma.company.update({
      where: { id: companyId },
      data: filteredData,
    });
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
      select: { id: true, phone: true, fullName: true, roleType: true, branchId: true },
      orderBy: { createdAt: "desc" },
    });
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
