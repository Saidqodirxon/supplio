import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { TelegramService } from "../telegram/telegram.service";

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private telegram: TelegramService,
  ) {}

  async create(
    companyId: string,
    data: { dealerId: string; amount: number; method: string; reference?: string; note?: string; branchId?: string }
  ) {
    const payment = await this.prisma.$transaction(async (tx) => {
      const dealer = await tx.dealer.findUnique({
        where: { id: data.dealerId },
        select: { branchId: true },
      });
      if (!dealer) throw new BadRequestException("Dealer not found");

      const p = await tx.payment.create({
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

      await tx.dealer.update({
        where: { id: data.dealerId },
        data: { currentDebt: { decrement: data.amount } },
      });

      return p;
    });

    // Notify dealer via Telegram (fire-and-forget)
    this.telegram
      .notifyDealerPayment(companyId, data.dealerId, data.amount, "PAYMENT", data.note)
      .catch(() => {});

    return payment;
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
    const result = await this.prisma.$transaction(async (tx) => {
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

      await tx.dealer.update({
        where: { id: data.dealerId },
        data: { currentDebt: { decrement: data.amount } },
      });

      return { success: true, amount: data.amount, note: data.note };
    });

    // Notify dealer via Telegram
    this.telegram
      .notifyDealerPayment(companyId, data.dealerId, data.amount, "ADJUSTMENT", data.note)
      .catch(() => {});

    return result;
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
