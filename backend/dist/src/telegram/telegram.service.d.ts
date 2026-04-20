import { OnModuleInit } from "@nestjs/common";
import { Telegraf } from "telegraf";
import { PrismaService } from "../prisma/prisma.service";
import { TelegramLoggerService } from "./telegram-logger.service";
import { PlanLimitsService } from "../common/services/plan-limits.service";
export declare class TelegramService implements OnModuleInit {
    private prisma;
    private loggerBot;
    private planLimits;
    private readonly logger;
    private bots;
    private carts;
    private chatLangPrefs;
    constructor(prisma: PrismaService, loggerBot: TelegramLoggerService, planLimits: PlanLimitsService);
    onModuleInit(): Promise<void>;
    initializeBots(): Promise<void>;
    private translations;
    private getT;
    private getPublicStoreBaseUrl;
    private isCompanyAccessBlocked;
    sendToAdmins(companyId: string, message: string): Promise<void>;
    private getLangFromCtx;
    private buildLanguageKeyboard;
    private buildMainMenuKeyboard;
    private buildAdminMenuKeyboard;
    private isWithinWorkingHours;
    private buildWorkingHoursText;
    private buildClosedMessage;
    initBot(botId: string, companyId: string, token: string, companyName: string): Promise<void>;
    private handleDebt;
    private handleProducts;
    private handleOrders;
    private handlePayments;
    private getCart;
    private clearCart;
    private handleCallback;
    private handleCart;
    private handleCheckout;
    private handleCheckoutByChat;
    sendMessage(botId: string, chatId: string, message: string): Promise<void>;
    broadcast(companyId: string, message: string): Promise<{
        sent: number;
        failed: number;
    }>;
    sendOrderStatusUpdate(companyId: string, orderId: string, newStatus: string, dealerId: string, subStatus?: string): Promise<void>;
    private handleHelp;
    private resolveChatId;
    applyBotBranding(botToken: string, companyId: string): Promise<Record<string, string>>;
    private getDealerByChatId;
    private progressBar;
    getBot(botId: string): Telegraf | undefined;
    ensureBotInitialized(botId: string): Promise<Telegraf | undefined>;
    validateToken(token: string): Promise<{
        valid: boolean;
        networkError?: boolean;
        botInfo?: {
            id: number;
            username: string;
            first_name: string;
        };
    }>;
    getBotStatus(botId: string): "connected" | "stopped" | "not_found";
    private stopRunningBot;
    private clearCompanyRuntimeState;
    private clearGlobalRuntimeState;
    getBotsForCompany(companyId: string): Promise<{
        id: string;
        companyId: string;
        token: string;
        username: string | null;
        isActive: boolean;
        hasWebApp: boolean;
        watermark: boolean;
        createdAt: Date;
        deletedAt: Date | null;
        botName: string | null;
        description: string | null;
        webhookUrl: string | null;
    }[]>;
    reloadCompanyBots(companyId: string): Promise<{
        reloaded: number;
    }>;
    createBot(companyId: string, data: {
        token: string;
        botName?: string;
        description?: string;
    }): Promise<{
        botInfo: {
            id: number;
            username: string;
            first_name: string;
        };
        id: string;
        companyId: string;
        token: string;
        username: string | null;
        isActive: boolean;
        hasWebApp: boolean;
        watermark: boolean;
        createdAt: Date;
        deletedAt: Date | null;
        botName: string | null;
        description: string | null;
        webhookUrl: string | null;
    }>;
    updateBot(id: string, companyId: string, data: {
        token?: string;
        botName?: string;
        description?: string;
        isActive?: boolean;
    }): Promise<{
        id: string;
        companyId: string;
        token: string;
        username: string | null;
        isActive: boolean;
        hasWebApp: boolean;
        watermark: boolean;
        createdAt: Date;
        deletedAt: Date | null;
        botName: string | null;
        description: string | null;
        webhookUrl: string | null;
    }>;
    removeBot(id: string, companyId: string): Promise<{
        success: boolean;
    }>;
    getAllBotsAdmin(): Promise<{
        status: "connected" | "stopped" | "not_found";
        company: {
            id: string;
            name: string;
            slug: string;
        };
        id: string;
        companyId: string;
        token: string;
        username: string | null;
        isActive: boolean;
        hasWebApp: boolean;
        watermark: boolean;
        createdAt: Date;
        deletedAt: Date | null;
        botName: string | null;
        description: string | null;
        webhookUrl: string | null;
    }[]>;
    adminReloadBot(botId: string): Promise<{
        success: boolean;
        status: "connected" | "stopped" | "not_found";
    }>;
    adminReloadAllBots(): Promise<{
        success: boolean;
        reloaded: number;
    }>;
    adminHardDeleteBot(botId: string): Promise<{
        success: boolean;
    }>;
    adminUpdateBot(botId: string, data: {
        token?: string;
        isActive?: boolean;
        botName?: string;
        description?: string;
    }): Promise<{
        status: "connected" | "stopped" | "not_found";
        id: string;
        companyId: string;
        token: string;
        username: string | null;
        isActive: boolean;
        hasWebApp: boolean;
        watermark: boolean;
        createdAt: Date;
        deletedAt: Date | null;
        botName: string | null;
        description: string | null;
        webhookUrl: string | null;
    }>;
    notifyDealerApprovalResult(companyId: string, dealerId: string, approved: boolean): Promise<void>;
    adminDeleteAllBots(): Promise<{
        deleted: number;
    }>;
    stopAll(): Promise<void>;
}
