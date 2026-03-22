import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { SuperAdminController } from "./super-admin.controller";
import { SuperAdminService } from "./super-admin.service";
import { PrismaService } from "../prisma/prisma.service";
import { AnalyticsService } from "../analytics/analytics.service";
import { BackupService } from "../common/services/backup/backup.service";
import { UnitsService } from "../units/units.service";

@Module({
  imports: [ScheduleModule],
  controllers: [SuperAdminController],
  providers: [
    SuperAdminService,
    PrismaService,
    AnalyticsService,
    BackupService,
    UnitsService,
  ],
  exports: [SuperAdminService],
})
export class SuperAdminModule {}
