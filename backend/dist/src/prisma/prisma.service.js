"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    async onModuleInit() {
        await this.$connect();
        await this._applySchemaPatches();
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
                if (params.action === "create" && params.args.data?.companyId) {
                    const company = await this.company.findUnique({
                        where: { id: params.args.data.companyId },
                        select: { subscriptionPlan: true, isDemo: true },
                    });
                    if (company?.subscriptionPlan === client_1.SubscriptionPlan.FREE ||
                        company?.isDemo) {
                        const modelName = (params.model || "").toLowerCase();
                        const limit = company.isDemo ? 30 : 50;
                        const count = await this[modelName].count({
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
                if (params.action === "delete") {
                    params.action = "update";
                    params.args["data"] = { deletedAt: new Date() };
                }
                if (params.action === "deleteMany") {
                    params.action = "updateMany";
                    if (params.args.data !== undefined) {
                        params.args.data["deletedAt"] = new Date();
                    }
                    else {
                        params.args["data"] = { deletedAt: new Date() };
                    }
                }
                if (["findUnique", "findFirst", "findMany", "count"].includes(params.action)) {
                    if (params.args.where) {
                        if (params.args.where.deletedAt === undefined) {
                            params.args.where["deletedAt"] = null;
                            if (params.action === "findUnique") {
                                params.action = "findFirst";
                            }
                        }
                    }
                    else {
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
    async _applySchemaPatches() {
        const patches = [
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
            `ALTER TABLE "Dealer" ADD COLUMN IF NOT EXISTS "region" TEXT`,
            `ALTER TABLE "Dealer" ADD COLUMN IF NOT EXISTS "district" TEXT`,
            `ALTER TABLE "Dealer" ADD COLUMN IF NOT EXISTS "contactPhone" TEXT`,
            `ALTER TABLE "SupportMessage" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT`,
            `ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "contactPhone" TEXT`,
            `ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "contactAddress" TEXT`,
            `ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "botPaused" BOOLEAN DEFAULT FALSE`,
            `ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "botAutoSchedule" BOOLEAN DEFAULT TRUE`,
            `ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "logGroupChatId" TEXT`,
            `ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "orderGroupChatId" TEXT`,
        ];
        for (const sql of patches) {
            try {
                await this.$executeRawUnsafe(sql);
            }
            catch {
            }
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)()
], PrismaService);
//# sourceMappingURL=prisma.service.js.map