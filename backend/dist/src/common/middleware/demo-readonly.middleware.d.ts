import { NestMiddleware } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma/prisma.service";
export declare class DemoReadonlyMiddleware implements NestMiddleware {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    use(req: any, _res: any, next: () => void): Promise<void>;
}
