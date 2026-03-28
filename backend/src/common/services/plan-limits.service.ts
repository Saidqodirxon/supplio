import { Injectable, Logger, HttpException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

interface PlanLimits {
  maxBranches: number;
  maxUsers: number;
  maxDealers: number;
  maxProducts: number;
  allowCustomBot: boolean;
  allowWebStore: boolean;
  allowAnalytics: boolean;
  allowNotifications: boolean;
  allowMultiCompany: boolean;
  allowBulkImport: boolean;
}

const DEFAULT_LIMITS: PlanLimits = {
  maxBranches: 1,
  maxUsers: 5,
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

    const plan = await this.prisma.tariffPlan.findUnique({
      where: { planKey: company.subscriptionPlan },
    });

    if (!plan) {
      this.logger.warn(`No TariffPlan found for planKey=${company.subscriptionPlan}, using defaults`);
      return DEFAULT_LIMITS;
    }

    return {
      maxBranches: plan.maxBranches,
      maxUsers: plan.maxUsers,
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

  private limitError(resource: string, max: number): never {
    throw new HttpException(
      { message: `${resource} limit reached (${max}). Upgrade your plan.`, limitReached: true, resource },
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
    if (!limits.allowCustomBot) this.limitError('customBot', 0);
  }

  async checkFeatureAllowed(companyId: string, feature: keyof PlanLimits) {
    const limits = await this.getLimitsForCompany(companyId);
    if (!limits[feature]) this.limitError(feature, 0);
  }
}
