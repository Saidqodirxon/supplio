import { NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { PrismaService } from "../../prisma/prisma.service";
export declare class DemoReadOnlyInterceptor implements NestInterceptor {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly BLOCKED_PATTERNS;
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>>;
}
