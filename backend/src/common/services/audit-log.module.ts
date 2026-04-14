import { Module } from "@nestjs/common";
import { AuditLogService } from "./audit-log.service";
import { PrismaService } from "../../prisma/prisma.service";
import { BackupService } from './backup/backup.service';
import { TelegramLoggerService } from '../../telegram/telegram-logger.service';
import { CompanyNotifierService } from '../../telegram/company-notifier.service';

@Module({
  providers: [AuditLogService, PrismaService, BackupService, TelegramLoggerService, CompanyNotifierService],
  exports: [AuditLogService, BackupService],
})
export class AuditLogModule {}
