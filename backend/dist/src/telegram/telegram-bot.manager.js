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
var TelegramBotManager_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramBotManager = void 0;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TelegramBotManager = TelegramBotManager_1 = class TelegramBotManager {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(TelegramBotManager_1.name);
        this.sharedBot = null;
        this.dedicatedInstances = new Map();
    }
    async onModuleInit() {
        this.logger.log("Enterprise Bot Manager: Initializing Shared Core...");
        await this._initSharedBot();
        await this._syncCustomBots();
    }
    async _initSharedBot() {
        const token = process.env.SUPPLIO_MARKET_BOT_TOKEN;
        if (!token) {
            this.logger.warn("Shared Market Bot Token Missing. Standard bots disabled.");
            return;
        }
        this.sharedBot = new telegraf_1.Telegraf(token);
        this.sharedBot.use(async (ctx, next) => {
            return next();
        });
        this.sharedBot.command("status", (ctx) => ctx.reply("System: ONLINE | Plan: Shared"));
        this.sharedBot
            .launch()
            .catch((err) => this.logger.error("Failed to launch Shared Bot", err));
    }
    async _syncCustomBots() {
        const customBots = await this.prisma.customBot.findMany({
            where: { isActive: true, deletedAt: null },
            include: { company: true },
        });
        for (const botRecord of customBots) {
            if (botRecord.company.subscriptionPlan === client_1.SubscriptionPlan.PREMIUM) {
                await this.attachCustomBot(botRecord.companyId, botRecord.token);
            }
        }
    }
    async attachCustomBot(companyId, token) {
        if (this.dedicatedInstances.has(companyId))
            return;
        this.logger.log(`Provisioning Dedicated Bot for Company: ${companyId}`);
        const bot = new telegraf_1.Telegraf(token);
        bot.command("start", (ctx) => ctx.reply("🌟 Dedicated Enterprise Bot for SUPPLIO is READY. No watermark mode."));
        bot.launch();
        this.dedicatedInstances.set(companyId, bot);
    }
    async onModuleDestroy() {
        this.logger.log("Graceful Bot Shutdown: Terminating all instances...");
        if (this.sharedBot)
            this.sharedBot.stop();
        for (const bot of this.dedicatedInstances.values()) {
            bot.stop();
        }
    }
};
exports.TelegramBotManager = TelegramBotManager;
exports.TelegramBotManager = TelegramBotManager = TelegramBotManager_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TelegramBotManager);
//# sourceMappingURL=telegram-bot.manager.js.map