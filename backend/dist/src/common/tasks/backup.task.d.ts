import { PrismaService } from "../../prisma/prisma.service";
export declare class BackupTask {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleDailyBackup(): Promise<void>;
    private rotateBackups;
}
