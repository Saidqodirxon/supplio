import { Module } from "@nestjs/common";
import { AuditLogService } from "./audit-log.service";
import { PrismaService } from "../../prisma/prisma.service";
import { BackupService } from './backup/backup.service';

@Module({
  providers: [AuditLogService, PrismaService, BackupService],
  exports: [AuditLogService],
})
export class AuditLogModule {}
