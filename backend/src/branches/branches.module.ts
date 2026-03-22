import { Module } from "@nestjs/common";
import { BranchesService } from "./branches.service";
import { BranchesController } from "./branches.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { PlanLimitsService } from "../common/services/plan-limits.service";

@Module({
  imports: [PrismaModule],
  controllers: [BranchesController],
  providers: [BranchesService, PlanLimitsService],
  exports: [BranchesService],
})
export class BranchesModule {}
