"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SubscriptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const telegram_bot_manager_1 = require("../telegram/telegram-bot.manager");
const client_2 = require("@prisma/client");
let SubscriptionService = SubscriptionService_1 = class SubscriptionService {
    constructor(prisma, botManager) {
        this.prisma = prisma;
        this.botManager = botManager;
        this.logger = new common_1.Logger(SubscriptionService_1.name);
    }
    async upgradeCompanyPlan(companyId, plan) {
        this.logger.log(`Subscription Engine: Upgrading company ${companyId} to ${plan}...`);
        const company = await this.prisma.company.update({
            where: { id: companyId },
            data: {
                subscriptionPlan: plan,
                subscriptionStatus: client_1.SubscriptionStatus.ACTIVE,
                trialExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });
        if (!company.dbConnectionUrl && plan !== client_1.SubscriptionPlan.FREE) {
            const tenantDbUrl = process.env.DATABASE_URL?.replace("supplio", `supplio_tenant_${company.slug}`);
            await this.prisma.company.update({
                where: { id: companyId },
                data: { dbConnectionUrl: tenantDbUrl },
            });
        }
        const owner = await this.prisma.user.findFirst({
            where: { companyId, roleType: client_2.RoleType.OWNER },
        });
        if (owner?.telegramChatId) {
        }
        if (plan === client_1.SubscriptionPlan.PREMIUM) {
            const botRecord = await this.prisma.customBot.findUnique({
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
    async collectServerMetrics() {
        const cpuUsage = Math.random() * 100;
        const ramUsage = Math.random() * 100;
        const activeUsersCount = await this.prisma.user.count({
            where: { isActive: true, deletedAt: null },
        });
        await this.prisma.serverMetric.create({
            data: {
                cpuUsage,
                ramUsage,
                activeUsers: activeUsersCount,
                timestamp: new Date(),
            },
        });
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = SubscriptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        telegram_bot_manager_1.TelegramBotManager])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map