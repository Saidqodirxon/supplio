import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

interface TokenCache {
  accessToken: string | null;
  expiresAt: number | null;
}

@Injectable()
export class PaylovService {
  private readonly logger = new Logger(PaylovService.name);
  private readonly client: AxiosInstance;
  private tokenCache: TokenCache = { accessToken: null, expiresAt: null };

  private readonly baseUrl = process.env.PAYLOV_BASE_URL;
  private readonly username = process.env.PAYLOV_USERNAME;
  private readonly password = process.env.PAYLOV_PASSWORD;
  private readonly consumerKey = process.env.PAYLOV_CONSUMER_KEY;
  private readonly consumerSecret = process.env.PAYLOV_CONSUMER_SECRET;
  readonly merchantId = process.env.PAYLOV_MERCHANT_ID;
  private readonly checkoutUrl = process.env.PAYLOV_CHECKOUT_URL || 'https://my.paylov.uz';
  private readonly currency = process.env.PAYLOV_CURRENCY || 'UZS';

  constructor() {
    this.client = axios.create({ baseURL: this.baseUrl, timeout: 15000 });
  }

  private buildBasicAuth(): string {
    const creds = `${this.consumerKey}:${this.consumerSecret}`;
    return `Basic ${Buffer.from(creds).toString('base64')}`;
  }

  private isTokenValid(): boolean {
    return (
      this.tokenCache.accessToken !== null &&
      this.tokenCache.expiresAt !== null &&
      Date.now() < this.tokenCache.expiresAt - 60_000
    );
  }

  private async fetchToken(): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'password',
      username: this.username,
      password: this.password,
    });
    const res = await axios.post(
      `${this.baseUrl}/merchant/oauth2/token/`,
      params.toString(),
      {
        headers: {
          Authorization: this.buildBasicAuth(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    const { access_token, expires_in } = res.data;
    this.tokenCache = { accessToken: access_token, expiresAt: Date.now() + expires_in * 1000 };
    return access_token;
  }

  private async getToken(): Promise<string> {
    if (this.isTokenValid()) return this.tokenCache.accessToken;
    return this.fetchToken();
  }

  private async request<T>(method: string, path: string, data?: any, params?: any): Promise<T> {
    const token = await this.getToken();
    try {
      const res = await this.client.request<any>({
        method, url: path, data, params,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      return (res.data?.result ?? res.data) as T;
    } catch (err: any) {
      if (err.response?.status === 401) {
        this.tokenCache = { accessToken: null, expiresAt: null };
        const freshToken = await this.getToken();
        const res = await this.client.request<any>({
          method, url: path, data, params,
          headers: { Authorization: `Bearer ${freshToken}`, 'Content-Type': 'application/json' },
        });
        return (res.data?.result ?? res.data) as T;
      }
      const detail =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message;
      // Sanitize outgoing request body before logging (mask card numbers).
      const safeRequest = (() => {
        if (!data || typeof data !== 'object') return data;
        const clone: any = { ...data };
        if (typeof clone.cardNumber === 'string' && clone.cardNumber.length === 16) {
          clone.cardNumber = `${clone.cardNumber.slice(0, 4)}********${clone.cardNumber.slice(-4)}`;
        }
        return clone;
      })();
      this.logger.error(
        `Paylov API error [${method} ${path}] status=${err.response?.status} detail=${detail} ` +
        `request=${JSON.stringify(safeRequest)} response=${JSON.stringify(err.response?.data)}`,
      );
      throw new BadRequestException(detail || 'Paylov API error');
    }
  }

  async createCard(userId: string, cardNumber: string, expireDate: string, phoneNumber: string) {
    if (!userId) throw new BadRequestException('userId is required');
    if (!cardNumber || cardNumber.length !== 16 || !/^\d{16}$/.test(cardNumber))
      throw new BadRequestException('cardNumber must be exactly 16 digits');
    if (!expireDate || !/^\d{4}$/.test(expireDate))
      throw new BadRequestException('expireDate must be exactly 4 digits (MMYY)');
    if (!phoneNumber)
      throw new BadRequestException('phoneNumber is required');

    const masked = `${cardNumber.slice(0, 4)}********${cardNumber.slice(-4)}`;
    const payload = { userId, cardNumber, expireDate, phoneNumber };
    this.logger.log(`Paylov createCard → ${JSON.stringify({ userId, cardNumber: masked, expireDate, phoneNumber })}`);

    const result: any = await this.request('POST', '/merchant/userCard/createUserCard/', payload);
    this.logger.log(`Paylov createCard ← ${JSON.stringify(result)}`);
    return result;
  }

  async confirmCard(cid: string, otp: string, cardName = 'My Card') {
    this.logger.log(`Confirming card cid=${cid}`);
    return this.request('POST', '/merchant/userCard/confirmUserCardCreate/', { cardId: cid, otp, cardName });
  }

  async getCardInfo(cardId: string) {
    return this.request('GET', `/merchant/userCard/getCard/${cardId}/`);
  }

  async createTransaction(userId: string, amount: number, orderId: string) {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) throw new BadRequestException('Amount must be positive');
    return this.request('POST', '/merchant/receipts/create/', {
      userId,
      amount: numAmount,
      account: { order_id: orderId, description: `Subscription: ${orderId}` },
    });
  }

  async payTransaction(transactionId: string, cardId: string, userId: string) {
    return this.request('POST', '/merchant/receipts/pay/', { transactionId, cardId, userId });
  }

  generateCheckoutLink(amount: number, returnUrl: string, orderId: string): string {
    if (!this.merchantId) throw new InternalServerErrorException('PAYLOV_MERCHANT_ID not configured');
    if (!returnUrl) throw new BadRequestException('returnUrl is required');
    if (!orderId) throw new BadRequestException('orderId is required');

    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0)
      throw new BadRequestException(`Invalid amount: ${amount}`);

    // Paylov checkout expects base64-encoded JSON.
    // `currency` is required — its absence is what causes the checkout
    // page to render "0 undefined".
    const payload = {
      merchant_id: this.merchantId,
      amount:      numAmount,
      currency:    this.currency,
      return_url:  returnUrl,
      account:     { order_id: orderId },
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
    const link = `${this.checkoutUrl}/checkout/create/${encoded}`;
    this.logger.log(
      `Paylov checkout link → orderId=${orderId} amount=${numAmount} ` +
      `currency=${this.currency} link=${link}`,
    );
    return link;
  }
}
