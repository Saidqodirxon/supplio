import { Module } from "@nestjs/common";
import { TelegramService } from "./telegram.service";
import { TelegramController } from "./telegram.controller";
import { BotsController } from "./bots.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { TelegramLoggerService } from "./telegram-logger.service";
import { PlanLimitsService } from "../common/services/plan-limits.service";
import { CompanyNotifierService } from "./company-notifier.service";

@Module({
  imports: [PrismaModule],
  controllers: [TelegramController, BotsController],
  providers: [TelegramService, TelegramLoggerService, PlanLimitsService, CompanyNotifierService],
  exports: [TelegramService, TelegramLoggerService, CompanyNotifierService],
})
export class TelegramModule {}
