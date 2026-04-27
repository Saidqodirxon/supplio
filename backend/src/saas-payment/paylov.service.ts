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
      const detail = err.response?.data?.error?.message || err.response?.data?.message || err.message;
      this.logger.error(`Paylov API error [${path}]`, { status: err.response?.status, detail });
      throw new BadRequestException(detail || 'Paylov API error');
    }
  }

  async createCard(userId: string, cardNumber: string, expireDate: string, phoneNumber: string) {
    if (cardNumber.length !== 16) throw new BadRequestException('Card number must be 16 digits');
    if (!/^\d{4}$/.test(expireDate)) throw new BadRequestException('Expire date must be 4 digits');
    const masked = cardNumber.slice(0, 4) + '********' + cardNumber.slice(-4);
    this.logger.log(`Creating card [${masked}] for userId=${userId}`);
    return this.request('POST', '/merchant/userCard/createUserCard/', { userId, cardNumber, expireDate, phoneNumber });
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
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) throw new BadRequestException('Amount must be positive');
    const payload = { merchant_id: this.merchantId, amount: numAmount, return_url: returnUrl, account: { order_id: orderId } };
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
    return `${this.checkoutUrl}/checkout/create/${encoded}`;
  }
}
