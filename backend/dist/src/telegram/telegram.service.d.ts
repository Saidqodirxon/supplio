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
    constructor(prisma: PrismaService, loggerBot: TelegramLoggerService, planLimits: PlanLimitsService);
    onModuleInit(): Promise<void>;
    initializeBots(): Promise<void>;
    private translations;
    private getT;
    private getLangFromCtx;
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
    sendOrderStatusUpdate(companyId: string, orderId: string, newStatus: string, dealerId: string): Promise<void>;
    private handleHelp;
    private getDealerByChatId;
    private progressBar;
    getBot(botId: string): Telegraf | undefined;
    validateToken(token: string): Promise<{
        valid: boolean;
        networkError?: boolean;
        botInfo?: {
            id: number;
            username: string;
            first_name: string;
        };
    }>;
    getBotStatus(botId: string): 'connected' | 'stopped' | 'not_found';
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
    stopAll(): Promise<void>;
}
