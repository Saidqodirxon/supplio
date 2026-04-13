import { PrismaService } from "../prisma/prisma.service";
import { TelegramService } from "../telegram/telegram.service";
export declare class NotificationService {
    private prisma;
    private telegramService;
    private readonly logger;
    constructor(prisma: PrismaService, telegramService: TelegramService);
    createForUser(params: {
        companyId: string;
        senderId?: string;
        receiverUserId: string;
        title: string;
        message: string;
        type?: string;
    }): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        title: string;
        message: string;
        isRead: boolean;
        type: string;
        senderId: string | null;
        receiverUserId: string | null;
        receiverDealerId: string | null;
    }>;
    createForDealer(params: {
        companyId: string;
        senderId?: string;
        receiverDealerId: string;
        title: string;
        message: string;
        type?: string;
    }): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        title: string;
        message: string;
        isRead: boolean;
        type: string;
        senderId: string | null;
        receiverUserId: string | null;
        receiverDealerId: string | null;
    }>;
    broadcastToCompany(params: {
        companyId: string;
        senderId?: string;
        title: string;
        message: string;
        type?: string;
    }): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getUserNotifications(userId: string, companyId: string, page?: number, limit?: number): Promise<{
        notifications: ({
            sender: {
                phone: string;
                fullName: string;
            };
        } & {
            id: string;
            companyId: string;
            createdAt: Date;
            deletedAt: Date | null;
            title: string;
            message: string;
            isRead: boolean;
            type: string;
            senderId: string | null;
            receiverUserId: string | null;
            receiverDealerId: string | null;
        })[];
        total: number;
        unreadCount: number;
        page: number;
        limit: number;
    }>;
    markAsRead(notifId: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllAsRead(userId: string, companyId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getUnreadCount(userId: string, companyId: string): Promise<number>;
    getTemplates(companyId: string): Promise<{
        id: string;
        companyId: string;
        isActive: boolean;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        message: import("@prisma/client/runtime/library").JsonValue;
        type: string;
    }[]>;
    createTemplate(companyId: string, body: {
        name: string;
        type: string;
        message: Record<string, string>;
        isActive?: boolean;
    }): Promise<{
        id: string;
        companyId: string;
        isActive: boolean;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        message: import("@prisma/client/runtime/library").JsonValue;
        type: string;
    }>;
    updateTemplate(companyId: string, id: string, body: {
        name?: string;
        type?: string;
        message?: Record<string, string>;
        isActive?: boolean;
    }): Promise<import(".prisma/client").Prisma.BatchPayload>;
    deleteTemplate(companyId: string, id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getTemplateLogs(companyId: string, templateId?: string): Promise<({
        dealer: {
            name: string;
        };
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        status: string;
        message: string;
        templateId: string | null;
        dealerId: string | null;
    })[]>;
    runDebtReminders(): Promise<void>;
    runPromoNotifications(): Promise<void>;
}
