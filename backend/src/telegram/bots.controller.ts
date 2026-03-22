import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from "@nestjs/common";
import { TelegramService } from "./telegram.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { TenantGuard } from "../common/middleware/tenant.guard";
import { RolesGuard } from "../common/middleware/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("telegram")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class BotsController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get("bots")
  @Roles("OWNER", "MANAGER", "SUPER_ADMIN")
  async getBots(@Req() req: any) {
    const bots = await this.telegramService.getBotsForCompany(req.companyId);
    return bots.map(b => ({ ...b, status: this.telegramService.getBotStatus(req.companyId) }));
  }

  @Post("bots/validate")
  @Roles("OWNER", "SUPER_ADMIN")
  async validateToken(@Body() body: { token: string }) {
    return this.telegramService.validateToken(body.token);
  }

  @Get("bots/status")
  @Roles("OWNER", "MANAGER", "SUPER_ADMIN")
  async getBotStatus(@Req() req: any) {
    return { status: this.telegramService.getBotStatus(req.companyId) };
  }

  @Post("bots")
  @Roles("OWNER", "SUPER_ADMIN")
  async createBot(
    @Req() req: any,
    @Body() body: { token: string; botName?: string; description?: string }
  ) {
    return this.telegramService.createBot(req.companyId, body);
  }

  @Patch("bots/:id")
  @Roles("OWNER", "SUPER_ADMIN")
  async updateBot(
    @Req() req: any,
    @Param("id") id: string,
    @Body() body: { token?: string; botName?: string; description?: string; isActive?: boolean }
  ) {
    return this.telegramService.updateBot(id, req.companyId, body);
  }

  @Delete("bots/:id")
  @Roles("OWNER", "SUPER_ADMIN")
  async removeBot(@Req() req: any, @Param("id") id: string) {
    return this.telegramService.removeBot(id, req.companyId);
  }

  /** POST /telegram/broadcast — send a message to all registered dealers */
  @Post("broadcast")
  @Roles("OWNER", "MANAGER", "SUPER_ADMIN")
  async broadcast(@Req() req: any, @Body() body: { message: string }) {
    return this.telegramService.broadcast(req.companyId, body.message);
  }
}
