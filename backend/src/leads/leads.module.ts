import { Module } from "@nestjs/common";
import { LeadsController } from "./leads.controller";
import { LeadsService } from "./leads.service";
import { PrismaModule } from "../prisma/prisma.module";
import { TelegramLoggerService } from "../telegram/telegram-logger.service";

@Module({
  imports: [PrismaModule],
  controllers: [LeadsController],
  providers: [LeadsService, TelegramLoggerService],
})
export class LeadsModule {}
