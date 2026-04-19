import { PublicService } from "./public.service";
export declare class PublicController {
    private readonly publicService;
    constructor(publicService: PublicService);
    getHome(): Promise<{
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
    getNewsList(lang?: string, limit?: string): Promise<any>;
    getNews(slug: string, lang?: string): Promise<any>;
    getLegal(type: string, lang?: string): Promise<{
        type: string;
        lang: string;
        content: string;
        updatedAt: string | Date;
    }>;
    incrementView(id: string): Promise<any>;
}
