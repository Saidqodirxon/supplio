import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { TelegramService } from "../telegram/telegram.service";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    private telegramService: TelegramService
  ) {}

  /** Create a notification for a specific user */
  async createForUser(params: {
    companyId: string;
    senderId?: string;
    receiverUserId: string;
    title: string;
    message: string;
    type?: string;
  }) {
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

  async createForDealer(params: {
    companyId: string;
    senderId?: string;
    receiverDealerId: string;
    title: string;
    message: string;
    type?: string;
  }) {
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

    // Integrated TG Send
    try {
      const dealer = await this.prisma.dealer.findUnique({
        where: { id: params.receiverDealerId },
        select: { telegramChatId: true },
      });

      if (dealer?.telegramChatId) {
        const tgMsg = `🔔 *${params.title}*\n\n${params.message}`;
        await this.telegramService.sendMessage(
          params.companyId,
          dealer.telegramChatId,
          tgMsg
        );
      }
    } catch (e) {
      this.logger.error(
        `TG notification failed for dealer: ${params.receiverDealerId} | ${e.message}`
      );
    }

    return notification;
  }

  /** Broadcast a notification to all users in a company */
  async broadcastToCompany(params: {
    companyId: string;
    senderId?: string;
    title: string;
    message: string;
    type?: string;
  }) {
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

    this.logger.log(
      `Broadcast ${result.count} notifications to company ${params.companyId}`
    );

    return result;
  }

  /** Get user's notifications (paginated, newest first) */
  async getUserNotifications(
    userId: string,
    companyId: string,
    page = 1,
    limit = 20
  ) {
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

  /** Mark a notification as read */
  async markAsRead(notifId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notifId, receiverUserId: userId },
      data: { isRead: true },
    });
  }

  /** Mark all as read for a user */
  async markAllAsRead(userId: string, companyId: string) {
    return this.prisma.notification.updateMany({
      where: { receiverUserId: userId, companyId, isRead: false },
      data: { isRead: true },
    });
  }

  /** Get unread count for a user */
  async getUnreadCount(userId: string, companyId: string) {
    return this.prisma.notification.count({
      where: { receiverUserId: userId, companyId, isRead: false },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // NOTIFICATION TEMPLATES (per-company)
  // ─────────────────────────────────────────────────────────────

  async getTemplates(companyId: string) {
    return this.prisma.notificationTemplate.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  async createTemplate(
    companyId: string,
    body: { name: string; type: string; message: Record<string, string>; isActive?: boolean }
  ) {
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

  async updateTemplate(
    companyId: string,
    id: string,
    body: { name?: string; type?: string; message?: Record<string, string>; isActive?: boolean }
  ) {
    return this.prisma.notificationTemplate.updateMany({
      where: { id, companyId, deletedAt: null },
      data: body as any,
    });
  }

  async deleteTemplate(companyId: string, id: string) {
    return this.prisma.notificationTemplate.updateMany({
      where: { id, companyId },
      data: { deletedAt: new Date() },
    });
  }

  async getTemplateLogs(companyId: string, templateId?: string) {
    return this.prisma.notificationLog.findMany({
      where: { companyId, ...(templateId ? { templateId } : {}) },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { dealer: { select: { name: true } } },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // CRON JOBS — Daily automated notifications
  // ─────────────────────────────────────────────────────────────

  /** Runs every day at 09:00 — sends debt reminder to all dealers with debt > 0 */
  @Cron("0 9 * * *")
  async runDebtReminders() {
    this.logger.log("Running daily debt reminder cron...");
    try {
      // Get all active templates of type DEBT_REMINDER
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

        const msgs = template.message as Record<string, string>;
        const baseMsg = msgs["uz"] || msgs["ru"] || msgs["en"] || "";

        for (const dealer of dealers) {
          const message = baseMsg.replace("{debt}", dealer.currentDebt.toLocaleString());
          let status = "sent";
          try {
            if (dealer.telegramChatId) {
              await this.telegramService.sendMessage(
                template.companyId,
                dealer.telegramChatId,
                `🔔 ${message}`
              );
            }
          } catch {
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
          }).catch(() => {});
        }
      }
      this.logger.log("Debt reminder cron completed.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error("Debt reminder cron failed: " + msg);
    }
  }

  /** Runs every day at 10:00 — sends promotion notification when any product is marked isPromo */
  @Cron("0 10 * * *")
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
        if (promoProducts.length === 0) continue;

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

        const msgs = template.message as Record<string, string>;
        const baseMsg = msgs["uz"] || msgs["ru"] || msgs["en"] || "";
        const productName = promoProducts.map((p) => p.name).join(", ");
        const message = baseMsg.replace("{productName}", productName);

        for (const dealer of dealers) {
          let status = "sent";
          try {
            await this.telegramService.sendMessage(
              template.companyId,
              dealer.telegramChatId!,
              `🎁 ${message}`
            );
          } catch {
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
          }).catch(() => {});
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error("Promo notification cron failed: " + msg);
    }
  }
}
