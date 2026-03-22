import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.unit.findMany({
      where: {
        OR: [{ companyId }, { companyId: null }],
        deletedAt: null,
      },
      orderBy: { name: "asc" },
    });
  }

  async create(companyId: string, data: { name: string; symbol?: string }) {
    return this.prisma.unit.create({
      data: { companyId, name: data.name, symbol: data.symbol ?? "" },
    });
  }

  async update(id: string, companyId: string, data: { name?: string; symbol?: string }) {
    const unit = await this.prisma.unit.findFirst({
      where: { id, companyId, deletedAt: null },
    });
    if (!unit) throw new NotFoundException("Unit not found");
    return this.prisma.unit.update({ where: { id }, data });
  }

  async remove(id: string, companyId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { id, companyId, deletedAt: null },
    });
    if (!unit) throw new NotFoundException("Unit not found");
    return this.prisma.unit.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async seedDefaults() {
    const defaults = [
      { name: "Dona", symbol: "dona" },
      { name: "Kilogramm", symbol: "kg" },
      { name: "Gramm", symbol: "g" },
      { name: "Litr", symbol: "l" },
      { name: "Millilitr", symbol: "ml" },
      { name: "Metr", symbol: "m" },
      { name: "Santimetr", symbol: "sm" },
      { name: "Quti", symbol: "quti" },
      { name: "Paket", symbol: "paket" },
    ];

    for (const d of defaults) {
      const exists = await this.prisma.unit.findFirst({
        where: { name: d.name, companyId: null },
      });
      if (!exists) {
        await this.prisma.unit.create({ data: d });
      }
    }
  }
}
