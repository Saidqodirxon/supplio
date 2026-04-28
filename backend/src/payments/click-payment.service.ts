import {
  Injectable, BadRequestException,
  NotFoundException, Logger, InternalServerErrorException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ClickUrlDto } from './click-payment.dto';

// ─── Click error codes (official spec) ───────────────────────────────────────

export const CLICK_ERR = {
  SUCCESS:           0,
  SIGN_FAILED:      -1,
  AMOUNT_INCORRECT: -2,
  ACTION_NOT_FOUND: -8,
  ALREADY_PAID:     -4,
  ORDER_NOT_FOUND:  -5,
  ORDER_CANCELLED:  -9,
  TRANSACTION_FAILED: -7,
  USER_NOT_FOUND:   -6,
} as const;

export type ClickErrCode = (typeof CLICK_ERR)[keyof typeof CLICK_ERR];

// Click sends form-encoded bodies — all values arrive as strings.
type CallbackBody = Record<string, string | number | undefined>;

@Injectable()
export class ClickPaymentService {
  private readonly logger = new Logger(ClickPaymentService.name);

  private readonly serviceId  = process.env.CLICK_SERVICE_ID;
  private readonly merchantId = process.env.CLICK_MERCHANT_ID;
  private readonly secretKey  = process.env.CLICK_SECRET_KEY;
  private readonly baseUrl    = process.env.CLICK_CHECKOUT_URL ?? 'https://my.click.uz/services/pay';
  private readonly dashboardUrl = (process.env.DASHBOARD_URL ?? '').replace(/\/$/, '');

