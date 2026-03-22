import { UnitsService } from "./units.service";
export declare class UnitsController {
    private readonly unitsService;
    constructor(unitsService: UnitsService);
    findAll(req: any): Promise<{
        symbol: string;
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        companyId: string | null;
        name: string;
    }[]>;
    create(req: any, body: {
        name: string;
        symbol?: string;
    }): Promise<{
        symbol: string;
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        companyId: string | null;
        name: string;
    }>;
    update(req: any, id: string, body: {
        name?: string;
        symbol?: string;
    }): Promise<{
        symbol: string;
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        companyId: string | null;
        name: string;
    }>;
    remove(req: any, id: string): Promise<{
        symbol: string;
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        companyId: string | null;
        name: string;
    }>;
}
