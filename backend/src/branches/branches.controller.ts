import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Req,
  UseGuards,
  Param,
} from "@nestjs/common";
import { BranchesService } from "./branches.service";
import { TenantGuard } from "../common/middleware/tenant.guard";
import { RolesGuard } from "../common/middleware/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("branches")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @Roles("OWNER", "SUPER_ADMIN")
  async create(
    @Req() req: any,
    @Body() body: { name: string; address?: string; phone?: string }
  ) {
    return this.branchesService.create(req.companyId, body);
  }

  @Get()
  @Roles("OWNER", "MANAGER", "SUPER_ADMIN")
  async findAll(@Req() req: any) {
    return this.branchesService.findAll(req.companyId);
  }

  @Get(":id")
  @Roles("OWNER", "MANAGER", "SUPER_ADMIN")
  async findOne(@Req() req: any, @Param("id") id: string) {
    return this.branchesService.findOne(req.companyId, id);
  }

  @Patch(":id")
  @Roles("OWNER", "SUPER_ADMIN")
  async update(
    @Req() req: any,
    @Param("id") id: string,
    @Body() body: { name?: string; address?: string; phone?: string }
  ) {
    return this.branchesService.update(req.companyId, id, body);
  }

  @Patch(":id/restore")
  @Roles("OWNER", "SUPER_ADMIN")
  async restore(@Req() req: any, @Param("id") id: string) {
    return this.branchesService.restore(req.companyId, id);
  }

  @Delete(":id")
  @Roles("OWNER", "SUPER_ADMIN")
  async remove(@Req() req: any, @Param("id") id: string) {
    return this.branchesService.remove(req.companyId, id, req.user?.id || "system");
  }
}
