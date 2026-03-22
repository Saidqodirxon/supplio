import { Controller, Get, Post, Param, Body, Req, UseGuards } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { TenantGuard } from "../common/middleware/tenant.guard";
import { RolesGuard } from "../common/middleware/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("payments")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER", "SALES")
  async create(@Req() req: any, @Body() body: any) {
    return this.paymentsService.create(req.companyId, body);
  }

  /** POST /payments/adjustment — add credit (+) or debit (-) adjustment for a dealer */
  @Post("adjustment")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async createAdjustment(@Req() req: any, @Body() body: any) {
    return this.paymentsService.createAdjustment(req.companyId, body);
  }

  @Get()
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER", "SALES", "DELIVERY")
  async findAll(@Req() req: any) {
    return this.paymentsService.findAll(req.companyId);
  }

  /** GET /payments/dealer/:dealerId — real-time debt breakdown for one dealer */
  @Get("dealer/:dealerId")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER", "SALES")
  async getDealerDebt(@Req() req: any, @Param("dealerId") dealerId: string) {
    return this.paymentsService.getDealerDebt(req.companyId, dealerId);
  }
}
