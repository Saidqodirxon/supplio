import { Module } from "@nestjs/common";
import { CompanyController } from "./company.controller";
import { CompanyService } from "./company.service";
import { PrismaModule } from "../prisma/prisma.module";
import { PlanLimitsService } from "../common/services/plan-limits.service";

@Module({
  imports: [PrismaModule],
  controllers: [CompanyController],
  providers: [CompanyService, PlanLimitsService],
})
export class CompanyModule {}
