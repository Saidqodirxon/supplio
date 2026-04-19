import { OnModuleInit } from '@nestjs/common';
export declare class TelegramLoggerService implements OnModuleInit {
    private readonly logger;
    private logBot;
    private logChatId;
    private backupBot;
    private backupChatId;
    onModuleInit(): void;
    private sendToLog;
    private sendDocumentToBackup;
    sendLog(level: 'INFO' | 'WARN' | 'ERROR', message: string, meta?: Record<string, unknown>): Promise<void>;
    sendError(context: string, error: Error | string, extra?: Record<string, unknown>): Promise<void>;
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
    sendLeadNotification(lead: {
        fullName: string;
        phone: string;
        info?: string;
    }): Promise<void>;
    sendPasswordResetNotification(data: {
        userFullName: string;
        companyName: string;
        phone: string;
    }): Promise<void>;
    sendTariffUpgradeNotification(data: {
        companyName: string;
        oldPlan: string;
        newPlan: string;
    }): Promise<void>;
    sendDailyReportSummary(data: {
        companyName: string;
        slug: string;
        totalOrders: number;
        todayOrders: number;
        todayRevenue: number;
        pendingOrders: number;
        totalDealers: number;
    }): Promise<void>;
    sendBackupFile(filePath: string, fileName: string, label?: string): Promise<void>;
}
