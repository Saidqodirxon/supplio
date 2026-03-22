import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SubscriptionStatus } from "@prisma/client";

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("SEC_ERR: Authentication missing");
    }

    if (user.roleType === "SUPER_ADMIN") {
      // Allow SuperAdmin to impersonate any company via header
      const targetCompanyId = request.headers['x-company-id'] || user.companyId;
      if (targetCompanyId) {
        request.companyId = targetCompanyId as string;
      }
      return true;
    }
    if (!user.companyId) {
      throw new ForbiddenException("SEC_ERR: Tenant identification missing");
    }

    const company = await this.prisma.company.findUnique({
      where: { id: user.companyId },
      include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    if (!company) {
      throw new ForbiddenException("SEC_ERR: Registered Company not found");
    }

    // 1. Check Global System Maintenance (Enterprise Requirement 4)
    const settings = await this.prisma.systemSettings.findUnique({
      where: { id: "GLOBAL" },
    });
    if (settings?.maintenanceMode && user.roleType !== "SUPER_ADMIN") {
      throw new ServiceUnavailableException(
        "SYSTEM_MAINTENANCE: Try again in 30 minutes."
      );
    }

    // 2. Continuous Subscription Lockdown (Enterprise Requirement 8)
    const now = new Date();

    // Trial Lock
    if (
      company.subscriptionStatus === SubscriptionStatus.TRIAL &&
      now > company.trialExpiresAt
    ) {
      throw new ForbiddenException({
        statusCode: 403,
        message: "TRIAL_EXPIRED: Your 14-day evaluation has ended.",
        trialEnd: company.trialExpiresAt,
        action: "UPGRADE_PLAN",
      });
    }

    // Payment Arrears / Manual Lock
    if (
      company.subscriptionStatus === SubscriptionStatus.LOCKED ||
      company.subscriptionStatus === SubscriptionStatus.PAST_DUE
    ) {
      throw new ForbiddenException({
        statusCode: 403,
        message: "ACCOUNT_LOCKED: Access restricted due to payment issues.",
        action: "CONTACT_BILLING",
      });
    }

    // 3. Attach Context for Service level usage
    request.company = company;
    request.companyId = company.id;

    return true;
  }
}
