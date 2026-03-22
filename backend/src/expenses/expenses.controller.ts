import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  Query,
} from "@nestjs/common";
import { ExpensesService } from "./expenses.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { TenantGuard } from "../common/middleware/tenant.guard";
import { RolesGuard } from "../common/middleware/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("expenses")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async create(@Req() req: any, @Body() body: any) {
    return this.expensesService.create(req.companyId, body);
  }

  @Get()
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER", "SALES", "DELIVERY", "SELLER")
  async findAll(@Req() req: any, @Query("branchId") branchId?: string) {
    return this.expensesService.findAll(req.companyId, branchId);
  }

  @Get("summary")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER", "SALES", "SELLER")
  async getSummary(@Req() req: any) {
    return this.expensesService.getSummary(req.companyId);
  }

  @Delete(":id")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async remove(@Req() req: any, @Param("id") id: string) {
    return this.expensesService.remove(
      id,
      req.companyId,
      req.user?.id || "system"
    );
  }
}
