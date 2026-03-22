import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PlanLimitsService } from "../common/services/plan-limits.service";

@Injectable()
export class BranchesService {
  constructor(
    private prisma: PrismaService,
    private planLimits: PlanLimitsService
  ) {}

  async create(companyId: string, data: { name: string; address?: string; phone?: string }) {
    await this.planLimits.checkBranchLimit(companyId);
    return this.prisma.branch.create({
      data: { companyId, name: data.name, address: data.address, phone: data.phone },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.branch.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: { users: true, dealers: true, orders: true },
        },
      },
    });
  }

  async findOne(companyId: string, id: string) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch || branch.companyId !== companyId || branch.deletedAt) {
      throw new ForbiddenException("Branch not found or access denied");
    }
    return branch;
  }

  async update(
    companyId: string,
    id: string,
    data: { name?: string; address?: string; phone?: string }
  ) {
    await this.findOne(companyId, id);
    return this.prisma.branch.update({ where: { id }, data });
  }

  async remove(companyId: string, id: string, deletedBy: string) {
    await this.findOne(companyId, id);
    return this.prisma.branch.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }

  async restore(companyId: string, id: string) {
    const branch = await this.prisma.branch.findFirst({ where: { id, companyId } });
    if (!branch) throw new NotFoundException("Branch not found");
    return this.prisma.branch.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null },
    });
  }
}
