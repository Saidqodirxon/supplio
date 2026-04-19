import { PrismaService } from "../prisma/prisma.service";
import { TelegramLoggerService } from "../telegram/telegram-logger.service";
export declare class LeadsService {
    private prisma;
    private telegramLogger;
    private readonly logger;
    constructor(prisma: PrismaService, telegramLogger: TelegramLoggerService);
    createLead(data: {
        fullName: string;
        phone: string;
        info?: string;
    }): Promise<{
        info: string | null;
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        phone: string;
        status: string;
        fullName: string;
    }>;
    getAllLeads(): Promise<{
        info: string | null;
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        phone: string;
        status: string;
        fullName: string;
    }[]>;
    updateLeadStatus(id: string, status: string): Promise<{
        info: string | null;
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        phone: string;
        status: string;
        fullName: string;
    }>;
}
