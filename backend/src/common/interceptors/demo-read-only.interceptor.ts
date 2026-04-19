import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * Demo Mode Guard
 *
 * Allows most CRUD operations so users can explore the full system.
 * Blocks only: password changes, bot management, company profile edits.
 * Data resets every 3 days via cron.
 */
@Injectable()
export class DemoReadOnlyInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  // These URL patterns are blocked in demo mode
  private readonly BLOCKED_PATTERNS = [
    "/auth/change-password",
    "/auth/password",
    "/profile/password",
    "/company/me",         // company settings edit
    "/telegram/bots",      // bot creation
    "/company/users",      // adding/removing staff
  ];

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { method, headers, url } = request;

    const companyId = headers["x-company-id"];
    if (!companyId) return next.handle();

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { isDemo: true },
    });

    if (!company?.isDemo) return next.handle();

    const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
    if (!isMutating) return next.handle();

    // Check blocked patterns
    const isBlocked = this.BLOCKED_PATTERNS.some((p) => url.includes(p));
    if (isBlocked) {
      throw new ForbiddenException(
        "Demo rejimida bu amalni bajarib bo'lmaydi. Parolni, bot va tashkilot sozlamalarini o'zgartirish cheklangan."
      );
    }

    // Block DELETE on bots
    if (method === "DELETE" && url.includes("/telegram")) {
      throw new ForbiddenException(
        "Demo rejimida bot o'chirib bo'lmaydi."
      );
    }

    return next.handle();
  }
}
