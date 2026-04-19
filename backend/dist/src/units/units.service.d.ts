import { PrismaService } from "../prisma/prisma.service";
export declare class UnitsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string): Promise<{
        symbol: string;
        id: string;
        companyId: string | null;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
    }[]>;
    create(companyId: string, data: {
        name: string;
        symbol?: string;
    }): Promise<{
        symbol: string;
        id: string;
        companyId: string | null;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
    }>;
    update(id: string, companyId: string, data: {
        name?: string;
        symbol?: string;
    }): Promise<{
        symbol: string;
        id: string;
        companyId: string | null;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
    }>;
    remove(id: string, companyId: string): Promise<{
        symbol: string;
        id: string;
        companyId: string | null;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
    }>;
    seedDefaults(): Promise<void>;
}
