import { PrismaService } from "../../prisma/prisma.service";
export declare class CleanupService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    purgeDeletedData(): Promise<void>;
}
