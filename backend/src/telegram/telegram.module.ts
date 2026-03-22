import { Module } from "@nestjs/common";
import { TelegramService } from "./telegram.service";
import { TelegramController } from "./telegram.controller";
import { BotsController } from "./bots.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { TelegramLoggerService } from "./telegram-logger.service";

@Module({
  imports: [PrismaModule],
  controllers: [TelegramController, BotsController],
  providers: [TelegramService, TelegramLoggerService],
  exports: [TelegramService, TelegramLoggerService],
})
export class TelegramModule {}
