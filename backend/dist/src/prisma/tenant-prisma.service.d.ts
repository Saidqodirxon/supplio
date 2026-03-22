import { OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { Request } from "express";
export declare class TenantPrismaService implements OnModuleInit, OnModuleDestroy {
    private readonly request;
    private _client;
    constructor(request: Request);
    onModuleInit(): Promise<void>;
    get client(): PrismaClient;
    private _attachMiddleware;
    onModuleDestroy(): Promise<void>;
}
