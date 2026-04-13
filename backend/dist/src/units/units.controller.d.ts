import { UnitsService } from "./units.service";
export declare class UnitsController {
    private readonly unitsService;
    constructor(unitsService: UnitsService);
    findAll(req: any): Promise<{
        symbol: string;
        id: string;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        companyId: string | null;
    }[]>;
    create(req: any, body: {
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
    update(req: any, id: string, body: {
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
    remove(req: any, id: string): Promise<{
        symbol: string;
        id: string;
        name: string;
        createdAt: Date;
        deletedAt: Date | null;
        companyId: string | null;
    }>;
}
