import { TelegramService } from "./telegram.service";
export declare class BotsController {
    private readonly telegramService;
    constructor(telegramService: TelegramService);
    getBots(req: any): Promise<{
        status: "connected" | "stopped" | "not_found";
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        companyId: string;
        description: string | null;
        token: string;
        username: string | null;
        botName: string | null;
        isActive: boolean;
        hasWebApp: boolean;
        watermark: boolean;
        webhookUrl: string | null;
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
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        companyId: string;
        description: string | null;
        token: string;
        username: string | null;
        botName: string | null;
        isActive: boolean;
        hasWebApp: boolean;
        watermark: boolean;
        webhookUrl: string | null;
    }>;
    updateBot(req: any, id: string, body: {
        token?: string;
        botName?: string;
        description?: string;
        isActive?: boolean;
    }): Promise<{
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        companyId: string;
        description: string | null;
        token: string;
        username: string | null;
        botName: string | null;
        isActive: boolean;
        hasWebApp: boolean;
        watermark: boolean;
        webhookUrl: string | null;
    }>;
    removeBot(req: any, id: string): Promise<{
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        companyId: string;
        description: string | null;
        token: string;
        username: string | null;
        botName: string | null;
        isActive: boolean;
        hasWebApp: boolean;
        watermark: boolean;
        webhookUrl: string | null;
    }>;
    broadcast(req: any, body: {
        message: string;
    }): Promise<{
        sent: number;
        failed: number;
    }>;
}
