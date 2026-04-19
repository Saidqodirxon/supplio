"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TelegramLoggerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramLoggerService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const telegraf_1 = require("telegraf");
let TelegramLoggerService = TelegramLoggerService_1 = class TelegramLoggerService {
    constructor() {
        this.logger = new common_1.Logger(TelegramLoggerService_1.name);
        this.logBot = null;
        this.logChatId = null;
        this.backupBot = null;
        this.backupChatId = null;
    }
    onModuleInit() {
        const logToken = process.env.LOG_BOT_TOKEN;
        this.logChatId = process.env.LOG_CHAT_ID ?? null;
        if (logToken && this.logChatId) {
            try {
                this.logBot = new telegraf_1.Telegraf(logToken);
                this.logger.log('✅ Super-admin Log Bot initialized');
            }
            catch (e) {
                this.logger.error('Log Bot init failed: ' + e?.message);
            }
        }
        else {
            this.logger.warn('LOG_BOT_TOKEN or LOG_CHAT_ID not set — log notifications disabled');
        }
        const backupToken = process.env.BACKUP_BOT_TOKEN ?? logToken;
        this.backupChatId = process.env.BACKUP_CHAT_ID ?? this.logChatId;
        if (backupToken && this.backupChatId) {
            try {
                this.backupBot = new telegraf_1.Telegraf(backupToken);
                this.logger.log('✅ Super-admin Backup Bot initialized');
            }
            catch (e) {
                this.logger.error('Backup Bot init failed: ' + e?.message);
            }
        }
        else {
            this.logger.warn('BACKUP_BOT_TOKEN or BACKUP_CHAT_ID not set — backup notifications disabled');
        }
    }
    async sendToLog(text) {
        if (!this.logBot || !this.logChatId)
            return;
        try {
            await this.logBot.telegram.sendMessage(this.logChatId, text, { parse_mode: 'Markdown' });
        }
        catch {
        }
    }
    async sendDocumentToBackup(filePath, fileName, caption) {
        if (!this.backupBot || !this.backupChatId)
            return;
        if (!fs.existsSync(filePath))
            return;
        try {
            await this.backupBot.telegram.sendDocument(this.backupChatId, { source: fs.createReadStream(filePath), filename: fileName }, { caption, parse_mode: 'Markdown' });
        }
        catch (e) {
            this.logger.warn('Backup send failed: ' + e?.message);
        }
    }
    async sendLog(level, message, meta) {
        const icon = level === 'ERROR' ? '🔴' : level === 'WARN' ? '🟡' : '🟢';
        const metaLines = meta
            ? '\n' + Object.entries(meta)
                .filter(([, v]) => v !== undefined && v !== null)
                .map(([k, v]) => `• ${k}: \`${v}\``)
                .join('\n')
            : '';
        const time = new Date().toLocaleString('uz-UZ');
        await this.sendToLog(`${icon} *[${level}]* ${time}\n\n${message}${metaLines}\n#LOG`);
    }
    async sendError(context, error, extra) {
        const msg = error instanceof Error ? error.message : error;
        await this.sendLog('ERROR', `*${context}*\n${msg}`, extra);
    }
    async sendOrderNotification(order) {
        const text = `🛍 *Yangi buyurtma!* #ORDER\n\n` +
            `🏢 Kompaniya: *${order.companyName}*\n` +
            `👤 Diler: *${order.dealerName}*\n` +
            `💰 Summa: *${order.totalAmount.toLocaleString()} so'm*\n` +
            `📦 Mahsulotlar: *${order.itemCount} ta*\n` +
            `🆔 ID: \`${order.id.slice(-8).toUpperCase()}\`\n` +
            `📅 ${new Date().toLocaleString('uz-UZ')}`;
        await this.sendToLog(text);
    }
    async sendDealerApprovalRequest(dealer) {
        const text = `👤 *Yangi diler so'rovi!* #DEALER\n\n` +
            `🏢 Kompaniya: *${dealer.companyName}*\n` +
            `👤 Ism: *${dealer.name}*\n` +
            `📞 Telefon: *${dealer.phone}*\n` +
            `⏳ Tasdiqlash kutilmoqda`;
        await this.sendToLog(text);
    }
    async sendLeadNotification(lead) {
        const text = `🚀 *Yangi Lead!* #LEAD\n\n` +
            `👤 Ism: *${lead.fullName}*\n` +
            `📞 Telefon: *${lead.phone}*\n` +
            (lead.info ? `📝 Info: ${lead.info}\n` : '') +
            `📅 ${new Date().toLocaleString('uz-UZ')}`;
        await this.sendToLog(text);
    }
    async sendPasswordResetNotification(data) {
        const text = `🔑 *Parol o'zgartirildi* #RESET\n\n` +
            `👤 Foydalanuvchi: *${data.userFullName}*\n` +
            `🏢 Kompaniya: *${data.companyName}*\n` +
            `📞 Telefon: *${data.phone}*\n` +
            `📅 ${new Date().toLocaleString('uz-UZ')}`;
        await this.sendToLog(text);
    }
    async sendTariffUpgradeNotification(data) {
        const text = `🎯 *Tarif yangilandi!* #TARIFF\n\n` +
            `🏢 Kompaniya: *${data.companyName}*\n` +
            `📦 ${data.oldPlan} → *${data.newPlan}*\n` +
            `📅 ${new Date().toLocaleString('uz-UZ')}`;
        await this.sendToLog(text);
    }
    async sendDailyReportSummary(data) {
        const text = `📊 *Kunlik hisobot — ${data.companyName}* #REPORT\n\n` +
            `📦 Bugungi buyurtmalar: *${data.todayOrders}* (jami: ${data.totalOrders})\n` +
            `💰 Bugungi tushum: *${data.todayRevenue.toLocaleString()} so'm*\n` +
            `⏳ Kutilayotgan: *${data.pendingOrders}* ta\n` +
            `👥 Faol dilerlar: *${data.totalDealers}*\n` +
            `📅 ${new Date().toLocaleString('uz-UZ')}`;
        await this.sendToLog(text);
    }
    async sendBackupFile(filePath, fileName, label = 'Full Backup') {
        const stats = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
        const sizeKb = stats ? (stats.size / 1024).toFixed(1) : '?';
        const caption = `💾 *${label}* #BACKUP\n` +
            `📄 ${fileName}\n` +
            `📦 ${sizeKb} KB\n` +
            `📅 ${new Date().toLocaleString('uz-UZ')}`;
        await this.sendDocumentToBackup(filePath, fileName, caption);
    }
};
exports.TelegramLoggerService = TelegramLoggerService;
exports.TelegramLoggerService = TelegramLoggerService = TelegramLoggerService_1 = __decorate([
    (0, common_1.Injectable)()
], TelegramLoggerService);
//# sourceMappingURL=telegram-logger.service.js.map