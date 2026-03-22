import { TelegramService } from "./telegram.service";
import { Update } from "telegraf/typings/core/types/typegram";
export declare class TelegramController {
    private readonly telegramService;
    private readonly logger;
    constructor(telegramService: TelegramService);
    handleWebhook(companyId: string, update: Update): Promise<{
        ok: boolean;
    }>;
}
