import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(
    companyId: string,
    data: {
      amount: number;
      category: string;
      description?: string;
      branchId?: string;
    }
  ) {
    // Create ledger entry
    await this.prisma.ledgerTransaction.create({
      data: {
        companyId,
        branchId: data.branchId,
        type: "EXPENSE",
        amount: data.amount,
        note: `${data.category}: ${data.description || ""}`,
      },
    });

    return this.prisma.expense.create({
      data: {
        companyId,
        branchId: data.branchId,
        amount: data.amount,
        category: data.category,
        description: data.description,
      },
      include: { branch: { select: { name: true } } },
    });
  }

  async findAll(companyId: string, branchId?: string) {
    return this.prisma.expense.findMany({
      where: {
        companyId,
        deletedAt: null,
        ...(branchId ? { branchId } : {}),
      },
      include: { branch: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, companyId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { branch: { select: { name: true } } },
    });
    if (!expense) throw new NotFoundException("Expense not found");
    return expense;
  }

  async remove(id: string, companyId: string, deletedBy: string) {
    await this.findOne(id, companyId);
    return this.prisma.expense.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }

  async getSummary(companyId: string) {
    const expenses = await this.prisma.expense.findMany({
      where: { companyId, deletedAt: null },
      select: { amount: true, category: true },
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    const byCategory: Record<string, number> = {};
    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    return { total, byCategory };
  }
}
