import { Module } from "@nestjs/common";
import { DealersService } from "./dealers.service";
import { DealersController } from "./dealers.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { PlanLimitsService } from "../common/services/plan-limits.service";
import { TelegramModule } from "../telegram/telegram.module";

@Module({
  imports: [PrismaModule, TelegramModule],
  controllers: [DealersController],
  providers: [DealersService, PlanLimitsService],
})
export class DealersModule {}
