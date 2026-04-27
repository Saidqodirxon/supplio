import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

// Official Click API error codes
export const CLICK_ERROR = {
  SUCCESS:             0,
  SIGN_FAILED:        -1,
  AMOUNT_INCORRECT:   -2,
  ACTION_NOT_FOUND:   -8,
  ALREADY_PAID:       -4,
  ORDER_NOT_FOUND:    -5,
  ORDER_CANCELLED:    -9,
  TRANSACTION_FAILED: -7,
} as const;

export type ClickErrorCode = typeof CLICK_ERROR[keyof typeof CLICK_ERROR];

@Injectable()
export class ClickService {
  private readonly logger = new Logger(ClickService.name);

  private readonly serviceId  = process.env.CLICK_SERVICE_ID;
  private readonly merchantId = process.env.CLICK_MERCHANT_ID;
  private readonly secretKey  = process.env.CLICK_SECRET_KEY;
  private readonly returnUrl  = (process.env.DASHBOARD_URL ?? '') + '/subscription?tab=payment';

  static readonly ACTION_PREPARE  = 0;
  static readonly ACTION_COMPLETE = 1;

  // ─── URL generator ───────────────────────────────────────────────────────

  generatePaymentUrl(orderId: string, amount: number): string {
    if (!this.serviceId || !this.merchantId) {
      throw new Error('CLICK_SERVICE_ID / CLICK_MERCHANT_ID not configured');
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error(`Invalid amount: ${amount}`);
    }
    const params = new URLSearchParams({
      service_id:        this.serviceId,
      merchant_id:       this.merchantId,
      amount:            String(amount),
      transaction_param: orderId,
      return_url:        this.returnUrl,
    });
    const url = `https://my.click.uz/services/pay?${params.toString()}`;
    this.logger.log(`Click URL → orderId=${orderId} amount=${amount}`);
    return url;
  }

  // ─── Signature verification ───────────────────────────────────────────────
  // Formula: MD5(click_trans_id + service_id + secret_key + merchant_trans_id
  //              + amount + action + sign_time)

  verifyCallback(body: Record<string, any>): boolean {
    const {
      click_trans_id,
      service_id,
      merchant_trans_id,
      amount,
      action,
      sign_time,
      sign_string,
    } = body;

    // Reject if service_id doesn't match ours (prevents forged requests)
    if (String(service_id) !== String(this.serviceId)) {
      this.logger.warn(`Click: service_id mismatch (got ${service_id})`);
      return false;
    }

    const raw      = `${click_trans_id}${service_id}${this.secretKey}${merchant_trans_id}${amount}${action}${sign_time}`;
    const expected = crypto.createHash('md5').update(raw).digest('hex');
    const ok       = expected === sign_string;

    if (!ok) {
      this.logger.warn(`Click: signature mismatch for txId=${merchant_trans_id}`);
    }
    return ok;
  }

  // ─── Response builders ────────────────────────────────────────────────────
  // Click requires different fields for PREPARE vs COMPLETE.
  // merchant_prepare_id must appear in both; merchant_confirm_id only in COMPLETE.

  buildPrepareSuccess(clickTransId: string | number, merchantTransId: string) {
    return {
      click_trans_id:       Number(clickTransId),
      merchant_trans_id:    merchantTransId,
      merchant_prepare_id:  merchantTransId,   // required by Click spec
      error:                CLICK_ERROR.SUCCESS,
      error_note:           'Success',
    };
  }

  buildCompleteSuccess(clickTransId: string | number, merchantTransId: string) {
    return {
      click_trans_id:       Number(clickTransId),
      merchant_trans_id:    merchantTransId,
      merchant_prepare_id:  merchantTransId,   // required by Click spec
      merchant_confirm_id:  merchantTransId,   // required by Click spec
      error:                CLICK_ERROR.SUCCESS,
      error_note:           'Success',
    };
  }

  buildError(
    clickTransId: string | number,
    merchantTransId: string,
    error: ClickErrorCode,
    errorNote: string,
  ) {
    return {
      click_trans_id:    Number(clickTransId),
      merchant_trans_id: merchantTransId,
      error,
      error_note:        errorNote,
    };
  }

  // Legacy aliases kept for backward compat with existing controller calls
  buildErrorResponse = this.buildError.bind(this);
  buildSuccessResponse(clickTransId: string, merchantTransId: string) {
    return this.buildCompleteSuccess(clickTransId, merchantTransId);
  }
}
