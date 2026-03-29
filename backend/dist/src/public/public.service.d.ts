import { PrismaService } from "../prisma/prisma.service";
export declare class PublicService {
    private prisma;
    constructor(prisma: PrismaService);
    getHomeData(): Promise<{
        news: any;
        tariffs: any;
        settings: {
            maintenanceMode: boolean;
            newsEnabled: boolean;
            superAdminPhone: string;
            systemVersion: string;
        };
        landing: any;
    }>;
    getTariffs(): Promise<any>;
    getContent(): Promise<{
        testimonials: any[];
        stats: {
            companies: number;
            orders: number;
            uptime: string;
            support: string;
        };
    }>;
    getNewsBySlug(slug: string, lang: string): Promise<any>;
    incrementNewsView(id: string): Promise<any>;
}
