import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramLoggerService implements OnModuleInit {
  private readonly logger = new Logger(TelegramLoggerService.name);
  private bot: Telegraf | null = null;
  private chatId: string | null = null;

  onModuleInit() {
    const token = process.env.LOG_BOT_TOKEN;
    this.chatId = process.env.LOG_CHAT_ID || null;

    if (!token || !this.chatId) {
      this.logger.warn('LOG_BOT_TOKEN or LOG_CHAT_ID not set — Telegram logging disabled');
      return;
    }

    try {
      this.bot = new Telegraf(token);
      this.logger.log('✅ Telegram Log Bot initialized');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.error('Failed to init log bot: ' + msg);
    }
  }

  async sendLog(level: 'INFO' | 'WARN' | 'ERROR', message: string, meta?: Record<string, unknown>) {
    if (!this.bot || !this.chatId) return;

    const icon = level === 'ERROR' ? '🔴' : level === 'WARN' ? '🟡' : '🟢';
    const metaStr = meta ? '\n\n```json\n' + JSON.stringify(meta, null, 2).slice(0, 800) + '\n```' : '';
    const text = `${icon} *[${level}]* ${new Date().toISOString()}\n\n${message}${metaStr}`;

    try {
      await this.bot.telegram.sendMessage(this.chatId, text, { parse_mode: 'Markdown' });
    } catch {
      // Silently fail — log bot should never crash the main app
    }
  }

  async sendOrderNotification(order: {
    id: string;
    companyName: string;
    dealerName: string;
    totalAmount: number;
    itemCount: number;
  }) {
    if (!this.bot || !this.chatId) return;
    const text =
      `🛍 *Yangi buyurtma!*\n\n` +
      `🏢 Kompaniya: *${order.companyName}*\n` +
      `👤 Diler: *${order.dealerName}*\n` +
      `💰 Summa: *${order.totalAmount.toLocaleString()} so'm*\n` +
      `📦 Mahsulotlar: *${order.itemCount} ta*\n` +
      `🆔 ID: \`${order.id.slice(-8).toUpperCase()}\`\n` +
      `📅 ${new Date().toLocaleString('uz-UZ')}`;

    try {
      await this.bot.telegram.sendMessage(this.chatId, text, { parse_mode: 'Markdown' });
    } catch {
      // Silently fail
    }
  }

  async sendDealerApprovalRequest(dealer: {
    name: string;
    phone: string;
    companyName: string;
  }) {
    if (!this.bot || !this.chatId) return;
    const text =
      `👤 *Yangi diler so'rovi!*\n\n` +
      `🏢 Kompaniya: *${dealer.companyName}*\n` +
      `👤 Ism: *${dealer.name}*\n` +
      `📞 Telefon: *${dealer.phone}*\n` +
      `⏳ Tasdiqlash kutilmoqda`;

    try {
      await this.bot.telegram.sendMessage(this.chatId, text, { parse_mode: 'Markdown' });
    } catch {
      // Silently fail
    }
  }

  async sendError(context: string, error: Error | string, extra?: Record<string, unknown>) {
    const msg = error instanceof Error ? error.message : error;
    await this.sendLog('ERROR', `*${context}*\n${msg}`, extra);
  }
}
