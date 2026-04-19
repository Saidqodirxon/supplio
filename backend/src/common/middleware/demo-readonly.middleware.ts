import { ForbiddenException, Injectable, NestMiddleware } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma/prisma.service";

// Only these URL patterns are blocked in demo mode
const BLOCKED_PATTERNS = [
  "/api/auth/change-password",
  "/api/auth/password",
  "/api/profile/password",
  "/api/company/me",         // company profile/settings edit
  "/api/telegram/bots",      // bot creation/deletion
];

// These prefixes are always allowed even in demo
const ALWAYS_ALLOWED = [
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

    if (ALWAYS_ALLOWED.some((prefix) => path.startsWith(prefix))) {
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

      if (!payload?.sub) return next();

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { company: { select: { isDemo: true } } },
      });

      if (!user?.company?.isDemo) return next();

      // In demo mode: block only sensitive operations
      const isBlocked = BLOCKED_PATTERNS.some((p) => path.includes(p));
      if (isBlocked) {
        throw new ForbiddenException(
          "Demo rejimida bu amalni bajarib bo'lmaydi. Parolni, bot va tashkilot sozlamalarini o'zgartirish cheklangan."
        );
      }

      // Block DELETE on telegram bots
      if (method === "DELETE" && path.includes("/api/telegram")) {
        throw new ForbiddenException("Demo rejimida bot o'chirib bo'lmaydi.");
      }

      return next();
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      return next();
    }
  }
}
