import { Module } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsController } from "./analytics.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { PlanLimitsService } from "../common/services/plan-limits.service";

@Module({
  imports: [PrismaModule],
  providers: [AnalyticsService, PlanLimitsService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
