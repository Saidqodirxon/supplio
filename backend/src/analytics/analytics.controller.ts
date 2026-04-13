import { Controller, Get, Query, UseGuards, Req } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/middleware/roles.guard";
import { TenantGuard } from "../common/middleware/tenant.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { Request } from "express";
import { PlanLimitsService } from "../common/services/plan-limits.service";

interface AuthenticatedRequest extends Request {
  user: { id: string; phone: string; companyId: string; roleType: string };
  companyId: string;
}

@Controller("analytics")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly planLimits: PlanLimitsService
  ) {}

  private async ensureAnalyticsAllowed(companyId: string) {
    await this.planLimits.checkFeatureAllowed(companyId, "allowAnalytics");
  }

  @Get("dashboard")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER", "SALES")
  async getDashboardStats(
    @Req() req: AuthenticatedRequest,
    @Query("period") period?: string,
  ) {
    const companyId = req.companyId || req.user.companyId;
    await this.ensureAnalyticsAllowed(companyId);
    const p = (["7d", "30d", "1y", "all"].includes(period ?? "") ? period : "7d") as any;
    return this.analyticsService.getDashboardStats(companyId, p);
  }

  @Get("top-dealers")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async getTopDealers(@Req() req: AuthenticatedRequest, @Query("limit") limit?: string) {
    const companyId = req.companyId || req.user.companyId;
    await this.ensureAnalyticsAllowed(companyId);
    return this.analyticsService.getTopDealers(companyId, limit ? Number(limit) : 5);
  }

  @Get("top-products")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER", "SALES")
  async getTopProducts(@Req() req: AuthenticatedRequest, @Query("limit") limit?: string) {
    const companyId = req.companyId || req.user.companyId;
    await this.ensureAnalyticsAllowed(companyId);
    return this.analyticsService.getTopProducts(companyId, limit ? Number(limit) : 5);
  }

  @Get("debts")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER", "SALES")
  async getDebtReport(@Req() req: AuthenticatedRequest) {
    const companyId = req.companyId || req.user.companyId;
    await this.ensureAnalyticsAllowed(companyId);
    return this.analyticsService.getDebtReport(companyId);
  }

  @Get("root")
  @Roles("SUPER_ADMIN")
  async getRootStats() {
    return this.analyticsService.getSuperAdminGlobalStats();
  }
}
