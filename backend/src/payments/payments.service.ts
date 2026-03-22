import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    companyId: string,
    data: { dealerId: string; amount: number; method: string; reference?: string; note?: string; branchId?: string }
  ) {
    return this.prisma.$transaction(async (tx) => {
      const dealer = await tx.dealer.findUnique({
        where: { id: data.dealerId },
        select: { branchId: true },
      });
      if (!dealer) throw new BadRequestException("Dealer not found");

      const payment = await tx.payment.create({
        data: {
          companyId,
          branchId: data.branchId ?? dealer.branchId,
          dealerId: data.dealerId,
          amount: data.amount,
          method: data.method,
          reference: data.reference,
          note: data.note,
        },
      });

      // Ledger: PAYMENT reduces debt
      await tx.ledgerTransaction.create({
        data: {
          companyId,
          branchId: dealer.branchId,
          dealerId: data.dealerId,
          type: "PAYMENT",
          amount: data.amount,
          reference: data.reference,
          note: data.note,
        },
      });

      // Sync denormalised currentDebt (decrement by payment amount)
      await tx.dealer.update({
        where: { id: data.dealerId },
        data: { currentDebt: { decrement: data.amount } },
      });

      return payment;
    });
  }

  /**
   * Adjustment / Refund:
   * - Positive amount  → increases dealer debt (e.g. fee, penalty)
   * - Negative amount  → decreases dealer debt (e.g. refund, correction)
   * Both are stored as TxType.ADJUSTMENT in the ledger.
   */
  async createAdjustment(
    companyId: string,
    data: { dealerId: string; amount: number; note: string; branchId?: string }
  ) {
    return this.prisma.$transaction(async (tx) => {
      const dealer = await tx.dealer.findUnique({
        where: { id: data.dealerId },
        select: { branchId: true },
      });
      if (!dealer) throw new BadRequestException("Dealer not found");

      await tx.ledgerTransaction.create({
        data: {
          companyId,
          branchId: data.branchId ?? dealer.branchId,
          dealerId: data.dealerId,
          type: "ADJUSTMENT",
          amount: data.amount,
          note: data.note,
        },
      });

      // For ADJUSTMENT: positive amount reduces debt (credit), negative increases debt
      await tx.dealer.update({
        where: { id: data.dealerId },
        data: { currentDebt: { decrement: data.amount } },
      });

      return { success: true, amount: data.amount, note: data.note };
    });
  }

  async findAll(companyId: string) {
    return this.prisma.payment.findMany({
      where: { companyId, deletedAt: null },
      include: {
        dealer: { select: { name: true, phone: true } },
        branch: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getDealerDebt(companyId: string, dealerId: string) {
    const [ordersAgg, paymentsAgg, dealer] = await Promise.all([
      this.prisma.ledgerTransaction.aggregate({
        where: { companyId, dealerId, type: "ORDER" },
        _sum: { amount: true },
      }),
      this.prisma.ledgerTransaction.aggregate({
        where: { companyId, dealerId, type: { in: ["PAYMENT", "ADJUSTMENT"] } },
        _sum: { amount: true },
      }),
      this.prisma.dealer.findFirst({
        where: { id: dealerId, companyId },
        select: { name: true, creditLimit: true, currentDebt: true },
      }),
    ]);

    const totalOrders = ordersAgg._sum.amount ?? 0;
    const totalPaid = paymentsAgg._sum.amount ?? 0;
    const debt = totalOrders - totalPaid;

    return {
      dealerId,
      name: dealer?.name,
      totalOrders,
      totalPaid,
      debt,
      creditLimit: dealer?.creditLimit ?? 0,
    };
  }
}
