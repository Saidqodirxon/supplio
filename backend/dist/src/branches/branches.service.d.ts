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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        address: string | null;
        phone: string | null;
    }>;
    findAll(companyId: string): Promise<({
        _count: {
            dealers: number;
            orders: number;
            users: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        address: string | null;
        phone: string | null;
    })[]>;
    findOne(companyId: string, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        address: string | null;
        phone: string | null;
    }>;
    update(companyId: string, id: string, data: {
        name?: string;
        address?: string;
        phone?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        address: string | null;
        phone: string | null;
    }>;
    remove(companyId: string, id: string, deletedBy: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        address: string | null;
        phone: string | null;
    }>;
    restore(companyId: string, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        companyId: string;
        address: string | null;
        phone: string | null;
    }>;
}
