import { Controller, Post, Param, Body, Logger } from "@nestjs/common";
import { TelegramService } from "./telegram.service";
import { Update } from "telegraf/typings/core/types/typegram";

@Controller("webhook")
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(private readonly telegramService: TelegramService) {}

  @Post(":companyId")
  async handleWebhook(
    @Param("companyId") companyId: string,
    @Body() update: Update
  ) {
    this.logger.log(`Received update for company: ${companyId}`);
    const bot = this.telegramService.getBot(companyId);
    if (bot) {
      await bot.handleUpdate(update);
    }
    return { ok: true };
  }
}
