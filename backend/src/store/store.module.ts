import { Module } from "@nestjs/common";
import { StoreController } from "./store.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { PlanLimitsService } from "../common/services/plan-limits.service";

@Module({
  imports: [PrismaModule],
  controllers: [StoreController],
  providers: [PlanLimitsService],
})
export class StoreModule {}
