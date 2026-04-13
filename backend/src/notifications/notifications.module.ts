import { Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller";
import { NotificationService } from "./notifications.service";
import { PrismaModule } from "../prisma/prisma.module";
import { TelegramModule } from "../telegram/telegram.module";
import { PlanLimitsService } from "../common/services/plan-limits.service";

@Module({
  imports: [PrismaModule, TelegramModule],
  controllers: [NotificationsController],
  providers: [NotificationService, PlanLimitsService],
  exports: [NotificationService],
})
export class NotificationsModule {}
