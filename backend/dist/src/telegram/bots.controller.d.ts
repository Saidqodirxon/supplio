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
        isActive: boolean;
        hasWebApp: boolean;
        watermark: boolean;
        createdAt: Date;
        deletedAt: Date | null;
        botName: string | null;
        description: string | null;
        webhookUrl: string | null;
    }[]>;
    validateToken(body: {
        token: string;
    }): Promise<{
        valid: boolean;
        networkError?: boolean;
        botInfo?: {
            id: number;
            username: string;
            first_name: string;
        };
    }>;
    getBotStatus(req: any): Promise<{
        status: string;
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
        isActive: boolean;
        hasWebApp: boolean;
        watermark: boolean;
        createdAt: Date;
        deletedAt: Date | null;
        botName: string | null;
        description: string | null;
        webhookUrl: string | null;
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
        isActive: boolean;
        hasWebApp: boolean;
        watermark: boolean;
        createdAt: Date;
        deletedAt: Date | null;
        botName: string | null;
        description: string | null;
        webhookUrl: string | null;
    }>;
    removeBot(req: any, id: string): Promise<{
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
    broadcast(req: any, body: {
        message: string;
    }): Promise<{
        sent: number;
        failed: number;
    }>;
    reloadBots(req: any): Promise<{
        reloaded: number;
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
}
