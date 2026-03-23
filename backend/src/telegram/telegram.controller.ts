import { Controller, Post, Param, Body, Logger } from "@nestjs/common";
import { TelegramService } from "./telegram.service";
import { Update } from "telegraf/typings/core/types/typegram";

@Controller("webhook")
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(private readonly telegramService: TelegramService) {}

  @Post(":id")
  async handleWebhook(
    @Param("id") id: string,
    @Body() update: Update
  ) {
    this.logger.log(`Received update for bot ID: ${id}`);
    const bot = this.telegramService.getBot(id);
    if (bot) {
      await bot.handleUpdate(update);
    }
    return { ok: true };
  }
}
