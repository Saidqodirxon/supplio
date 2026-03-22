import { SuperAdminService } from "./superadmin.service";
export declare class SuperAdminController {
    private readonly superService;
    constructor(superService: SuperAdminService);
    getSettings(): Promise<any>;
    updateSettings(data: any): Promise<any>;
    getNews(): Promise<any>;
    createNews(req: any, data: any): Promise<any>;
    updateNews(id: string, data: any): Promise<any>;
    deleteNews(id: string): Promise<any>;
    directUpdate(body: {
        model: string;
        id: string;
        field: string;
        value: any;
    }): Promise<any>;
}
