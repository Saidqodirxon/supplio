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
const telegraf_1 = require("telegraf");
let TelegramLoggerService = TelegramLoggerService_1 = class TelegramLoggerService {
    constructor() {
        this.logger = new common_1.Logger(TelegramLoggerService_1.name);
        this.bot = null;
        this.chatId = null;
    }
    onModuleInit() {
        const token = process.env.LOG_BOT_TOKEN;
        this.chatId = process.env.LOG_CHAT_ID || null;
        if (!token || !this.chatId) {
            this.logger.warn('LOG_BOT_TOKEN or LOG_CHAT_ID not set — Telegram logging disabled');
            return;
        }
        try {
            this.bot = new telegraf_1.Telegraf(token);
            this.logger.log('✅ Telegram Log Bot initialized');
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            this.logger.error('Failed to init log bot: ' + msg);
        }
    }
    async sendLog(level, message, meta) {
        if (!this.bot || !this.chatId)
            return;
        const icon = level === 'ERROR' ? '🔴' : level === 'WARN' ? '🟡' : '🟢';
        const metaStr = meta ? '\n\n```json\n' + JSON.stringify(meta, null, 2).slice(0, 800) + '\n```' : '';
        const text = `${icon} *[${level}]* ${new Date().toISOString()}\n\n${message}${metaStr}`;
        try {
            await this.bot.telegram.sendMessage(this.chatId, text, { parse_mode: 'Markdown' });
        }
        catch {
        }
    }
    async sendOrderNotification(order) {
        if (!this.bot || !this.chatId)
            return;
        const text = `🛍 *Yangi buyurtma!*\n\n` +
            `🏢 Kompaniya: *${order.companyName}*\n` +
            `👤 Diler: *${order.dealerName}*\n` +
            `💰 Summa: *${order.totalAmount.toLocaleString()} so'm*\n` +
            `📦 Mahsulotlar: *${order.itemCount} ta*\n` +
            `🆔 ID: \`${order.id.slice(-8).toUpperCase()}\`\n` +
            `📅 ${new Date().toLocaleString('uz-UZ')}`;
        try {
            await this.bot.telegram.sendMessage(this.chatId, text, { parse_mode: 'Markdown' });
        }
        catch {
        }
    }
    async sendDealerApprovalRequest(dealer) {
        if (!this.bot || !this.chatId)
            return;
        const text = `👤 *Yangi diler so'rovi!*\n\n` +
            `🏢 Kompaniya: *${dealer.companyName}*\n` +
            `👤 Ism: *${dealer.name}*\n` +
            `📞 Telefon: *${dealer.phone}*\n` +
            `⏳ Tasdiqlash kutilmoqda`;
        try {
            await this.bot.telegram.sendMessage(this.chatId, text, { parse_mode: 'Markdown' });
        }
        catch {
        }
    }
    async sendError(context, error, extra) {
        const msg = error instanceof Error ? error.message : error;
        await this.sendLog('ERROR', `*${context}*\n${msg}`, extra);
    }
};
exports.TelegramLoggerService = TelegramLoggerService;
exports.TelegramLoggerService = TelegramLoggerService = TelegramLoggerService_1 = __decorate([
    (0, common_1.Injectable)()
], TelegramLoggerService);
//# sourceMappingURL=telegram-logger.service.js.map