import { Injectable, Logger, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { TelegramBotManager } from "../telegram/telegram-bot.manager";
import { RoleType } from "@prisma/client";

/**
 * Enterprise Subscription & Provisioning Manager
 *
 * Logic flow: Conversion -> DB Provisioning -> Group Creation -> Bot Activation.
 */
@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private prisma: PrismaService,
    private botManager: TelegramBotManager
  ) {}

  /**
   * Upgrades/Converts a Company to a specific plan (e.g. Conversion from Lead)
   */
  async upgradeCompanyPlan(companyId: string, plan: SubscriptionPlan) {
    this.logger.log(
      `Subscription Engine: Upgrading company ${companyId} to ${plan}...`
    );

    // 1. Update Core Subscription (Main DB)
    const company = await this.prisma.company.update({
      where: { id: companyId },
      data: {
        subscriptionPlan: plan,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        trialExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 Days
      },
    });

    // 2. Provision Enterprise Connection URL if not present
    if (!company.dbConnectionUrl && plan !== SubscriptionPlan.FREE) {
      const tenantDbUrl = process.env.DATABASE_URL?.replace(
        "supplio",
        `supplio_tenant_${company.slug}`
      );
      await this.prisma.company.update({
        where: { id: companyId },
        data: { dbConnectionUrl: tenantDbUrl },
      });
    }

    // 3. Logic: Create SuperAdmin + Owner Telegram Group
    const owner = await (this.prisma as any).user.findFirst({
      where: { companyId, roleType: RoleType.OWNER },
    });

    if (owner?.telegramChatId) {
      // Mocked as logic, typically calls TelegramBotManager
      // await this.telegram.createSupportGroup(owner.telegramChatId, `Supplio Support: ${company.name}`);
    }

    // 4. Feature Activation: Premium Custom Bot
    if (plan === SubscriptionPlan.PREMIUM) {
      const botRecord = await (this.prisma as any).customBot.findUnique({
        where: { companyId },
      });
      if (botRecord?.token) {
        await this.botManager.attachCustomBot(companyId, botRecord.token);
      }
    }

    return {
      success: true,
      plan: company.subscriptionPlan,
      status: company.subscriptionStatus,
    };
  }

  /**
   * System Monitoring (Module 11): Active User Metrics
   */
  async collectServerMetrics() {
    const cpuUsage = Math.random() * 100; // Mocked
    const ramUsage = Math.random() * 100; // Mocked
    const activeUsersCount = await (this.prisma as any).user.count({
      where: { isActive: true, deletedAt: null },
    });

    await (this.prisma as any).serverMetric.create({
      data: {
        cpuUsage,
        ramUsage,
        activeUsers: activeUsersCount,
        timestamp: new Date(),
      },
    });
  }
}
