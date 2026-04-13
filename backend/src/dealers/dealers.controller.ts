import { Controller, Get, Post, Patch, Delete, Body, Req, Param, UseGuards } from "@nestjs/common";
import { DealersService } from "./dealers.service";
import { TelegramService } from "../telegram/telegram.service";
import { TenantGuard } from "../common/middleware/tenant.guard";
import { RolesGuard } from "../common/middleware/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Request } from "express";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    phone: string;
    companyId: string;
    branchId?: string | null;
    roleType: string;
  };
  companyId: string;
}

@Controller("dealers")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class DealersController {
  constructor(
    private readonly dealersService: DealersService,
    private readonly telegramService: TelegramService,
  ) {}

  @Post()
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async create(@Req() req: AuthenticatedRequest, @Body() body: any) {
    return this.dealersService.create(req.companyId, body);
  }

  @Get()
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER", "STAFF")
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.dealersService.findAll(req.companyId, req.user);
  }

  @Get("pending-approvals")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async getPendingApprovals(@Req() req: AuthenticatedRequest) {
    return this.dealersService.getPendingApprovals(req.companyId);
  }

  @Patch(":id")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async update(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: any
  ) {
    return this.dealersService.update(id, req.companyId, body);
  }

  @Delete(":id")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async remove(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.dealersService.remove(id, req.companyId, req.user.id);
  }

  @Post(":id/approve")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async approve(@Req() req: AuthenticatedRequest, @Param("id") id: string, @Body() body: { creditLimit?: number }) {
    const result = await this.dealersService.approveDealer(id, req.companyId, req.user.id, body?.creditLimit);
    this.telegramService.notifyDealerApprovalResult(req.companyId, id, true).catch(() => {});
    return result;
  }

  @Post(":id/reject")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async reject(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    const result = await this.dealersService.rejectDealer(id, req.companyId, req.user.id);
    this.telegramService.notifyDealerApprovalResult(req.companyId, id, false).catch(() => {});
    return result;
  }

  @Post(":id/block")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async block(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.dealersService.block(id, req.companyId);
  }

  @Post(":id/unblock")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async unblock(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.dealersService.unblock(id, req.companyId);
  }
}
