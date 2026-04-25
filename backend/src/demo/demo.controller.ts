import { Controller, Post, Get, Body, Logger, UseGuards } from "@nestjs/common";
import { DemoService } from "./demo.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/middleware/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("demo")
export class DemoController {
  private readonly logger = new Logger(DemoController.name);

  constructor(private readonly demoService: DemoService) {}

  /** Trigger manual demo reset — SUPER_ADMIN only */
  @Post("reset")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async triggerReset() {
    this.logger.log("Manual demo reset triggered");
    await this.demoService.handleDailyReset();
    return { success: true, message: "Demo environment reset complete" };
  }

  /** Get demo status */
  @Get("status")
  async getStatus() {
    return {
      active: true,
      environment: "demo",
      resetSchedule: "Daily at midnight",
      lastReset: new Date().toISOString(),
    };
  }

  /** Get all demo data (public, no auth) */
  @Get("data")
  async getDemoData() {
    return this.demoService.getDemoData();
  }

  /** Request demo access — creates lead and returns demo credentials */
  @Post("access")
  async requestDemoAccess(@Body() body: { fullName: string; phone: string; company?: string }) {
    return this.demoService.requestDemoAccess(body);
  }

  @Get("news")
  async getDemoNews() {
    return this.demoService.getDemoNews();
  }

  @Get("tariffs")
  async getDemoTariffs() {
    return this.demoService.getDemoTariffs();
  }

  @Get("stores")
  async getDemoStores() {
    return this.demoService.getDemoStores();
  }
}
