import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient, SubscriptionPlan } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();

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

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
