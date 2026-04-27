import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class ClickService {
  private readonly serviceId = process.env.CLICK_SERVICE_ID;
  private readonly merchantId = process.env.CLICK_MERCHANT_ID;
  private readonly secretKey = process.env.CLICK_SECRET_KEY;
  private readonly returnUrl = process.env.DASHBOARD_URL + '/subscription?tab=payment';

  generatePaymentUrl(orderId: string, amount: number): string {
    if (!this.serviceId || !this.merchantId) {
      throw new BadRequestException('Click credentials not configured');
    }
    const params = new URLSearchParams({
      service_id: this.serviceId,
      merchant_id: this.merchantId,
      amount: String(amount),
      transaction_param: orderId,
      return_url: this.returnUrl,
    });
    return `https://my.click.uz/services/pay?${params.toString()}`;
  }

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

    const raw = `${click_trans_id}${service_id}${this.secretKey}${merchant_trans_id}${amount}${action}${sign_time}`;
    const expected = crypto.createHash('md5').update(raw).digest('hex');
    return expected === sign_string;
  }

  // Click callback action codes
  static readonly ACTION_PREPARE = 0;
  static readonly ACTION_COMPLETE = 1;

  buildErrorResponse(clickTransId: string, merchantTransId: string, error: number, errorNote: string) {
    return {
      click_trans_id: clickTransId,
      merchant_trans_id: merchantTransId,
      error,
      error_note: errorNote,
    };
  }

  buildSuccessResponse(clickTransId: string, merchantTransId: string, merchantConfirmId?: string) {
    return {
      click_trans_id: clickTransId,
      merchant_trans_id: merchantTransId,
      merchant_confirm_id: merchantConfirmId ?? merchantTransId,
      error: 0,
      error_note: 'Success',
    };
  }
}
