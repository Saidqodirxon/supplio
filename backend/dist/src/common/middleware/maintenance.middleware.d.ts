import { NestMiddleware } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
export declare class MaintenanceMiddleware implements NestMiddleware {
    private prisma;
    constructor(prisma: PrismaService);
    use(req: any, res: any, next: () => void): Promise<void>;
}
