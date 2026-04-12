import { Controller, Get, Patch, Post, Delete, Body, Req, UseGuards, Param } from "@nestjs/common";
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
  @Roles("OWNER", "MANAGER", "SUPER_ADMIN")
  async getSubscription(@Req() req: any) {
    return this.companyService.getSubscriptionInfo(req.user.companyId);
  }

  @Get("users")
  @Roles("OWNER", "MANAGER")
  async getUsers(@Req() req: any) {
    return this.companyService.getUsers(req.user.companyId);
  }

  @Post("users")
  @Roles("OWNER", "MANAGER")
  async createStaff(@Req() req: any, @Body() body: any) {
    return this.companyService.createStaff(req.user.companyId, body);
  }

  @Delete("users/:id")
  @Roles("OWNER", "MANAGER")
  async deactivateStaff(@Req() req: any, @Param("id") id: string) {
    return this.companyService.deactivateStaff(req.user.companyId, id);
  }

  @Get("backup")
  @Roles("OWNER")
  async getBackup(@Req() req: any) {
    return this.companyService.getBackup(req.user.companyId);
  }

  @Get("features")
  @Roles("OWNER", "MANAGER", "SALES")
  async getFeatures(@Req() req: any) {
    return this.companyService.getFeatureFlags(req.user.companyId);
  }

  // ── Custom Roles ───────────────────────────────────────────────────────────

  @Get("roles")
  @Roles("OWNER", "MANAGER", "SUPER_ADMIN")
  async getCustomRoles(@Req() req: any) {
    return this.companyService.getCustomRoles(req.user.companyId);
  }

  @Post("roles")
  @Roles("OWNER", "MANAGER", "SUPER_ADMIN")
  async createCustomRole(@Req() req: any, @Body() body: any) {
    return this.companyService.createCustomRole(req.user.companyId, body);
  }

  @Patch("roles/:id")
  @Roles("OWNER", "MANAGER", "SUPER_ADMIN")
  async updateCustomRole(@Req() req: any, @Param("id") id: string, @Body() body: any) {
    return this.companyService.updateCustomRole(req.user.companyId, id, body);
  }

  @Delete("roles/:id")
  @Roles("OWNER", "MANAGER", "SUPER_ADMIN")
  async deleteCustomRole(@Req() req: any, @Param("id") id: string) {
    return this.companyService.deleteCustomRole(req.user.companyId, id);
  }
}
