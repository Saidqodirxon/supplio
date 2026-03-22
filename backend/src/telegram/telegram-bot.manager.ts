import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { Telegraf } from "telegraf";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionPlan } from "@prisma/client";

/**
 * Enterprise Multi-Bot Manager (v2.0)
 *
 * Dynamically handles shared Market Bot for (FREE/START/PRO)
 * and Dedicated Custom Bots for (PREMIUM) Enterprise clients.
 */
@Injectable()
export class TelegramBotManager implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramBotManager.name);
  private sharedBot: Telegraf | null = null;
  private dedicatedInstances: Map<string, Telegraf> = new Map();

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    this.logger.log("Enterprise Bot Manager: Initializing Shared Core...");
    await this._initSharedBot();
    await this._syncCustomBots();
  }

  /**
   * Initializes the Supplio Market Bot (Shared Instance)
   */
  private async _initSharedBot() {
    const token = process.env.SUPPLIO_MARKET_BOT_TOKEN;
    if (!token) {
      this.logger.warn(
        "Shared Market Bot Token Missing. Standard bots disabled."
      );
      return;
    }

    this.sharedBot = new Telegraf(token);
    this.sharedBot.use(async (ctx, next) => {
      // Logic to resolve companyId from User-Telegram mapping
      return next();
    });

    this.sharedBot.command("status", (ctx) =>
      ctx.reply("System: ONLINE | Plan: Shared")
    );
    this.sharedBot
      .launch()
      .catch((err) => this.logger.error("Failed to launch Shared Bot", err));
  }

  /**
   * Synchronizes PREMIUM client custom bots from Database.
   */
  private async _syncCustomBots() {
    const customBots = await (this.prisma as any).customBot.findMany({
      where: { isActive: true, deletedAt: null },
      include: { company: true },
    });

    for (const botRecord of customBots) {
      if (botRecord.company.subscriptionPlan === SubscriptionPlan.PREMIUM) {
        await this.attachCustomBot(botRecord.companyId, botRecord.token);
      }
    }
  }

  /**
   * Attaches a dedicated Telegraf instance for a PREMIUM company.
   */
  async attachCustomBot(companyId: string, token: string) {
    if (this.dedicatedInstances.has(companyId)) return;

    this.logger.log(`Provisioning Dedicated Bot for Company: ${companyId}`);

    const bot = new Telegraf(token);
    bot.command("start", (ctx) =>
      ctx.reply(
        "🌟 Dedicated Enterprise Bot for SUPPLIO is READY. No watermark mode."
      )
    );

    // Feature Flag Check: AI Assistant (If PREMIUM + Ai Flag Enabled)
    // bot.on('text', async (ctx) => { if (await this.features.isEnabled(companyId, 'ai_summary')) ... });

    bot.launch();
    this.dedicatedInstances.set(companyId, bot);
  }

  async onModuleDestroy() {
    this.logger.log("Graceful Bot Shutdown: Terminating all instances...");
    if (this.sharedBot) this.sharedBot.stop();
    for (const bot of this.dedicatedInstances.values()) {
      bot.stop();
    }
  }
}
