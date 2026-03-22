import { OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
export declare class TelegramBotManager implements OnModuleInit, OnModuleDestroy {
    private prisma;
    private readonly logger;
    private sharedBot;
    private dedicatedInstances;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private _initSharedBot;
    private _syncCustomBots;
    attachCustomBot(companyId: string, token: string): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
