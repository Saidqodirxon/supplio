import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async createTicket(companyId: string, subject: string, message: string) {
    return (this.prisma as any).supportTicket.create({
      data: {
        companyId,
        subject,
        message,
        status: 'OPEN',
        messages: {
          create: {
            message,
            senderType: 'DISTRIBUTOR',
          },
        },
      },
    });
  }

  async getTicketsByCompany(companyId: string) {
    return (this.prisma as any).supportTicket.findMany({
      where: { companyId },
      orderBy: { lastReplyAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async getAllTickets() {
    return (this.prisma as any).supportTicket.findMany({
      orderBy: { lastReplyAt: 'desc' },
      include: {
        company: {
          select: { name: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async getTicketById(id: string) {
    return (this.prisma as any).supportTicket.findUnique({
      where: { id },
      include: {
        company: {
          select: { name: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async addMessage(ticketId: string, senderId: string | null, senderType: 'SUPER_ADMIN' | 'DISTRIBUTOR', message: string) {
    const msg = await (this.prisma as any).supportMessage.create({
      data: {
        ticketId,
        senderId,
        senderType,
        message,
      },
    });

    await (this.prisma as any).supportTicket.update({
      where: { id: ticketId },
      data: {
        lastReplyAt: new Date(),
        status: senderType === 'SUPER_ADMIN' ? 'IN_PROGRESS' : 'OPEN',
      },
    });

    return msg;
  }

  async updateTicketStatus(id: string, status: string) {
    return (this.prisma as any).supportTicket.update({
      where: { id },
      data: { status },
    });
  }
}
