import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import { Telegraf } from 'telegraf';

/**
 * Super-Admin notification service.
 *
 * Two separate bots:
 *   LOG bot  → LOG_BOT_TOKEN  + LOG_CHAT_ID   (activity logs, dealer requests, orders)
 *   BACKUP bot → BACKUP_BOT_TOKEN + BACKUP_CHAT_ID  (backup files)
 *
 * Hashtags make every message searchable in Telegram:
 *   #LEAD  #ORDER  #RESET  #TARIFF  #BACKUP  #LOG  #DEALER
 */
@Injectable()
export class TelegramLoggerService implements OnModuleInit {
  private readonly logger = new Logger(TelegramLoggerService.name);

  private logBot: Telegraf | null = null;
  private logChatId: string | null = null;

  private backupBot: Telegraf | null = null;
  private backupChatId: string | null = null;

  onModuleInit() {
    const logToken = process.env.LOG_BOT_TOKEN;
    this.logChatId = process.env.LOG_CHAT_ID ?? null;
    if (logToken && this.logChatId) {
      try {
        this.logBot = new Telegraf(logToken);
        this.logger.log('✅ Super-admin Log Bot initialized');
      } catch (e: any) {
        this.logger.error('Log Bot init failed: ' + e?.message);
      }
    } else {
      this.logger.warn('LOG_BOT_TOKEN or LOG_CHAT_ID not set — log notifications disabled');
    }

    const backupToken = process.env.BACKUP_BOT_TOKEN ?? logToken;
    this.backupChatId = process.env.BACKUP_CHAT_ID ?? this.logChatId;
    if (backupToken && this.backupChatId) {
      try {
        this.backupBot = new Telegraf(backupToken);
        this.logger.log('✅ Super-admin Backup Bot initialized');
      } catch (e: any) {
        this.logger.error('Backup Bot init failed: ' + e?.message);
      }
    } else {
      this.logger.warn('BACKUP_BOT_TOKEN or BACKUP_CHAT_ID not set — backup notifications disabled');
    }
  }

  // ─── Core send helpers ────────────────────────────────────────────────────

  private async sendToLog(text: string) {
    if (!this.logBot || !this.logChatId) return;
    try {
      await this.logBot.telegram.sendMessage(this.logChatId, text, { parse_mode: 'Markdown' });
    } catch {
      // Silently fail — log bot must never crash the main app
    }
  }

  private async sendDocumentToBackup(filePath: string, fileName: string, caption: string) {
    if (!this.backupBot || !this.backupChatId) return;
    if (!fs.existsSync(filePath)) return;
    try {
      await this.backupBot.telegram.sendDocument(
        this.backupChatId,
        { source: fs.createReadStream(filePath), filename: fileName },
        { caption, parse_mode: 'Markdown' },
      );
    } catch (e: any) {
      this.logger.warn('Backup send failed: ' + e?.message);
    }
  }

  // ─── Generic log (kept for backwards-compat) ─────────────────────────────

  async sendLog(level: 'INFO' | 'WARN' | 'ERROR', message: string, meta?: Record<string, unknown>) {
    const icon = level === 'ERROR' ? '🔴' : level === 'WARN' ? '🟡' : '🟢';
    const metaStr = meta ? '\n\n```json\n' + JSON.stringify(meta, null, 2).slice(0, 800) + '\n```' : '';
    await this.sendToLog(`${icon} *[${level}]* ${new Date().toISOString()}\n\n${message}${metaStr} #LOG`);
  }

  async sendError(context: string, error: Error | string, extra?: Record<string, unknown>) {
    const msg = error instanceof Error ? error.message : error;
    await this.sendLog('ERROR', `*${context}*\n${msg}`, extra);
  }

  // ─── Dealer / order events (sent to log chat) ─────────────────────────────

  async sendOrderNotification(order: {
    id: string;
    companyName: string;
    dealerName: string;
    totalAmount: number;
    itemCount: number;
  }) {
    const text =
      `🛍 *Yangi buyurtma!* #ORDER\n\n` +
      `🏢 Kompaniya: *${order.companyName}*\n` +
      `👤 Diler: *${order.dealerName}*\n` +
      `💰 Summa: *${order.totalAmount.toLocaleString()} so'm*\n` +
      `📦 Mahsulotlar: *${order.itemCount} ta*\n` +
      `🆔 ID: \`${order.id.slice(-8).toUpperCase()}\`\n` +
      `📅 ${new Date().toLocaleString('uz-UZ')}`;
    await this.sendToLog(text);
  }

  async sendDealerApprovalRequest(dealer: {
    name: string;
    phone: string;
    companyName: string;
  }) {
    const text =
      `👤 *Yangi diler so'rovi!* #DEALER\n\n` +
      `🏢 Kompaniya: *${dealer.companyName}*\n` +
      `👤 Ism: *${dealer.name}*\n` +
      `📞 Telefon: *${dealer.phone}*\n` +
      `⏳ Tasdiqlash kutilmoqda`;
    await this.sendToLog(text);
  }

  // ─── Super-admin events ───────────────────────────────────────────────────

  async sendLeadNotification(lead: {
    fullName: string;
    phone: string;
    info?: string;
  }) {
    const text =
      `🚀 *Yangi Lead!* #LEAD\n\n` +
      `👤 Ism: *${lead.fullName}*\n` +
      `📞 Telefon: *${lead.phone}*\n` +
      (lead.info ? `📝 Info: ${lead.info}\n` : '') +
      `📅 ${new Date().toLocaleString('uz-UZ')}`;
    await this.sendToLog(text);
  }

  async sendPasswordResetNotification(data: {
    userFullName: string;
    companyName: string;
    phone: string;
  }) {
    const text =
      `🔑 *Parol o'zgartirildi* #RESET\n\n` +
      `👤 Foydalanuvchi: *${data.userFullName}*\n` +
      `🏢 Kompaniya: *${data.companyName}*\n` +
      `📞 Telefon: *${data.phone}*\n` +
      `📅 ${new Date().toLocaleString('uz-UZ')}`;
    await this.sendToLog(text);
  }

  async sendTariffUpgradeNotification(data: {
    companyName: string;
    oldPlan: string;
    newPlan: string;
  }) {
    const text =
      `🎯 *Tarif yangilandi!* #TARIFF\n\n` +
      `🏢 Kompaniya: *${data.companyName}*\n` +
      `📦 ${data.oldPlan} → *${data.newPlan}*\n` +
      `📅 ${new Date().toLocaleString('uz-UZ')}`;
    await this.sendToLog(text);
  }

  // ─── Backup file (sent to backup chat) ───────────────────────────────────

  async sendBackupFile(filePath: string, fileName: string, label = 'Full Backup') {
    const stats = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
    const sizeKb = stats ? (stats.size / 1024).toFixed(1) : '?';
    const caption =
      `💾 *${label}* #BACKUP\n` +
      `📄 ${fileName}\n` +
      `📦 ${sizeKb} KB\n` +
      `📅 ${new Date().toLocaleString('uz-UZ')}`;
    await this.sendDocumentToBackup(filePath, fileName, caption);
  }
}
