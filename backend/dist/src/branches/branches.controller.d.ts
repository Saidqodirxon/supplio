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
        address: string | null;
        phone: string | null;
        companyId: string;
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
        address: string | null;
        phone: string | null;
        companyId: string;
    })[]>;
    findOne(req: any, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        address: string | null;
        phone: string | null;
        companyId: string;
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
        address: string | null;
        phone: string | null;
        companyId: string;
    }>;
    restore(req: any, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        address: string | null;
        phone: string | null;
        companyId: string;
    }>;
    remove(req: any, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedBy: string | null;
        address: string | null;
        phone: string | null;
        companyId: string;
    }>;
}
