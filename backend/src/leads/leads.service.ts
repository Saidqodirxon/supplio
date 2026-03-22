import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Telegraf } from "telegraf";

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);
  private adminBot: Telegraf | null = null;

  constructor(private prisma: PrismaService) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token) {
      this.adminBot = new Telegraf(token);
    }
  }

  async createLead(data: { fullName: string; phone: string; info?: string }) {
    const lead = await this.prisma.lead.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        info: data.info,
      },
    });

    await this.notifyAdmin(lead);
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

  private async notifyAdmin(lead: any) {
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (!this.adminBot || !chatId) return;

    const message = `🚀 New Lead!\nName: ${lead.fullName}\nPhone: ${lead.phone}\nInfo: ${lead.info || "None"}`;

    try {
      await this.adminBot.telegram.sendMessage(chatId, message);
    } catch (e) {
      this.logger.error("Failed to send TG notification");
    }
  }
}