  constructor(private prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. PAYMENT URL — simple redirect, no server-side signature required
  // ═══════════════════════════════════════════════════════════════════════════

  async createPaymentUrl(companyId: string, dto: ClickUrlDto) {
    this.ensureConfig();

    const amount = Number(dto.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException(`Invalid amount: ${dto.amount}`);
    }

    const dealer = await this.prisma.dealer.findFirst({
      where: { id: dto.dealerId, companyId, deletedAt: null },
      select: { id: true, name: true, currentDebt: true },
    });
    if (!dealer) throw new NotFoundException('Dealer not found');

    // Create a ClickOrder so the callback can resolve it.
    const order = await this.prisma.clickOrder.create({
      data: {
        companyId,
        dealerId: dealer.id,
        provider: 'CLICK_URL',
        amount,
        description: dto.description ?? `Dealer debt: ${dealer.name}`,
        returnUrl: dto.returnUrl ?? `${this.dashboardUrl}/payments`,
      },
    });

    const params = new URLSearchParams({
      service_id:        this.serviceId!,
      merchant_id:       this.merchantId!,
      amount:            String(amount),
      transaction_param: order.id,
      return_url:        order.returnUrl ?? `${this.dashboardUrl}/payments`,
    });

    const redirectUrl = `${this.baseUrl}?${params.toString()}`;

    this.logger.log(
      `Click URL created: orderId=${order.id} dealer=${dealer.id} amount=${amount}`,
    );

    return { orderId: order.id, redirectUrl, dealer: { id: dealer.id, name: dealer.name } };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. SHOP API — Prepare (action=0) + Complete (action=1)
  //    Click sends: application/x-www-form-urlencoded or JSON
  //    We MUST always respond with HTTP 200; Click reads the `error` field.
  // ═══════════════════════════════════════════════════════════════════════════

  async handleShopCallback(body: CallbackBody) {
    const { click_trans_id, merchant_trans_id, amount, action } = body;

    this.logger.log(
      `Click SHOP callback: action=${action} orderId=${merchant_trans_id} clickTxId=${click_trans_id}`,
    );

    // ── 1. Signature verification ──────────────────────────────────────────
    if (!this.verifySignature(body)) {
      return this.err(click_trans_id, merchant_trans_id, null, CLICK_ERR.SIGN_FAILED, 'Signature check failed');
    }

    // ── 2. Find order ──────────────────────────────────────────────────────
    const order = await this.prisma.clickOrder.findFirst({
      where: { id: String(merchant_trans_id), provider: { in: ['CLICK_URL', 'CLICK_SHOP'] } },
    });
    if (!order) {
      return this.err(click_trans_id, merchant_trans_id, null, CLICK_ERR.ORDER_NOT_FOUND, 'Order not found');
    }

    // ── 3. Amount check ────────────────────────────────────────────────────
    const paidAmount = Number(amount);
    if (!Number.isFinite(paidAmount) || Math.abs(paidAmount - order.amount) > 1) {
      return this.err(click_trans_id, merchant_trans_id, order.id, CLICK_ERR.AMOUNT_INCORRECT,
        `Expected ${order.amount}, got ${paidAmount}`);
    }

    const actionNum = Number(action);

    // ── PREPARE (action = 0) ───────────────────────────────────────────────
    if (actionNum === 0) {
      if (order.status === 'PAID') {
        return this.err(click_trans_id, merchant_trans_id, order.id, CLICK_ERR.ALREADY_PAID, 'Already paid');
      }
      if (order.status === 'CANCELLED' || order.status === 'FAILED') {
        return this.err(click_trans_id, merchant_trans_id, order.id, CLICK_ERR.ORDER_CANCELLED, 'Order cancelled');
      }

      // Replay protection: reject if this click_trans_id already processed
      const dup = await this.prisma.clickOrder.findFirst({
        where: { clickTransId: String(click_trans_id), id: { not: order.id } },
      });
      if (dup) {
        return this.err(click_trans_id, merchant_trans_id, order.id, CLICK_ERR.ALREADY_PAID, 'Duplicate transaction');
      }

      return {
        click_trans_id:      Number(click_trans_id),
        merchant_trans_id:   String(merchant_trans_id),
        merchant_prepare_id: order.id,
        error:               CLICK_ERR.SUCCESS,
        error_note:          'Success',
      };
    }

    // ── COMPLETE (action = 1) ──────────────────────────────────────────────
    if (actionNum === 1) {
      const clickError = Number(body.error ?? 0);

      // Click signals user cancellation with negative error code
      if (clickError < 0) {
        await this.prisma.clickOrder.update({
          where: { id: order.id },
          data: { status: 'CANCELLED', updatedAt: new Date() },
        });
        return this.err(click_trans_id, merchant_trans_id, order.id, CLICK_ERR.TRANSACTION_FAILED, 'Payment cancelled by user');
      }

      // Idempotency — Click may retry COMPLETE
      if (order.status === 'PAID') {
        return this.completeSuccess(click_trans_id, merchant_trans_id, order.id);
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.clickOrder.update({
          where: { id: order.id },
          data: {
            status:      'PAID',
            clickTransId: String(click_trans_id),
            prepareId:   order.id,
            paidAt:      new Date(),
            updatedAt:   new Date(),
          },
        });

        // If order is tied to a dealer, reduce their debt
        if (order.dealerId) {
          await tx.dealer.update({
            where: { id: order.dealerId },
            data: { currentDebt: { decrement: order.amount } },
          });
          await tx.ledgerTransaction.create({
            data: {
              companyId: order.companyId,
              dealerId:  order.dealerId,
              type:      'PAYMENT',
              amount:    order.amount,
              reference: String(click_trans_id),
              note:      `Click payment: ${order.description ?? ''}`,
            },
          });
        }
      });

      this.logger.log(
        `Click SHOP COMPLETE: orderId=${order.id} clickTxId=${click_trans_id} amount=${order.amount}`,
      );

      return this.completeSuccess(click_trans_id, merchant_trans_id, order.id);
    }

    return this.err(click_trans_id, merchant_trans_id, null, CLICK_ERR.ACTION_NOT_FOUND, 'Unknown action');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3a. SERVICE / BILLING API — CHECK USER (action = 0)
  //     Click App user enters their ID → Click calls this to check existence.
  //     In Supplio context: user_id = dealer.id (UUID)
  // ═══════════════════════════════════════════════════════════════════════════

  async handleServiceCheck(body: CallbackBody) {
    const { click_trans_id, user_id, amount } = body;

    this.logger.log(`Click SERVICE CHECK: userId=${user_id} clickTxId=${click_trans_id}`);

    if (!this.verifySignature(body)) {
      return this.serviceErr(click_trans_id, CLICK_ERR.SIGN_FAILED, 'Signature check failed');
    }

    const dealer = await this.prisma.dealer.findFirst({
      where: { id: String(user_id), deletedAt: null },
      select: { id: true, name: true, phone: true, currentDebt: true, companyId: true },
    });
    if (!dealer) {
      return this.serviceErr(click_trans_id, CLICK_ERR.USER_NOT_FOUND, 'User (dealer) not found');
    }

    if (dealer.currentDebt <= 0) {
      return this.serviceErr(click_trans_id, CLICK_ERR.AMOUNT_INCORRECT, 'No outstanding debt');
    }

    // Amount validation: Click may suggest an amount; verify it matches or accept the actual debt
    const requestedAmount = Number(amount);
    if (Number.isFinite(requestedAmount) && Math.abs(requestedAmount - dealer.currentDebt) > 1) {
      return this.serviceErr(click_trans_id, CLICK_ERR.AMOUNT_INCORRECT,
        `Amount mismatch: debt is ${dealer.currentDebt}`);
    }

    // Create a pending ClickOrder for this service payment
    const order = await this.prisma.clickOrder.create({
      data: {
        companyId:   dealer.companyId,
        dealerId:    dealer.id,
        provider:    'CLICK_SERVICE',
        amount:      dealer.currentDebt,
        description: `Click service payment: ${dealer.name}`,
      },
    });

    return {
      click_trans_id:      Number(click_trans_id),
      merchant_trans_id:   order.id,
      merchant_prepare_id: order.id,
      error:               CLICK_ERR.SUCCESS,
      error_note:          'Success',
      // Optional user info Click may display
      user: {
        name:    dealer.name,
        phone:   dealer.phone,
        balance: dealer.currentDebt,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3b. SERVICE / BILLING API — PAY (action = 1)
  // ═══════════════════════════════════════════════════════════════════════════

  async handleServicePay(body: CallbackBody) {
    const { click_trans_id, merchant_trans_id, merchant_prepare_id, user_id, amount } = body;

    this.logger.log(
      `Click SERVICE PAY: orderId=${merchant_trans_id} userId=${user_id} clickTxId=${click_trans_id}`,
    );

    if (!this.verifySignature(body)) {
      return this.serviceErr(click_trans_id, CLICK_ERR.SIGN_FAILED, 'Signature check failed');
    }

    // Replay protection
    const dup = await this.prisma.clickOrder.findFirst({
      where: { clickTransId: String(click_trans_id) },
    });
    if (dup) {
      return this.serviceSuccess(click_trans_id, String(merchant_trans_id));
    }

    const order = await this.prisma.clickOrder.findFirst({
      where: { id: String(merchant_trans_id), provider: 'CLICK_SERVICE' },
    });
    if (!order) {
      return this.serviceErr(click_trans_id, CLICK_ERR.ORDER_NOT_FOUND, 'Order not found');
    }

    if (order.status === 'PAID') {
      return this.serviceSuccess(click_trans_id, String(merchant_trans_id));
    }
    if (order.status === 'CANCELLED' || order.status === 'FAILED') {
      return this.serviceErr(click_trans_id, CLICK_ERR.ORDER_CANCELLED, 'Order cancelled');
    }

    const clickError = Number(body.error ?? 0);
    if (clickError < 0) {
      await this.prisma.clickOrder.update({
        where: { id: order.id },
        data: { status: 'CANCELLED', updatedAt: new Date() },
      });
      return this.serviceErr(click_trans_id, CLICK_ERR.TRANSACTION_FAILED, 'Payment cancelled');
    }

    const paidAmount = Number(amount);
    if (!Number.isFinite(paidAmount) || Math.abs(paidAmount - order.amount) > 1) {
      return this.serviceErr(click_trans_id, CLICK_ERR.AMOUNT_INCORRECT,
        `Expected ${order.amount}, got ${paidAmount}`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.clickOrder.update({
        where: { id: order.id },
        data: {
          status:       'PAID',
          clickTransId: String(click_trans_id),
          prepareId:    String(merchant_prepare_id),
          paidAt:       new Date(),
          updatedAt:    new Date(),
        },
      });

      if (order.dealerId) {
        await tx.dealer.update({
          where: { id: order.dealerId },
          data: { currentDebt: { decrement: order.amount } },
        });
        await tx.ledgerTransaction.create({
          data: {
            companyId: order.companyId,
            dealerId:  order.dealerId,
            type:      'PAYMENT',
            amount:    order.amount,
            reference: String(click_trans_id),
            note:      `Click service payment`,
          },
        });
      }
    });

    this.logger.log(
      `Click SERVICE PAID: orderId=${order.id} dealer=${order.dealerId} amount=${order.amount}`,
    );

    return this.serviceSuccess(click_trans_id, String(merchant_trans_id));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Order status — for frontend polling
  // ═══════════════════════════════════════════════════════════════════════════

  async getOrder(companyId: string, orderId: string) {
    const order = await this.prisma.clickOrder.findFirst({
      where: { id: orderId, companyId },
      select: {
        id: true, provider: true, amount: true, status: true,
        clickTransId: true, description: true, paidAt: true, createdAt: true,
        dealer: { select: { id: true, name: true, phone: true } },
      },
    });
    if (!order) throw new NotFoundException('Click order not found');
    return order;
  }

  async getCompanyOrders(companyId: string, limit = 50) {
    return this.prisma.clickOrder.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true, provider: true, amount: true, status: true,
        clickTransId: true, description: true, paidAt: true, createdAt: true,
        dealer: { select: { id: true, name: true } },
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Signature helpers
  // ═══════════════════════════════════════════════════════════════════════════

  private verifySignature(body: CallbackBody): boolean {
    const {
      click_trans_id, service_id, merchant_trans_id,
      merchant_prepare_id, amount, action, sign_time, sign_string,
    } = body;

    if (!this.secretKey) {
      this.logger.error('CLICK_SECRET_KEY not configured');
      return false;
    }

    // Service_id mismatch → forged request
    if (String(service_id) !== String(this.serviceId)) {
      this.logger.warn(`Click service_id mismatch: got=${service_id} expected=${this.serviceId}`);
      return false;
    }

    const actionNum = Number(action);
    let raw: string;

    if (actionNum === 0) {
      // PREPARE / CHECK: no merchant_prepare_id in formula
      raw =
        `${click_trans_id}${service_id}${this.secretKey}` +
        `${merchant_trans_id}${amount}${action}${sign_time}`;
    } else if (actionNum === 1) {
      // COMPLETE / PAY: merchant_prepare_id included
      raw =
        `${click_trans_id}${service_id}${this.secretKey}` +
        `${merchant_trans_id}${merchant_prepare_id}${amount}${action}${sign_time}`;
    } else {
      this.logger.warn(`Unknown Click action: ${action}`);
      return false;
    }

    const expected = crypto.createHash('md5').update(raw).digest('hex');
    const provided  = String(sign_string ?? '').toLowerCase();
    const ok        = expected === provided;

    if (!ok) {
      this.logger.warn(
        `Click signature mismatch: txId=${merchant_trans_id} action=${action} ` +
        `expected=${expected} got=${provided}`,
      );
    }
    return ok;
  }

  // ─── Response builders ────────────────────────────────────────────────────

  private err(
    clickTransId: unknown,
    merchantTransId: unknown,
    prepareId: string | null,
    code: ClickErrCode,
    note: string,
  ) {
    return {
      click_trans_id:      Number(clickTransId),
      merchant_trans_id:   String(merchantTransId ?? ''),
      merchant_prepare_id: prepareId,
      error:               code,
      error_note:          note,
    };
  }

  private completeSuccess(clickTransId: unknown, merchantTransId: unknown, prepareId: string) {
    return {
      click_trans_id:      Number(clickTransId),
      merchant_trans_id:   String(merchantTransId),
      merchant_prepare_id: prepareId,
      merchant_confirm_id: prepareId,
      error:               CLICK_ERR.SUCCESS,
      error_note:          'Success',
    };
  }

  private serviceErr(clickTransId: unknown, code: ClickErrCode, note: string) {
    return {
      click_trans_id: Number(clickTransId),
      error:          code,
      error_note:     note,
    };
  }

  private serviceSuccess(clickTransId: unknown, merchantTransId: string) {
    return {
      click_trans_id:      Number(clickTransId),
      merchant_trans_id:   merchantTransId,
      merchant_prepare_id: merchantTransId,
      merchant_confirm_id: merchantTransId,
      error:               CLICK_ERR.SUCCESS,
      error_note:          'Success',
    };
  }

  private ensureConfig() {
    if (!this.serviceId || !this.merchantId || !this.secretKey) {
      throw new InternalServerErrorException(
        'CLICK_SERVICE_ID / CLICK_MERCHANT_ID / CLICK_SECRET_KEY not configured',
      );
    }
  }
}
