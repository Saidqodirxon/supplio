import { Controller, Get, Patch, Body, Req, UseGuards } from "@nestjs/common";
import { CompanyService } from "./company.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/middleware/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("company")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get("me")
  @Roles("OWNER", "MANAGER")
  async getMyCompany(@Req() req: any) {
    return this.companyService.getCompany(req.user.companyId);
  }

  @Patch("me")
  @Roles("OWNER")
  async updateMyCompany(@Req() req: any, @Body() body: any) {
    return this.companyService.updateCompany(req.user.companyId, body);
  }

  @Get("subscription")
  @Roles("OWNER", "MANAGER")
  async getSubscription(@Req() req: any) {
    return this.companyService.getSubscriptionInfo(req.user.companyId);
  }

  @Get("users")
  @Roles("OWNER", "MANAGER")
  async getUsers(@Req() req: any) {
    return this.companyService.getUsers(req.user.companyId);
  }

  @Get("features")
  @Roles("OWNER", "MANAGER", "SALES")
  async getFeatures(@Req() req: any) {
    return this.companyService.getFeatureFlags(req.user.companyId);
  }
}
