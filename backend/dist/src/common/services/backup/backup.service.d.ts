import { PrismaService } from "../../../prisma/prisma.service";
export declare class BackupService {
    private prisma;
    private readonly logger;
    private readonly backupDir;
    constructor(prisma: PrismaService);
    handleDailyBackup(): Promise<void>;
    createBackup(): Promise<{
        name: string;
        path: string;
        createdAt: Date;
    }>;
    dumpCompanyDatabase(companyId: string, slug: string): Promise<string>;
    listBackups(): Promise<{
        name: string;
        size: number;
        createdAt: Date;
    }[]>;
    purgeSoftDeletedRecords(): Promise<void>;
}
