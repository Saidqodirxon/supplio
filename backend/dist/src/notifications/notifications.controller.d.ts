import { NotificationService } from "./notifications.service";
import { Request } from "express";
import { PlanLimitsService } from "../common/services/plan-limits.service";
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
    private readonly planLimits;
    constructor(notifService: NotificationService, planLimits: PlanLimitsService);
    private ensureNotificationsAllowed;
    getMyNotifications(req: AuthenticatedRequest, page?: string, limit?: string): Promise<{
        notifications: ({
            sender: {
                phone: string;
                fullName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            deletedAt: Date | null;
            companyId: string;
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
        createdAt: Date;
        deletedAt: Date | null;
        companyId: string;
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
        createdAt: Date;
        deletedAt: Date | null;
        companyId: string;
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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        companyId: string;
        isActive: boolean;
        message: import("@prisma/client/runtime/library").JsonValue;
        type: string;
    }[]>;
    createTemplate(req: AuthenticatedRequest, body: {
        name: string;
        type: string;
        message: Record<string, string>;
        isActive?: boolean;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        companyId: string;
        isActive: boolean;
        message: import("@prisma/client/runtime/library").JsonValue;
        type: string;
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
        createdAt: Date;
        companyId: string;
        status: string;
        dealerId: string | null;
        message: string;
        templateId: string | null;
    })[]>;
}
export {};
