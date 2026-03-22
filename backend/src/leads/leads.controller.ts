import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from "@nestjs/common";
import { LeadsService } from "./leads.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/middleware/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RoleType } from "@prisma/client";

@Controller("leads")
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(
    @Body() createLeadDto: { fullName: string; phone: string; info?: string }
  ) {
    return this.leadsService.createLead(createLeadDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  findAll() {
    return this.leadsService.getAllLeads();
  }

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  updateStatus(@Param("id") id: string, @Body("status") status: string) {
    return this.leadsService.updateLeadStatus(id, status);
  }
}
