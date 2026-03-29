import { Injectable, Logger, HttpException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

interface PlanLimits {
  maxBranches: number;
  maxUsers: number;
  maxCustomBots: number;
  maxDealers: number;
  maxProducts: number;
  allowCustomBot: boolean;
  allowWebStore: boolean;
  allowAnalytics: boolean;
  allowNotifications: boolean;
  allowMultiCompany: boolean;
  allowBulkImport: boolean;
}

interface TariffPlanLimitsRow extends PlanLimits {}

const DEFAULT_LIMITS: PlanLimits = {
  maxBranches: 1,
  maxUsers: 5,
  maxCustomBots: 0,
  maxDealers: 50,
  maxProducts: 200,
  allowCustomBot: false,
  allowWebStore: true,
  allowAnalytics: false,
  allowNotifications: true,
  allowMultiCompany: false,
  allowBulkImport: false,
};

@Injectable()
export class PlanLimitsService {
  private readonly logger = new Logger(PlanLimitsService.name);

  constructor(private prisma: PrismaService) {}

  async getLimitsForCompany(companyId: string): Promise<PlanLimits> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { subscriptionPlan: true },
    });

    if (!company) return DEFAULT_LIMITS;

    const rows = await this.prisma.$queryRaw<TariffPlanLimitsRow[]>`
      SELECT
        "maxBranches",
        "maxUsers",
        COALESCE("maxCustomBots", 0) AS "maxCustomBots",
        "maxDealers",
        "maxProducts",
        "allowCustomBot",
        "allowWebStore",
        "allowAnalytics",
        "allowNotifications",
        "allowMultiCompany",
        "allowBulkImport"
      FROM "TariffPlan"
      WHERE "planKey" = ${company.subscriptionPlan}
      LIMIT 1
    `;
    const plan = rows[0] ?? null;

    if (!plan) {
      this.logger.warn(`No TariffPlan found for planKey=${company.subscriptionPlan}, using defaults`);
      return DEFAULT_LIMITS;
    }

    return {
      maxBranches: plan.maxBranches,
      maxUsers: plan.maxUsers,
      maxCustomBots: plan.maxCustomBots,
      maxDealers: plan.maxDealers,
      maxProducts: plan.maxProducts,
      allowCustomBot: plan.allowCustomBot,
      allowWebStore: plan.allowWebStore,
      allowAnalytics: plan.allowAnalytics,
      allowNotifications: plan.allowNotifications,
      allowMultiCompany: plan.allowMultiCompany,
      allowBulkImport: plan.allowBulkImport,
    };
  }

  private getResourceLabel(resource: string): string {
    const labels: Record<string, string> = {
      branches: "Branch",
      users: "Staff",
      dealers: "Dealer",
      products: "Product",
      customBot: "Telegram bot",
      allowAnalytics: "Analytics",
      allowWebStore: "Web store",
      allowNotifications: "Notifications",
      allowMultiCompany: "Multi-company",
      allowBulkImport: "Bulk import",
    };
    return labels[resource] || resource;
  }

  private limitError(resource: string, max: number, type: "limit" | "feature" = "limit"): never {
    const label = this.getResourceLabel(resource);
    const message =
      type === "feature"
        ? `${label} is not available on your current plan. Please upgrade your tariff.`
        : max > 0
          ? `${label} limit reached. Your current plan allows up to ${max}. Please upgrade your tariff.`
          : `${label} is not available on your current plan. Please upgrade your tariff.`;

    throw new HttpException(
      { message, limitReached: true, resource, max, code: "PLAN_LIMIT_REACHED" },
      402,
    );
  }

  async checkBranchLimit(companyId: string) {
    const limits = await this.getLimitsForCompany(companyId);
    const count = await this.prisma.branch.count({ where: { companyId, deletedAt: null } });
    if (count >= limits.maxBranches) this.limitError('branches', limits.maxBranches);
  }

  async checkUserLimit(companyId: string) {
    const limits = await this.getLimitsForCompany(companyId);
    const count = await this.prisma.user.count({ where: { companyId, deletedAt: null } });
    if (count >= limits.maxUsers) this.limitError('users', limits.maxUsers);
  }

  async checkDealerLimit(companyId: string) {
    const limits = await this.getLimitsForCompany(companyId);
    const count = await this.prisma.dealer.count({ where: { companyId, deletedAt: null } });
    if (count >= limits.maxDealers) this.limitError('dealers', limits.maxDealers);
  }

  async checkProductLimit(companyId: string) {
    const limits = await this.getLimitsForCompany(companyId);
    const count = await this.prisma.product.count({ where: { companyId, deletedAt: null } });
    if (count >= limits.maxProducts) this.limitError('products', limits.maxProducts);
  }

  async checkBotAllowed(companyId: string) {
    const limits = await this.getLimitsForCompany(companyId);
    if (!limits.allowCustomBot) this.limitError('customBot', 0, 'feature');
  }

  async checkBotLimit(companyId: string) {
    const limits = await this.getLimitsForCompany(companyId);
    if (!limits.allowCustomBot || limits.maxCustomBots <= 0) {
      this.limitError('customBot', limits.maxCustomBots, 'feature');
    }

    const count = await this.prisma.customBot.count({
      where: { companyId, deletedAt: null },
    });
    if (count >= limits.maxCustomBots) this.limitError('customBot', limits.maxCustomBots);
  }

  async checkFeatureAllowed(companyId: string, feature: keyof PlanLimits) {
    const limits = await this.getLimitsForCompany(companyId);
    if (!limits[feature]) this.limitError(feature, 0, 'feature');
  }
}
