import { ForbiddenException, Injectable, NestMiddleware } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma/prisma.service";

const DEMO_VIEWER_PHONE = "+998000000000";
const SAFE_MUTATING_PATH_PREFIXES = [
  "/api/auth/login",
  "/api/leads",
  "/api/demo/access",
];

@Injectable()
export class DemoReadonlyMiddleware implements NestMiddleware {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async use(req: any, _res: any, next: () => void) {
    const method = String(req.method || "GET").toUpperCase();
    if (["GET", "HEAD", "OPTIONS"].includes(method)) {
      return next();
    }

    const path = String(req.originalUrl || req.url || "").split("?")[0];
    if (SAFE_MUTATING_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      return next();
    }

    const demoHeader = String(
      req.headers?.["x-supplio-demo"] || ""
    ).toLowerCase();
    const accessHeader = String(
      req.headers?.["x-supplio-demo-access"] || ""
    ).toLowerCase();
    const isDemoRequest = demoHeader === "true" || demoHeader === "1";
    const isFullAccess =
      accessHeader === "full" ||
      accessHeader === "edit" ||
      accessHeader === "write";

    if (!isDemoRequest) {
      return next();
    }

    const authHeader = String(req.headers?.authorization || "");
    if (!authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.slice(7);

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || "secretKey",
      }) as { sub?: string };

      if (!payload?.sub) {
        return next();
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          phone: true,
          company: { select: { isDemo: true } },
        },
      });

      if (!user?.company?.isDemo) {
        return next();
      }

      if (user.phone === DEMO_VIEWER_PHONE && !isFullAccess) {
        throw new ForbiddenException(
          "DEMO_READ_ONLY: Bu demo akkaunt faqat ko'rish uchun. Edit/Create uchun demo so'rov yuboring."
        );
      }

      return next();
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      return next();
    }
  }
}
