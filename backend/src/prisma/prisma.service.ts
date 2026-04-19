import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient, SubscriptionPlan } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    await this._applySchemaPatches();

    // -------------------------------------------------------------------------
    // Enterprise Middleware Layer: Soft Delete + Quota Guard + Multi-Tenancy
    // -------------------------------------------------------------------------
    this.$use(async (params, next) => {
      const modelsWithSoftDelete = [
        "Company",
        "Branch",
        "User",
        "Dealer",
        "Product",
        "Order",
        "LedgerTransaction",
        "Payment",
        "Expense",
        "CustomBot",
        "FeatureFlag",
        "Notification",
        "Lead",
      ];

      if (modelsWithSoftDelete.includes(params.model || "")) {
        // 1. Quota Guard for FREE/DEMO tenants (Enterprise Requirement 11)
        if (params.action === "create" && params.args.data?.companyId) {
          const company = await this.company.findUnique({
            where: { id: params.args.data.companyId },
            select: { subscriptionPlan: true, isDemo: true },
          });

          if (
            company?.subscriptionPlan === SubscriptionPlan.FREE ||
            company?.isDemo
          ) {
            const modelName = (params.model || "").toLowerCase();
            const limit = company.isDemo ? 30 : 50;
            const count = await (this as any)[modelName].count({
              where: { companyId: params.args.data.companyId, deletedAt: null },
            });

            if (count >= limit) {
              const msg = company.isDemo
                ? "DEMO_LIMIT: Demo environments are restricted to 30 records for testing."
                : "FREE_QUOTA_EXCEEDED: Trial accounts are limited to 50 records per type. Please upgrade.";
              throw new Error(msg);
            }
          }
        }

        // 2. Soft Delete Protocol (Enterprise Requirement 6)
        if (params.action === "delete") {
          params.action = "update";
          params.args["data"] = { deletedAt: new Date() };
        }

        if (params.action === "deleteMany") {
          params.action = "updateMany";
          if (params.args.data !== undefined) {
            params.args.data["deletedAt"] = new Date();
          } else {
            params.args["data"] = { deletedAt: new Date() };
          }
        }

        // 3. Automatic Soft-Delete Filtering
        // Ensures that soft-deleted items don't appear in UI analytics or lists
        if (
          ["findUnique", "findFirst", "findMany", "count"].includes(
            params.action
          )
        ) {
          if (params.args.where) {
            if (params.args.where.deletedAt === undefined) {
              params.args.where["deletedAt"] = null;
              // Conversion: findUnique only supports unique fields.
              // We convert to findFirst to allow the deletedAt filter.
              if (params.action === "findUnique") {
                params.action = "findFirst";
              }
            }
          } else {
            params.args["where"] = { deletedAt: null };
            if (params.action === "findUnique") {
              params.action = "findFirst";
            }
          }
        }
      }

      return next(params);
    });
  }

  /**
   * Idempotent schema patches — runs on every startup.
   * Safe to run on both local and production: IF NOT EXISTS prevents errors.
   * Add new columns here instead of relying on manual SQL or prisma migrate.
   */
  private async _applySchemaPatches() {
    const patches: string[] = [
      // 2026-04-20: global system settings text columns may be missing on older DBs
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "maintenanceMode" BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "backupFrequency" TEXT DEFAULT 'DAILY'`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "lastBackupAt" TIMESTAMP(3)`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "defaultTrialDays" INTEGER DEFAULT 14`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "newsEnabled" BOOLEAN DEFAULT TRUE`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "superAdminPhone" TEXT`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "systemVersion" TEXT DEFAULT '1.0.0'`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "globalNotifyUz" TEXT`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "globalNotifyRu" TEXT`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "globalNotifyEn" TEXT`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "globalNotifyTr" TEXT`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "termsUz" TEXT`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "termsRu" TEXT`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "termsEn" TEXT`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "termsUzCyr" TEXT`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "privacyUz" TEXT`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "privacyRu" TEXT`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "privacyEn" TEXT`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "privacyUzCyr" TEXT`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "contractUz" TEXT`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "contractRu" TEXT`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "contractEn" TEXT`,
      `ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "contractUzCyr" TEXT`,
      `ALTER TABLE "LandingContent" ADD COLUMN IF NOT EXISTS "supportTelegramUsername" TEXT`,
      // 2026-04-13: dealer registration extra fields
      `ALTER TABLE "Dealer" ADD COLUMN IF NOT EXISTS "region" TEXT`,
      `ALTER TABLE "Dealer" ADD COLUMN IF NOT EXISTS "district" TEXT`,
      `ALTER TABLE "Dealer" ADD COLUMN IF NOT EXISTS "contactPhone" TEXT`,
      // 2026-04-13: support message image attachment
      `ALTER TABLE "SupportMessage" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT`,
      // 2026-04-14: company bot working hours & contact info
      `ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "contactPhone" TEXT`,
      `ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "contactAddress" TEXT`,
      `ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "botPaused" BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "botAutoSchedule" BOOLEAN DEFAULT TRUE`,
      `ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "preparingVariants" JSONB`,
      `ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "dealerStatusLabels" JSONB`,
      // 2026-04-14: per-company telegram group notifications
      `ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "logGroupChatId" TEXT`,
      `ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "orderGroupChatId" TEXT`,
    ];

    for (const sql of patches) {
      try {
        await this.$executeRawUnsafe(sql);
      } catch {
        // column already exists or other harmless error — ignore
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
