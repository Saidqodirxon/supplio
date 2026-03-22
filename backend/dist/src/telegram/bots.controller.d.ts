import { TelegramService } from "./telegram.service";
export declare class BotsController {
    private readonly telegramService;
    constructor(telegramService: TelegramService);
    getBots(req: any): Promise<{
        status: "connected" | "stopped" | "not_found";
        id: string;
        companyId: string;
        token: string;
        username: string | null;
        botName: string | null;
        description: string | null;
        isActive: boolean;
        hasWebApp: boolean;
        watermark: boolean;
        webhookUrl: string | null;
        createdAt: Date;
        deletedAt: Date | null;
    }[]>;
    validateToken(body: {
        token: string;
    }): Promise<{
        valid: boolean;
        botInfo?: {
            id: number;
            username: string;
            first_name: string;
        };
    }>;
    getBotStatus(req: any): Promise<{
        status: "connected" | "stopped" | "not_found";
    }>;
    createBot(req: any, body: {
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
        botName: string | null;
        description: string | null;
        isActive: boolean;
        hasWebApp: boolean;
        watermark: boolean;
        webhookUrl: string | null;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    updateBot(req: any, id: string, body: {
        token?: string;
        botName?: string;
        description?: string;
        isActive?: boolean;
    }): Promise<{
        id: string;
        companyId: string;
        token: string;
        username: string | null;
        botName: string | null;
        description: string | null;
        isActive: boolean;
        hasWebApp: boolean;
        watermark: boolean;
        webhookUrl: string | null;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    removeBot(req: any, id: string): Promise<{
        id: string;
        companyId: string;
        token: string;
        username: string | null;
        botName: string | null;
        description: string | null;
        isActive: boolean;
        hasWebApp: boolean;
        watermark: boolean;
        webhookUrl: string | null;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    broadcast(req: any, body: {
        message: string;
    }): Promise<{
        sent: number;
        failed: number;
    }>;
}
