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
 * Enterprise Demo Isolation Guard
 *
 * Ensures that Demo environments are Read-Only by default for anonymous
 * or public trial users, preventing data corruption in the shared demo DB.
 */
@Injectable()
export class DemoReadOnlyInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { method, headers } = request;

    // 1. Identify Demo Context (via header or subdomain)
    const companyId = headers["x-company-id"];
    if (!companyId) return next.handle();

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { isDemo: true },
    });

    // 2. Enforce Read-Only for mutating methods in Demo mode
    // Standard ENTERPRISE policy: Allowed only 'GET' or whitelisted test actions.
    const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

    if (company?.isDemo && isMutating) {
      // Whitelist certain demo interactions if needed (e.g. creating an order for UX testing)
      const whitelistedPaths = ["/demo/test-action", "/orders/preview"];
      const isWhitelisted = whitelistedPaths.some((path) =>
        request.url.includes(path)
      );

      if (!isWhitelisted) {
        throw new ForbiddenException(
          "DEMO_MODE_RESTRICTION: This is 100% read-only demo environment. Data persistence is disabled to protect shared mock data. To test full capability, please request a Private Trial."
        );
      }
    }

    return next.handle();
  }
}
