import { PrismaService } from "../prisma/prisma.service";
export declare class SuperAdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getGlobalSettings(): Promise<any>;
    updateGlobalSettings(data: any): Promise<any>;
    getAllNews(): Promise<any>;
    createNews(authorId: string, data: any): Promise<any>;
    updateNews(id: string, data: any): Promise<any>;
    deleteNews(id: string): Promise<any>;
    directUpdate(model: string, id: string, field: string, value: any): Promise<any>;
}
