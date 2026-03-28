import { BranchesService } from "./branches.service";
export declare class BranchesController {
    private readonly branchesService;
    constructor(branchesService: BranchesService);
    create(req: any, body: {
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
    findAll(req: any): Promise<({
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
    findOne(req: any, id: string): Promise<{
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
    update(req: any, id: string, body: {
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
    restore(req: any, id: string): Promise<{
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
    remove(req: any, id: string): Promise<{
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
