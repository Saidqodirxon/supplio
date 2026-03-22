import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SubscriptionPlan } from "@prisma/client";

/**
 * Enterprise Feature Flag Engine
 *
 * Manages features based on plan levels or custom company overrides.
 */
@Injectable()
export class FeatureFlagService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if a feature is enabled for a specific company.
   * Logic: SuperAdmin Force -> Company Override -> Plan Standard.
   */
  async isEnabled(companyId: string, featureKey: string): Promise<boolean> {
    // 1. Fetch Company Level Subscription and Override
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { featureFlags: { where: { featureKey } } },
    });

    if (!company) return false;

    // 2. Check Company Specific Override (SuperAdmin set)
    if (company.featureFlags.length > 0) {
      return company.featureFlags[0].isEnabled;
    }

    // 3. Fallback to Global Plan Default for this feature
    const planDefault = await this.prisma.featureFlag.findFirst({
      where: { featureKey, companyId: null },
    });

    if (planDefault && planDefault.planLevel) {
      // If flag is restricted to PRO/PREMIUM
      return this._matchesPlan(
        company.subscriptionPlan as SubscriptionPlan,
        planDefault.planLevel
      );
    }

    return planDefault?.isEnabled || false;
  }

  private _matchesPlan(
    current: SubscriptionPlan,
    required: SubscriptionPlan
  ): boolean {
    const weights: Record<SubscriptionPlan, number> = {
      [SubscriptionPlan.FREE]: 0,
      [SubscriptionPlan.START]: 1,
      [SubscriptionPlan.PRO]: 2,
      [SubscriptionPlan.PREMIUM]: 3,
    };
    return weights[current] >= weights[required];
  }
}
