import { PrismaService } from "../../../prisma/prisma.service";
import { TelegramLoggerService } from "../../../telegram/telegram-logger.service";
import { CompanyNotifierService } from "../../../telegram/company-notifier.service";
export declare class BackupService {
    private prisma;
    private loggerService;
    private companyNotifier;
    private readonly logger;
    private readonly backupDir;
    constructor(prisma: PrismaService, loggerService: TelegramLoggerService, companyNotifier: CompanyNotifierService);
    private buildCompanyBackupFileName;
    handleDailyBackup(): Promise<void>;
    private cleanupOldBackups;
    createFullBackup(): Promise<{
        zipPath: string;
        dir: string;
    }>;
    exportCompanyToSql(companyId: string, companyName: string): Promise<string>;
    private zipFolder;
    createBackupAndSend(): Promise<{
        name: string;
        size: number;
        createdAt: Date;
    }>;
    createCompanyBackup(companyId: string): Promise<{
        name: string;
        path: string;
        createdAt: Date;
        size: number;
    }>;
    createCompanyBackupAndSend(companyId: string): Promise<{
        name: string;
        size: number;
        createdAt: Date;
    }>;
    createBackup(): Promise<{
        name: string;
        path: string;
        createdAt: Date;
    }>;
    sendToTelegram(filePath: string, fileName: string, token?: string, chatId?: string): Promise<void>;
    dumpCompanyDatabase(companyId: string, slug: string): Promise<string>;
    resolveBackupPath(name: string): string;
    listBackups(): Promise<{
        name: string;
        size: number;
        createdAt: Date;
    }[]>;
    purgeSoftDeletedRecords(): Promise<void>;
}
