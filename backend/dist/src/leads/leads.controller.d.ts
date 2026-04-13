import { LeadsService } from "./leads.service";
export declare class LeadsController {
    private readonly leadsService;
    constructor(leadsService: LeadsService);
    create(createLeadDto: {
        fullName: string;
        phone: string;
        info?: string;
    }): Promise<{
        info: string | null;
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        phone: string;
        fullName: string;
        status: string;
    }>;
    findAll(): Promise<{
        info: string | null;
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        phone: string;
        fullName: string;
        status: string;
    }[]>;
    updateStatus(id: string, status: string): Promise<{
        info: string | null;
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        phone: string;
        fullName: string;
        status: string;
    }>;
}
