import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from "@nestjs/common";
import { TelegramService } from "./telegram.service";
import { CompanyNotifierService } from "./company-notifier.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { TenantGuard } from "../common/middleware/tenant.guard";
import { RolesGuard } from "../common/middleware/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("telegram")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class BotsController {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly companyNotifier: CompanyNotifierService
  ) {}

  @Get("bots")
  @Roles("OWNER", "MANAGER", "SUPER_ADMIN")
  async getBots(@Req() req: any) {
    const bots = await this.telegramService.getBotsForCompany(req.companyId);
    return bots.map((b) => ({
      ...b,
      status: this.telegramService.getBotStatus(b.id),
    }));
  }

  @Post("bots/validate")
  @Roles("OWNER", "SUPER_ADMIN")
  async validateToken(@Body() body: { token: string }) {
    return this.telegramService.validateToken(body.token);
  }

  @Get("bots/status")
  @Roles("OWNER", "MANAGER", "SUPER_ADMIN")
  async getBotStatus(@Req() req: any) {
    const bots = await this.telegramService.getBotsForCompany(req.companyId);
    const firstBot = bots.find((b) => b.isActive);
    if (!firstBot) return { status: "not_found" };
    return { status: this.telegramService.getBotStatus(firstBot.id) };
  }

  @Post("bots")
  @Roles("OWNER", "MANAGER", "SUPER_ADMIN")
  async createBot(
    @Req() req: any,
    @Body() body: { token: string; botName?: string; description?: string }
  ) {
    return this.telegramService.createBot(req.companyId, body);
  }

  @Patch("bots/:id")
  @Roles("OWNER", "MANAGER", "SUPER_ADMIN")
  async updateBot(
    @Req() req: any,
    @Param("id") id: string,
    @Body()
    body: {
      token?: string;
      botName?: string;
      description?: string;
      isActive?: boolean;
    }
  ) {
    return this.telegramService.updateBot(id, req.companyId, body);
  }

  @Delete("bots/:id")
  @Roles("OWNER", "MANAGER", "SUPER_ADMIN")
  async removeBot(@Req() req: any, @Param("id") id: string) {
    return this.telegramService.removeBot(id, req.companyId);
  }

  /** POST /telegram/broadcast — send a message to all registered dealers */
  @Post("broadcast")
  @Roles("OWNER", "MANAGER", "SUPER_ADMIN")
  async broadcast(@Req() req: any, @Body() body: { message: string }) {
    return this.telegramService.broadcast(req.companyId, body.message);
  }

  @Post("bots/reload")
  @Roles("OWNER", "MANAGER", "SUPER_ADMIN")
  async reloadBots(@Req() req: any) {
    return this.telegramService.reloadCompanyBots(req.companyId);
  }

  @Post("bots/:id/branding")
  @Roles("OWNER", "MANAGER", "SUPER_ADMIN")
  async applyBotBranding(@Req() req: any, @Param("id") id: string) {
    const bots = await this.telegramService.getBotsForCompany(req.companyId);
    const bot = bots.find((b) => b.id === id);
    if (!bot) return { error: "Bot not found" };
    return this.telegramService.applyBotBranding(bot.token, req.companyId);
  }

  @Post("admin/bots")
  @Roles("SUPER_ADMIN")
  async adminCreateBot(
    @Body()
    body: {
      companyId: string;
      token: string;
      botName?: string;
      description?: string;
    }
  ) {
    return this.telegramService.createBot(body.companyId, {
      token: body.token,
      botName: body.botName,
      description: body.description,
    });
  }

  @Post("groups/test/:type")
  @Roles("OWNER", "SUPER_ADMIN")
  async testGroup(@Req() req: any, @Param("type") type: "log" | "order") {
    return this.companyNotifier.testGroup(req.companyId, type);
  }

  @Post("groups/report")
  @Roles("OWNER", "SUPER_ADMIN")
  async sendManualReport(@Req() req: any) {
    await this.companyNotifier.sendDailyReport(req.companyId);
    return { ok: true };
  }

  @Get("admin/bots")
  @Roles("SUPER_ADMIN")
  async getAllBotsAdmin() {
    return this.telegramService.getAllBotsAdmin();
  }

  @Post("admin/bots/reload-all")
  @Roles("SUPER_ADMIN")
  async adminReloadAllBots() {
    return this.telegramService.adminReloadAllBots();
  }

  @Post("admin/bots/:id/reload")
  @Roles("SUPER_ADMIN")
  async adminReloadBot(@Param("id") id: string) {
    return this.telegramService.adminReloadBot(id);
  }

  @Patch("admin/bots/:id")
  @Roles("SUPER_ADMIN")
  async adminUpdateBot(
    @Param("id") id: string,
    @Body()
    body: {
      token?: string;
      isActive?: boolean;
      botName?: string;
      description?: string;
    }
  ) {
    return this.telegramService.adminUpdateBot(id, body);
  }

  @Delete("admin/bots/all")
  @Roles("SUPER_ADMIN")
  async adminDeleteAllBots() {
    return this.telegramService.adminDeleteAllBots();
  }

  @Delete("admin/bots/:id")
  @Roles("SUPER_ADMIN")
  async adminHardDeleteBot(@Param("id") id: string) {
    return this.telegramService.adminHardDeleteBot(id);
  }
}
