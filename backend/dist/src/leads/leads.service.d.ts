import { PrismaService } from "../prisma/prisma.service";
export declare class LeadsService {
    private prisma;
    private readonly logger;
    private adminBot;
    constructor(prisma: PrismaService);
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
    private notifyAdmin;
}
