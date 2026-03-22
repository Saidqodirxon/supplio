import { PrismaService } from "../prisma/prisma.service";
import { PlanLimitsService } from "../common/services/plan-limits.service";
export declare class BranchesService {
    private prisma;
    private planLimits;
    constructor(prisma: PrismaService, planLimits: PlanLimitsService);
    create(companyId: string, data: {
        name: string;
        address?: string;
        phone?: string;
    }): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        address: string | null;
        phone: string | null;
        companyId: string;
    }>;
    findAll(companyId: string): Promise<({
        _count: {
            users: number;
            dealers: number;
            orders: number;
        };
    } & {
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        address: string | null;
        phone: string | null;
        companyId: string;
    })[]>;
    findOne(companyId: string, id: string): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        address: string | null;
        phone: string | null;
        companyId: string;
    }>;
    update(companyId: string, id: string, data: {
        name?: string;
        address?: string;
        phone?: string;
    }): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        address: string | null;
        phone: string | null;
        companyId: string;
    }>;
    remove(companyId: string, id: string, deletedBy: string): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        address: string | null;
        phone: string | null;
        companyId: string;
    }>;
    restore(companyId: string, id: string): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        address: string | null;
        phone: string | null;
        companyId: string;
    }>;
}
