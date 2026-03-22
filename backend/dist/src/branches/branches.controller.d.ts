import { BranchesService } from "./branches.service";
export declare class BranchesController {
    private readonly branchesService;
    constructor(branchesService: BranchesService);
    create(req: any, body: {
        name: string;
        address?: string;
        phone?: string;
    }): Promise<{
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        phone: string | null;
        name: string;
        address: string | null;
        updatedAt: Date;
    }>;
    findAll(req: any): Promise<({
        _count: {
            dealers: number;
            orders: number;
            users: number;
        };
    } & {
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        phone: string | null;
        name: string;
        address: string | null;
        updatedAt: Date;
    })[]>;
    findOne(req: any, id: string): Promise<{
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        phone: string | null;
        name: string;
        address: string | null;
        updatedAt: Date;
    }>;
    update(req: any, id: string, body: {
        name?: string;
        address?: string;
        phone?: string;
    }): Promise<{
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        phone: string | null;
        name: string;
        address: string | null;
        updatedAt: Date;
    }>;
    restore(req: any, id: string): Promise<{
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        phone: string | null;
        name: string;
        address: string | null;
        updatedAt: Date;
    }>;
    remove(req: any, id: string): Promise<{
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        deletedBy: string | null;
        companyId: string;
        phone: string | null;
        name: string;
        address: string | null;
        updatedAt: Date;
    }>;
}
