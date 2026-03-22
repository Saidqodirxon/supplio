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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const telegram_service_1 = require("../telegram/telegram.service");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(prisma, telegramService) {
        this.prisma = prisma;
        this.telegramService = telegramService;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    async createForUser(params) {
        return this.prisma.notification.create({
            data: {
                companyId: params.companyId,
                senderId: params.senderId,
                receiverUserId: params.receiverUserId,
                title: params.title,
                message: params.message,
                type: params.type || "INFO",
            },
        });
    }
    async createForDealer(params) {
        const notification = await this.prisma.notification.create({
            data: {
                companyId: params.companyId,
                senderId: params.senderId,
                receiverDealerId: params.receiverDealerId,
                title: params.title,
                message: params.message,
                type: params.type || "INFO",
            },
        });
        try {
            const dealer = await this.prisma.dealer.findUnique({
                where: { id: params.receiverDealerId },
                select: { telegramChatId: true },
            });
            if (dealer?.telegramChatId) {
                const tgMsg = `🔔 *${params.title}*\n\n${params.message}`;
                await this.telegramService.sendMessage(params.companyId, dealer.telegramChatId, tgMsg);
            }
        }
        catch (e) {
            this.logger.error(`TG notification failed for dealer: ${params.receiverDealerId} | ${e.message}`);
        }
        return notification;
    }
    async broadcastToCompany(params) {
        const users = await this.prisma.user.findMany({
            where: { companyId: params.companyId, isActive: true },
            select: { id: true },
        });
        const notifications = users.map((user) => ({
            companyId: params.companyId,
            senderId: params.senderId || null,
            receiverUserId: user.id,
            title: params.title,
            message: params.message,
            type: params.type || "INFO",
        }));
        const result = await this.prisma.notification.createMany({
            data: notifications,
        });
        this.logger.log(`Broadcast ${result.count} notifications to company ${params.companyId}`);
        return result;
    }
    async getUserNotifications(userId, companyId, page = 1, limit = 20) {
        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { receiverUserId: userId, companyId },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    sender: { select: { fullName: true, phone: true } },
                },
            }),
            this.prisma.notification.count({
                where: { receiverUserId: userId, companyId },
            }),
        ]);
        const unreadCount = await this.prisma.notification.count({
            where: { receiverUserId: userId, companyId, isRead: false },
        });
        return { notifications, total, unreadCount, page, limit };
    }
    async markAsRead(notifId, userId) {
        return this.prisma.notification.updateMany({
            where: { id: notifId, receiverUserId: userId },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId, companyId) {
        return this.prisma.notification.updateMany({
            where: { receiverUserId: userId, companyId, isRead: false },
            data: { isRead: true },
        });
    }
    async getUnreadCount(userId, companyId) {
        return this.prisma.notification.count({
            where: { receiverUserId: userId, companyId, isRead: false },
        });
    }
    async getTemplates(companyId) {
        return this.prisma.notificationTemplate.findMany({
            where: { companyId, deletedAt: null },
            orderBy: { createdAt: "desc" },
        });
    }
    async createTemplate(companyId, body) {
        return this.prisma.notificationTemplate.create({
            data: {
                companyId,
                name: body.name,
                type: body.type,
                message: body.message,
                isActive: body.isActive ?? true,
            },
        });
    }
    async updateTemplate(companyId, id, body) {
        return this.prisma.notificationTemplate.updateMany({
            where: { id, companyId, deletedAt: null },
            data: body,
        });
    }
    async deleteTemplate(companyId, id) {
        return this.prisma.notificationTemplate.updateMany({
            where: { id, companyId },
            data: { deletedAt: new Date() },
        });
    }
    async getTemplateLogs(companyId, templateId) {
        return this.prisma.notificationLog.findMany({
            where: { companyId, ...(templateId ? { templateId } : {}) },
            orderBy: { createdAt: "desc" },
            take: 100,
            include: { dealer: { select: { name: true } } },
        });
    }
    async runDebtReminders() {
        this.logger.log("Running daily debt reminder cron...");
        try {
            const templates = await this.prisma.notificationTemplate.findMany({
                where: { type: "DEBT_REMINDER", isActive: true, deletedAt: null },
                include: { company: true },
            });
            for (const template of templates) {
                const dealers = await this.prisma.dealer.findMany({
                    where: {
                        companyId: template.companyId,
                        deletedAt: null,
                        isApproved: true,
                        isBlocked: false,
                        currentDebt: { gt: 0 },
                    },
                    select: { id: true, name: true, telegramChatId: true, currentDebt: true },
                });
                const msgs = template.message;
                const baseMsg = msgs["uz"] || msgs["ru"] || msgs["en"] || "";
                for (const dealer of dealers) {
                    const message = baseMsg.replace("{debt}", dealer.currentDebt.toLocaleString());
                    let status = "sent";
                    try {
                        if (dealer.telegramChatId) {
                            await this.telegramService.sendMessage(template.companyId, dealer.telegramChatId, `🔔 ${message}`);
                        }
                    }
                    catch {
                        status = "failed";
                    }
                    await this.prisma.notificationLog.create({
                        data: {
                            companyId: template.companyId,
                            templateId: template.id,
                            dealerId: dealer.id,
                            message,
                            status,
                        },
                    }).catch(() => { });
                }
            }
            this.logger.log("Debt reminder cron completed.");
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.error("Debt reminder cron failed: " + msg);
        }
    }
    async runPromoNotifications() {
        this.logger.log("Running promo notification cron...");
        try {
            const templates = await this.prisma.notificationTemplate.findMany({
                where: { type: "PROMOTION", isActive: true, deletedAt: null },
            });
            for (const template of templates) {
                const promoProducts = await this.prisma.product.findMany({
                    where: { companyId: template.companyId, isPromo: true, isActive: true, deletedAt: null },
                    select: { name: true },
                    take: 3,
                });
                if (promoProducts.length === 0)
                    continue;
                const dealers = await this.prisma.dealer.findMany({
                    where: {
                        companyId: template.companyId,
                        deletedAt: null,
                        isApproved: true,
                        isBlocked: false,
                        telegramChatId: { not: null },
                    },
                    select: { id: true, telegramChatId: true },
                });
                const msgs = template.message;
                const baseMsg = msgs["uz"] || msgs["ru"] || msgs["en"] || "";
                const productName = promoProducts.map((p) => p.name).join(", ");
                const message = baseMsg.replace("{productName}", productName);
                for (const dealer of dealers) {
                    let status = "sent";
                    try {
                        await this.telegramService.sendMessage(template.companyId, dealer.telegramChatId, `🎁 ${message}`);
                    }
                    catch {
                        status = "failed";
                    }
                    await this.prisma.notificationLog.create({
                        data: {
                            companyId: template.companyId,
                            templateId: template.id,
                            dealerId: dealer.id,
                            message,
                            status,
                        },
                    }).catch(() => { });
                }
            }
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.error("Promo notification cron failed: " + msg);
        }
    }
};
exports.NotificationService = NotificationService;
__decorate([
    (0, schedule_1.Cron)("0 9 * * *"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "runDebtReminders", null);
__decorate([
    (0, schedule_1.Cron)("0 10 * * *"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "runPromoNotifications", null);
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        telegram_service_1.TelegramService])
], NotificationService);
//# sourceMappingURL=notifications.service.js.map