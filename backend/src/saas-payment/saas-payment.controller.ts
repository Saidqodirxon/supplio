import {
  Controller, Get, Post, Delete, Patch, Param, Body,
  Req, UseGuards, HttpCode,
} from '@nestjs/common';
import { SaasPaymentService } from './saas-payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/middleware/tenant.guard';
import { RolesGuard } from '../common/middleware/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateCardDto, ConfirmCardDto, CreateClickPaymentDto, PaylovPayDto } from './dto';

@Controller('saas-payment')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class SaasPaymentController {
  constructor(private readonly svc: SaasPaymentService) {}

  // ─── Cards ────────────────────────────────────────────────────────────────

  @Get('cards')
  @Roles('OWNER', 'SUPER_ADMIN')
  getCards(@Req() req: any) {
    return this.svc.getCards(req.companyId);
  }

  @Post('cards')
  @Roles('OWNER', 'SUPER_ADMIN')
  initiateCard(@Req() req: any, @Body() dto: CreateCardDto) {
    return this.svc.initiateCardBinding(
      req.companyId,
      dto.cardNumber,
      dto.expireDate,
      dto.phoneNumber,
      dto.cardName,
    );
  }

  @Post('cards/confirm')
  @Roles('OWNER', 'SUPER_ADMIN')
  confirmCard(@Req() req: any, @Body() dto: ConfirmCardDto) {
    return this.svc.confirmCardBinding(req.companyId, dto.cid, dto.otp, dto.cardName);
  }

  @Patch('cards/:id/default')
  @Roles('OWNER', 'SUPER_ADMIN')
  setDefault(@Req() req: any, @Param('id') id: string) {
    return this.svc.setDefaultCard(req.companyId, id);
  }

  @Delete('cards/:id')
  @Roles('OWNER', 'SUPER_ADMIN')
  deleteCard(@Req() req: any, @Param('id') id: string) {
    return this.svc.deleteCard(req.companyId, id);
  }

  @Get('cards/:id/balance')
  @Roles('OWNER', 'SUPER_ADMIN')
  getBalance(@Req() req: any, @Param('id') id: string) {
    return this.svc.getCardBalance(req.companyId, id);
  }

  // ─── Click ────────────────────────────────────────────────────────────────

  @Post('click/create')
  @Roles('OWNER', 'SUPER_ADMIN')
  createClick(@Req() req: any, @Body() dto: CreateClickPaymentDto) {
    return this.svc.createClickPayment(req.companyId, dto.planKey, dto.amount);
  }

  // Public endpoint — Click sends POST callbacks here (prepare + complete)
  @Post('click/callback')
  @HttpCode(200)
  clickCallback(@Body() body: Record<string, any>) {
    return this.svc.handleClickCallback(body);
  }

  // Public endpoint — Paylov sends POST when checkout-link payment is done
  @Post('paylov/webhook')
  @HttpCode(200)
  paylovWebhook(@Body() body: Record<string, any>) {
    return this.svc.handlePaylovWebhook(body);
  }

  // ─── Paylov direct charge ─────────────────────────────────────────────────

  @Post('paylov/pay')
  @Roles('OWNER', 'SUPER_ADMIN')
  paylovPay(@Req() req: any, @Body() dto: PaylovPayDto) {
    return this.svc.payWithSavedCard(req.companyId, dto.savedCardId, dto.planKey, dto.amount);
  }

  // ─── Webhook URLs — shown in admin panel ─────────────────────────────────

  @Get('webhook-urls')
  @Roles('SUPER_ADMIN')
  webhookUrls() {
    return this.svc.getWebhookUrls();
  }

  // ─── Transaction history (own company) ───────────────────────────────────

  @Get('transactions')
  @Roles('OWNER', 'SUPER_ADMIN')
  myTransactions(@Req() req: any) {
    return this.svc.getMyTransactions(req.companyId);
  }
}
