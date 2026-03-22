import { Controller, Get, Post, Patch, Body, Req, Param, UseGuards } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { TenantGuard } from "../common/middleware/tenant.guard";
import { RolesGuard } from "../common/middleware/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
// Role enum is RoleType in our schema
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

@Controller("orders")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER", "SALES", "SELLER")
  async create(@Req() req: AuthenticatedRequest, @Body() body: any) {
    return this.ordersService.create(req.companyId, body);
  }

  @Get()
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER", "SALES", "DELIVERY", "SELLER")
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.ordersService.findAll(req.companyId);
  }

  @Get("dealer/:dealerId")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER", "SALES", "DELIVERY", "SELLER")
  async findByDealer(@Req() req: AuthenticatedRequest, @Param("dealerId") dealerId: string) {
    return this.ordersService.findByDealer(req.companyId, dealerId);
  }

  @Get(":id")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER", "SALES", "DELIVERY", "SELLER")
  async findOne(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.ordersService.findOne(req.companyId, id);
  }

  @Patch(":id/status")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER", "SALES", "SELLER")
  async updateStatus(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: { status: string },
  ) {
    return this.ordersService.updateStatus(req.companyId, id, body.status);
  }
}
