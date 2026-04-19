import { PrismaService } from "../prisma/prisma.service";
export declare class PublicService {
    private prisma;
    constructor(prisma: PrismaService);
    private loadGlobalSettings;
    getHomeData(): Promise<{
        news: any;
        tariffs: any;
        settings: {
            newsEnabled: boolean | null;
            systemVersion: string | null;
            maintenanceMode: boolean | null;
            superAdminPhone: string | null;
            termsUz: string | null;
            termsRu: string | null;
            termsEn: string | null;
            termsUzCyr: string | null;
            privacyUz: string | null;
            privacyRu: string | null;
            privacyEn: string | null;
            privacyUzCyr: string | null;
            contractUz: string | null;
            contractRu: string | null;
            contractEn: string | null;
            contractUzCyr: string | null;
            updatedAt: Date | string | null;
        };
        landing: any;
    }>;
    getNewsList(_lang: string, limit?: number): Promise<any>;
    getTariffs(): Promise<any>;
    getContent(): Promise<{
        testimonials: any[];
        teamMembers: any[];
        stats: {
            companies: number;
            orders: number;
            uptime: string;
            support: string;
        };
    }>;
    getNewsBySlug(slug: string, lang: string): Promise<any>;
    getLegalContent(type: string, lang: string): Promise<{
        type: string;
        lang: string;
        content: string;
        updatedAt: string | Date;
    }>;
    incrementNewsView(id: string): Promise<any>;
}
