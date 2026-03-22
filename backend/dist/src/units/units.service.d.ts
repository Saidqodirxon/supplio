import { PrismaService } from "../prisma/prisma.service";
export declare class UnitsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string): Promise<{
        symbol: string;
        id: string;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        companyId: string | null;
    }[]>;
    create(companyId: string, data: {
        name: string;
        symbol?: string;
    }): Promise<{
        symbol: string;
        id: string;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        companyId: string | null;
    }>;
    update(id: string, companyId: string, data: {
        name?: string;
        symbol?: string;
    }): Promise<{
        symbol: string;
        id: string;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        companyId: string | null;
    }>;
    remove(id: string, companyId: string): Promise<{
        symbol: string;
        id: string;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        companyId: string | null;
    }>;
    seedDefaults(): Promise<void>;
}
