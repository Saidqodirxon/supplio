import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import { UnitsService } from "./units.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { TenantGuard } from "../common/middleware/tenant.guard";
import { RolesGuard } from "../common/middleware/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("units")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER", "SALES", "DELIVERY")
  async findAll(@Req() req: any) {
    return this.unitsService.findAll(req.companyId);
  }

  @Post()
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async create(
    @Req() req: any,
    @Body() body: { name: string; symbol?: string }
  ) {
    return this.unitsService.create(req.companyId, body);
  }

  @Patch(":id")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async update(
    @Req() req: any,
    @Param("id") id: string,
    @Body() body: { name?: string; symbol?: string }
  ) {
    return this.unitsService.update(id, req.companyId, body);
  }

  @Delete(":id")
  @Roles("SUPER_ADMIN", "OWNER", "MANAGER")
  async remove(@Req() req: any, @Param("id") id: string) {
    return this.unitsService.remove(id, req.companyId);
  }
}
