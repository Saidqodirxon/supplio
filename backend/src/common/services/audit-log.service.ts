import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(payload: {
    userId?: string;
    action: string;
    resource?: string;
    metadata?: any;
    ip?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: payload.userId,
        action: payload.action,
        resource: payload.resource,
        metadata: payload.metadata || {},
        ip: payload.ip,
      },
    });
  }

  async getLogs(filters: { userId?: string; action?: string; limit?: number }) {
    return this.prisma.auditLog.findMany({
      where: {
        userId: filters.userId,
        action: filters.action,
      },
      take: filters.limit || 100,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });
  }
}
