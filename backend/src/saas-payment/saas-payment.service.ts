import {
  Injectable, BadRequestException, NotFoundException,
  ForbiddenException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClickService, CLICK_ERROR } from './click.service';
import { PaylovService } from './paylov.service';
import { randomUUID } from 'crypto';

export interface SavedCard {
  id: string;
  companyId: string;
  paylovCardId: string;
  last4: string;
  maskedExpire: string;
  cardName: string;
  isDefault: boolean;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface SaasTransaction {
  id: string;
  companyId: string;
  planKey: string;
  amount: number;
  provider: string;
  status: string;
  externalId: string | null;
  metadata: any;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SaasPaymentService {
  private readonly logger = new Logger(SaasPaymentService.name);

  constructor(
    private prisma: PrismaService,
    private click: ClickService,
    private paylov: PaylovService,
  ) {}

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async getTariffAmount(planKey: string): Promise<number> {
    const tariff = await this.prisma.tariffPlan.findFirst({ where: { planKey } });
    if (!tariff) throw new NotFoundException(`Tariff not found: ${planKey}`);
    const raw = String(tariff.priceMonthly).replace(/[^0-9]/g, '');
    const amount = parseInt(raw, 10);
    if (!amount || amount <= 0) throw new BadRequestException('Tariff price not configured');
    return amount;
  }

  private async activateSubscription(companyId: string, planKey: string) {
    const planMap: Record<string, any> = {
      FREE: 'FREE', START: 'START', PRO: 'PRO', PREMIUM: 'PREMIUM',
    };
    const plan = planMap[planKey];
    if (!plan) throw new BadRequestException('Invalid plan key');

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    await this.prisma.company.update({
      where: { id: companyId },
      data: { subscriptionPlan: plan, subscriptionStatus: 'ACTIVE' },
    });
    await this.prisma.subscription.create({
      data: { companyId, plan, status: 'ACTIVE', expiresAt, amount: 0 },
    });
    this.logger.log(`Subscription activated: company=${companyId} plan=${plan}`);
  }

  // ─── Saved Cards ──────────────────────────────────────────────────────────

  async getCards(companyId: string): Promise<Omit<SavedCard, 'paylovCardId'>[]> {
    const rows = await this.prisma.$queryRaw<SavedCard[]>`
      SELECT id, "companyId", last4, "maskedExpire", "cardName", "isDefault", "createdAt"
      FROM "SavedCard"
      WHERE "companyId" = ${companyId} AND "deletedAt" IS NULL
      ORDER BY "isDefault" DESC, "createdAt" DESC
    `;
    return rows;
  }

  async initiateCardBinding(companyId: string, cardNumber: string, expireDate: string, phoneNumber: string, cardName?: string) {
    const activeCount = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM "SavedCard"
      WHERE "companyId" = ${companyId} AND "deletedAt" IS NULL
    `;
    if (Number(activeCount[0].count) >= 5) {
      throw new BadRequestException('Maximum 5 cards allowed');
    }
    const result: any = await this.paylov.createCard(companyId, cardNumber, expireDate, phoneNumber);
    return { cid: result.cid, otpSentPhone: result.otpSentPhone };
  }

  async confirmCardBinding(companyId: string, cid: string, otp: string, cardName = 'My Card') {
    const result: any = await this.paylov.confirmCard(cid, otp, cardName);
    const paylovCardId: string = result.cardId;
    if (!paylovCardId) throw new BadRequestException('Card confirmation failed');

    // Check not duplicate
    const existing = await this.prisma.$queryRaw<SavedCard[]>`
      SELECT id FROM "SavedCard" WHERE "paylovCardId" = ${paylovCardId}
    `;
    if (existing.length > 0) throw new BadRequestException('Card already added');

    // Count to determine isDefault
    const countRes = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM "SavedCard"
      WHERE "companyId" = ${companyId} AND "deletedAt" IS NULL
    `;
    const isDefault = Number(countRes[0].count) === 0;

    // Extract last4 from cardInfo if available, otherwise from cid result
    const last4 = result.pan ? String(result.pan).slice(-4) : '****';
    const maskedExpire = result.expiry
      ? `${String(result.expiry).slice(0, 2)}/${String(result.expiry).slice(2)}`
      : '**/**';

    const id = randomUUID();
    await this.prisma.$executeRaw`
      INSERT INTO "SavedCard" (id, "companyId", "paylovCardId", last4, "maskedExpire", "cardName", "isDefault", "createdAt")
      VALUES (${id}, ${companyId}, ${paylovCardId}, ${last4}, ${maskedExpire}, ${cardName}, ${isDefault}, NOW())
    `;

    this.logger.log(`Card saved: company=${companyId} last4=${last4}`);
    return { id, last4, maskedExpire, cardName, isDefault };
  }

  async setDefaultCard(companyId: string, cardId: string) {
    await this.assertCardOwner(companyId, cardId);
    await this.prisma.$executeRaw`
      UPDATE "SavedCard" SET "isDefault" = false WHERE "companyId" = ${companyId} AND "deletedAt" IS NULL
    `;
    await this.prisma.$executeRaw`
      UPDATE "SavedCard" SET "isDefault" = true WHERE id = ${cardId}
    `;
    return { success: true };
  }

  async deleteCard(companyId: string, cardId: string) {
    await this.assertCardOwner(companyId, cardId);
    // If deleted card was default, promote oldest remaining card
    const card = await this.prisma.$queryRaw<SavedCard[]>`
      SELECT * FROM "SavedCard" WHERE id = ${cardId} AND "deletedAt" IS NULL
    `;
    await this.prisma.$executeRaw`
      UPDATE "SavedCard" SET "deletedAt" = NOW() WHERE id = ${cardId}
    `;
    if (card[0]?.isDefault) {
      await this.prisma.$executeRaw`
        UPDATE "SavedCard" SET "isDefault" = true
        WHERE id = (
          SELECT id FROM "SavedCard"
          WHERE "companyId" = ${companyId} AND "deletedAt" IS NULL
          ORDER BY "createdAt" ASC LIMIT 1
        )
      `;
    }
    return { success: true };
  }

  async getCardBalance(companyId: string, cardId: string) {
    const card = await this.assertCardOwner(companyId, cardId);
    const info: any = await this.paylov.getCardInfo(card.paylovCardId);
    // Return only safe fields
    return {
      balance: info?.balance ?? null,
      currency: info?.currency ?? 'UZS',
      last4: card.last4,
      cardName: card.cardName,
    };
  }

  // ─── Click ────────────────────────────────────────────────────────────────

  async createClickPayment(companyId: string, planKey: string, amount: number) {
    const txId = randomUUID();
    await this.prisma.$executeRaw`
      INSERT INTO "SaasTransaction" (id, "companyId", "planKey", amount, provider, status, "createdAt", "updatedAt")
      VALUES (${txId}, ${companyId}, ${planKey}, ${amount}, 'CLICK', 'PENDING', NOW(), NOW())
    `;
    const url = this.click.generatePaymentUrl(txId, amount);
    this.logger.log(`Click payment created: txId=${txId} company=${companyId} plan=${planKey}`);
    return { transactionId: txId, paymentUrl: url };
  }

  async handleClickCallback(body: Record<string, any>) {
    const {
      merchant_trans_id,
      click_trans_id,
      amount:    rawAmount,
      action:    rawAction,
      error:     clickError,
    } = body;

    const action     = Number(rawAction);
    const paidAmount = Number(rawAmount);

    // 1 — Verify signature and service_id
    if (!this.click.verifyCallback(body)) {
      return this.click.buildError(click_trans_id, merchant_trans_id, CLICK_ERROR.SIGN_FAILED, 'Invalid signature');
    }

    // 2 — Find transaction
    const txRows = await this.prisma.$queryRaw<SaasTransaction[]>`
      SELECT * FROM "SaasTransaction" WHERE id = ${merchant_trans_id}
    `;
    if (txRows.length === 0) {
      return this.click.buildError(click_trans_id, merchant_trans_id, CLICK_ERROR.ORDER_NOT_FOUND, 'Transaction not found');
    }
    const tx = txRows[0];

    // 3 — Verify amount matches (tolerance ±1 tiyin for float rounding)
    if (Math.abs(paidAmount - tx.amount) > 1) {
      this.logger.warn(`Click amount mismatch: expected=${tx.amount} got=${paidAmount} txId=${merchant_trans_id}`);
      return this.click.buildError(click_trans_id, merchant_trans_id, CLICK_ERROR.AMOUNT_INCORRECT,
        `Amount mismatch: expected ${tx.amount}, got ${paidAmount}`);
    }

    // ── PREPARE ────────────────────────────────────────────────────────────
    if (action === ClickService.ACTION_PREPARE) {
      if (tx.status === 'PAID') {
        return this.click.buildError(click_trans_id, merchant_trans_id, CLICK_ERROR.ALREADY_PAID, 'Already paid');
      }
      if (tx.status === 'FAILED' || tx.status === 'CANCELLED') {
        return this.click.buildError(click_trans_id, merchant_trans_id, CLICK_ERROR.ORDER_CANCELLED, 'Order cancelled');
      }
      // Returns merchant_prepare_id as required by Click spec
      return this.click.buildPrepareSuccess(click_trans_id, merchant_trans_id);
    }

    // ── COMPLETE ───────────────────────────────────────────────────────────
    if (action === ClickService.ACTION_COMPLETE) {
      // Click signals user cancellation via negative error code
      if (Number(clickError) < 0) {
        await this.prisma.$executeRaw`
          UPDATE "SaasTransaction" SET status = 'FAILED', "updatedAt" = NOW()
          WHERE id = ${merchant_trans_id} AND status = 'PENDING'
        `;
        return this.click.buildError(click_trans_id, merchant_trans_id,
          CLICK_ERROR.TRANSACTION_FAILED, 'Payment cancelled');
      }

      // Idempotency — Click may retry COMPLETE; return success if already processed
      if (tx.status === 'PAID') {
        return this.click.buildCompleteSuccess(click_trans_id, merchant_trans_id);
      }

      await this.prisma.$executeRaw`
        UPDATE "SaasTransaction"
        SET status = 'PAID',
            "externalId" = ${String(click_trans_id)},
            "paidAt" = NOW(),
            "updatedAt" = NOW()
        WHERE id = ${merchant_trans_id}
      `;
      await this.activateSubscription(tx.companyId, tx.planKey);
      this.logger.log(`Click COMPLETE: txId=${merchant_trans_id} clickId=${click_trans_id} amount=${paidAmount}`);
      // Returns merchant_prepare_id + merchant_confirm_id as required by Click spec
      return this.click.buildCompleteSuccess(click_trans_id, merchant_trans_id);
    }

    return this.click.buildError(click_trans_id, merchant_trans_id, CLICK_ERROR.ACTION_NOT_FOUND, 'Unknown action');
  }

  // ─── Paylov Direct ────────────────────────────────────────────────────────

  async payWithSavedCard(companyId: string, savedCardId: string, planKey: string, amount: number) {
    const card = await this.assertCardOwner(companyId, savedCardId);
    const txId = randomUUID();

    await this.prisma.$executeRaw`
      INSERT INTO "SaasTransaction" (id, "companyId", "planKey", amount, provider, status, "createdAt", "updatedAt")
      VALUES (${txId}, ${companyId}, ${planKey}, ${amount}, 'PAYLOV', 'PENDING', NOW(), NOW())
    `;

    try {
      const paylovTx: any = await this.paylov.createTransaction(companyId, amount, txId);
      const paylovTxId = paylovTx?.transactionId || paylovTx?.id;
      if (!paylovTxId) throw new BadRequestException('Paylov did not return transactionId');

      const payResult: any = await this.paylov.payTransaction(paylovTxId, card.paylovCardId, companyId);

      const metadata = { paylovTxId, payResult };
      await this.prisma.$executeRaw`
        UPDATE "SaasTransaction"
        SET status = 'PAID', "externalId" = ${String(paylovTxId)},
            metadata = ${JSON.stringify(metadata)}::jsonb,
            "paidAt" = NOW(), "updatedAt" = NOW()
        WHERE id = ${txId}
      `;
      await this.activateSubscription(companyId, planKey);
      this.logger.log(`Paylov payment success: txId=${txId} company=${companyId}`);
      return { success: true, transactionId: txId };
    } catch (err) {
      await this.prisma.$executeRaw`
        UPDATE "SaasTransaction" SET status = 'FAILED', "updatedAt" = NOW() WHERE id = ${txId}
      `;
      throw err;
    }
  }

  // ─── Paylov checkout webhook ─────────────────────────────────────────────
  // Called by Paylov server when a checkout-link payment is completed.
  // Paylov sends: { transactionId, account: { order_id }, amount, status }
  async handlePaylovWebhook(body: Record<string, any>) {
    const orderId: string = body?.account?.order_id || body?.order_id || body?.orderId;
    const paylovTxId: string = body?.transactionId || body?.transaction_id;
    const status: string = String(body?.status || '').toUpperCase();

    if (!orderId) {
      this.logger.warn('Paylov webhook: missing order_id', body);
      return { success: false, error: 'order_id missing' };
    }

    const txRows = await this.prisma.$queryRaw<SaasTransaction[]>`
      SELECT * FROM "SaasTransaction" WHERE id = ${orderId}
    `;
    if (txRows.length === 0) {
      this.logger.warn(`Paylov webhook: unknown orderId=${orderId}`);
      return { success: false, error: 'Transaction not found' };
    }
    const tx = txRows[0];

    if (tx.status === 'PAID') return { success: true };

    const isPaid = status === 'PAID' || status === 'SUCCESS' || status === '2';
    if (!isPaid) {
      await this.prisma.$executeRaw`
        UPDATE "SaasTransaction" SET status = 'FAILED', "updatedAt" = NOW() WHERE id = ${orderId}
      `;
      this.logger.warn(`Paylov webhook: payment not successful orderId=${orderId} status=${status}`);
      return { success: false, error: 'Payment not successful' };
    }

    await this.prisma.$executeRaw`
      UPDATE "SaasTransaction"
      SET status = 'PAID',
          "externalId" = ${paylovTxId || null},
          metadata = ${JSON.stringify({ paylovWebhook: body })}::jsonb,
          "paidAt" = NOW(),
          "updatedAt" = NOW()
      WHERE id = ${orderId}
    `;
    await this.activateSubscription(tx.companyId, tx.planKey);
    this.logger.log(`Paylov webhook: activated subscription orderId=${orderId}`);
    return { success: true };
  }

  // ─── Webhook URLs (for admin display) ────────────────────────────────────
  getWebhookUrls() {
    const base = (process.env.APP_URL || 'https://api.supplio.uz').replace(/\/$/, '');
    return {
      click: `${base}/api/saas-payment/click/callback`,
      paylov: `${base}/api/saas-payment/paylov/webhook`,
    };
  }

  // ─── Transaction history ──────────────────────────────────────────────────

  async getMyTransactions(companyId: string) {
    return this.prisma.$queryRaw<SaasTransaction[]>`
      SELECT id, "planKey", amount, provider, status, "externalId", "paidAt", "createdAt"
      FROM "SaasTransaction"
      WHERE "companyId" = ${companyId}
      ORDER BY "createdAt" DESC
      LIMIT 50
    `;
  }

  async getAllTransactions(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT t.id, t."companyId", c.name as "companyName",
             t."planKey", t.amount, t.provider, t.status,
             t."externalId", t."paidAt", t."createdAt"
      FROM "SaasTransaction" t
      JOIN "Company" c ON c.id = t."companyId"
      ORDER BY t."createdAt" DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const countRes = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM "SaasTransaction"
    `;
    return { data: rows, total: Number(countRes[0].count), page, limit };
  }

  // ─── Guard helper ─────────────────────────────────────────────────────────

  private async assertCardOwner(companyId: string, cardId: string): Promise<SavedCard> {
    const rows = await this.prisma.$queryRaw<SavedCard[]>`
      SELECT * FROM "SavedCard"
      WHERE id = ${cardId} AND "companyId" = ${companyId} AND "deletedAt" IS NULL
    `;
    if (rows.length === 0) throw new NotFoundException('Card not found');
    return rows[0];
  }
}
