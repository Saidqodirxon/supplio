import { OnModuleInit } from '@nestjs/common';
export declare class TelegramLoggerService implements OnModuleInit {
    private readonly logger;
    private bot;
    private chatId;
    onModuleInit(): void;
    sendLog(level: 'INFO' | 'WARN' | 'ERROR', message: string, meta?: Record<string, unknown>): Promise<void>;
    sendOrderNotification(order: {
        id: string;
        companyName: string;
        dealerName: string;
        totalAmount: number;
        itemCount: number;
    }): Promise<void>;
    sendDealerApprovalRequest(dealer: {
        name: string;
        phone: string;
        companyName: string;
    }): Promise<void>;
    sendError(context: string, error: Error | string, extra?: Record<string, unknown>): Promise<void>;
}
