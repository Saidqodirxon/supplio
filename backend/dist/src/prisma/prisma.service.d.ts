import { OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    onModuleInit(): Promise<void>;
    private _applySchemaPatches;
    onModuleDestroy(): Promise<void>;
}
