import { PublicService } from "./public.service";
export declare class PublicController {
    private readonly publicService;
    constructor(publicService: PublicService);
    getHome(): Promise<{
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
    getNews(slug: string, lang?: string): Promise<any>;
    incrementView(id: string): Promise<any>;
}
