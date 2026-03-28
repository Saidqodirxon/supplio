import { PrismaService } from "../../../prisma/prisma.service";
export declare class BackupService {
    private prisma;
    private readonly logger;
    private readonly backupDir;
    constructor(prisma: PrismaService);
    handleDailyBackup(): Promise<void>;
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
    createBackup(): Promise<{
        name: string;
        path: string;
        createdAt: Date;
    }>;
    sendToTelegram(filePath: string, fileName: string, token?: string, chatId?: string): Promise<void>;
    dumpCompanyDatabase(companyId: string, slug: string): Promise<string>;
    listBackups(): Promise<{
        name: string;
        size: number;
        createdAt: Date;
    }[]>;
    purgeSoftDeletedRecords(): Promise<void>;
}
