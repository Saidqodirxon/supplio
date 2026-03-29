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
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
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
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
        address: string | null;
        phone: string | null;
    })[]>;
    findOne(req: any, id: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
        address: string | null;
        phone: string | null;
    }>;
    update(req: any, id: string, body: {
        name?: string;
        address?: string;
        phone?: string;
    }): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
        address: string | null;
        phone: string | null;
    }>;
    restore(req: any, id: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
        address: string | null;
        phone: string | null;
    }>;
    remove(req: any, id: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        updatedAt: Date;
        deletedBy: string | null;
        address: string | null;
        phone: string | null;
    }>;
}
