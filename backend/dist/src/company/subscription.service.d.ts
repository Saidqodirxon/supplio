import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionPlan } from "@prisma/client";
import { TelegramBotManager } from "../telegram/telegram-bot.manager";
export declare class SubscriptionService {
    private prisma;
    private botManager;
    private readonly logger;
    constructor(prisma: PrismaService, botManager: TelegramBotManager);
    upgradeCompanyPlan(companyId: string, plan: SubscriptionPlan): Promise<{
        success: boolean;
        plan: import(".prisma/client").$Enums.SubscriptionPlan;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
    }>;
    collectServerMetrics(): Promise<void>;
}
