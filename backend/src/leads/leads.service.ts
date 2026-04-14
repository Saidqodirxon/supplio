import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { TelegramLoggerService } from "../telegram/telegram-logger.service";

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private prisma: PrismaService,
    private telegramLogger: TelegramLoggerService,
  ) {}

  async createLead(data: { fullName: string; phone: string; info?: string }) {
    const lead = await this.prisma.lead.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        info: data.info,
      },
    });

    this.telegramLogger.sendLeadNotification(lead).catch(() => {});
    return lead;
  }

  async getAllLeads() {
    return this.prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async updateLeadStatus(id: string, status: string) {
    return this.prisma.lead.update({
      where: { id },
      data: { status },
    });
  }
}
