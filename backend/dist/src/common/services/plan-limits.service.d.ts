import { PrismaService } from "../../prisma/prisma.service";
interface PlanLimits {
    maxBranches: number;
    maxUsers: number;
    maxCustomBots: number;
    maxDealers: number;
    maxProducts: number;
    allowCustomBot: boolean;
    allowWebStore: boolean;
    allowAnalytics: boolean;
    allowNotifications: boolean;
    allowMultiCompany: boolean;
    allowBulkImport: boolean;
}
export declare class PlanLimitsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getLimitsForCompany(companyId: string): Promise<PlanLimits>;
    private getResourceLabel;
    private limitError;
    checkBranchLimit(companyId: string): Promise<void>;
    checkUserLimit(companyId: string): Promise<void>;
    checkDealerLimit(companyId: string): Promise<void>;
    checkProductLimit(companyId: string): Promise<void>;
    checkBotAllowed(companyId: string): Promise<void>;
    checkBotLimit(companyId: string): Promise<void>;
    checkFeatureAllowed(companyId: string, feature: keyof PlanLimits): Promise<void>;
}
export {};
