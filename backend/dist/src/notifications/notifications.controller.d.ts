import { NotificationService } from "./notifications.service";
import { Request } from "express";
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        phone: string;
        companyId: string;
        roleType: string;
    };
    companyId: string;
}
export declare class NotificationsController {
    private readonly notifService;
    constructor(notifService: NotificationService);
    getMyNotifications(req: AuthenticatedRequest, page?: string, limit?: string): Promise<{
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
    getUnreadCount(req: AuthenticatedRequest): Promise<{
        count: number;
    }>;
    markAsRead(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
    }>;
    markAllAsRead(req: AuthenticatedRequest): Promise<{
        success: boolean;
    }>;
    createNotification(req: AuthenticatedRequest, body: {
        title: string;
        message: string;
        type?: string;
        receiverDealerId?: string;
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
    } | import(".prisma/client").Prisma.BatchPayload>;
    sendToUser(req: AuthenticatedRequest, body: {
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
    broadcast(req: AuthenticatedRequest, body: {
        title: string;
        message: string;
        type?: string;
    }): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getTemplates(req: AuthenticatedRequest): Promise<{
        id: string;
        companyId: string;
        isActive: boolean;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        message: import("@prisma/client/runtime/library").JsonValue;
        type: string;
        updatedAt: Date;
    }[]>;
    createTemplate(req: AuthenticatedRequest, body: {
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
        message: import("@prisma/client/runtime/library").JsonValue;
        type: string;
        updatedAt: Date;
    }>;
    updateTemplate(req: AuthenticatedRequest, id: string, body: {
        name?: string;
        type?: string;
        message?: Record<string, string>;
        isActive?: boolean;
    }): Promise<import(".prisma/client").Prisma.BatchPayload>;
    deleteTemplate(req: AuthenticatedRequest, id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getTemplateLogs(req: AuthenticatedRequest, templateId?: string): Promise<({
        dealer: {
            name: string;
        };
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        message: string;
        templateId: string | null;
        dealerId: string | null;
        status: string;
    })[]>;
}
export {};
