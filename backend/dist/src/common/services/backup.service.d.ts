import { PrismaService } from "../../prisma/prisma.service";
export declare class BackupService {
    private prisma;
    private readonly logger;
    private readonly backupDir;
    constructor(prisma: PrismaService);
    handleDailyBackup(): Promise<void>;
    dumpCompanyDatabase(companyId: string, slug: string): Promise<string>;
    purgeSoftDeletedRecords(): Promise<void>;
}
