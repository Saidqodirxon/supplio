import { TelegramService } from "./telegram.service";
import type { Update } from "telegraf/types";
export declare class TelegramController {
    private readonly telegramService;
    private readonly logger;
    constructor(telegramService: TelegramService);
    handleWebhook(id: string, update: Update): Promise<{
        ok: boolean;
    }>;
}
