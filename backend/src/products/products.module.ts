import { Module } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { PlanLimitsService } from "../common/services/plan-limits.service";

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController],
  providers: [ProductsService, PlanLimitsService],
  exports: [ProductsService],
})
export class ProductsModule {}
