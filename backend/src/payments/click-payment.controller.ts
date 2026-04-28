import {
  Controller, Post, Get, Param, Body,
  Req, UseGuards, HttpCode, Query,
} from '@nestjs/common';
import { ClickPaymentService } from './click-payment.service';
import { ClickUrlDto } from './click-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/middleware/tenant.guard';
import { RolesGuard } from '../common/middleware/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('payments/click')
export class ClickPaymentController {
  constructor(private readonly svc: ClickPaymentService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. PAYMENT URL — generate Click redirect link
  //    Auth: JWT (internal call from dashboard)
  // ═══════════════════════════════════════════════════════════════════════════

  @Post('url')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles('OWNER', 'SUPER_ADMIN', 'MANAGER')
  createUrl(@Req() req: any, @Body() dto: ClickUrlDto) {
    return this.svc.createPaymentUrl(req.companyId, dto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. SHOP API — Prepare (action=0) + Complete (action=1)
  //    Public: Click servers call this endpoint directly.
  //    Auth: Click signature (verified inside the service).
  //    Must always return HTTP 200; Click reads the `error` field.
  // ═══════════════════════════════════════════════════════════════════════════

  @Post('shop')
  @HttpCode(200)
  shopCallback(@Body() body: Record<string, any>) {
    return this.svc.handleShopCallback(body);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3a. SERVICE / BILLING — CHECK USER (action = 0)
  //     Click App user enters dealer ID → Click calls this to verify + get debt.
  //     Public: Click servers call this.
  // ═══════════════════════════════════════════════════════════════════════════

  @Post('service/check')
  @HttpCode(200)
  serviceCheck(@Body() body: Record<string, any>) {
    return this.svc.handleServiceCheck(body);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3b. SERVICE / BILLING — PAY (action = 1)
  //     Click confirms payment → reduce dealer debt.
  //     Public: Click servers call this.
  // ═══════════════════════════════════════════════════════════════════════════

  @Post('service/pay')
  @HttpCode(200)
  servicePay(@Body() body: Record<string, any>) {
    return this.svc.handleServicePay(body);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Order status — dashboard polling
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('orders')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles('OWNER', 'SUPER_ADMIN', 'MANAGER')
  listOrders(@Req() req: any, @Query('limit') limit?: string) {
    return this.svc.getCompanyOrders(req.companyId, limit ? Number(limit) : 50);
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles('OWNER', 'SUPER_ADMIN', 'MANAGER')
  getOrder(@Req() req: any, @Param('id') id: string) {
    return this.svc.getOrder(req.companyId, id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Webhook URLs — for display in admin panel settings
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('webhook-urls')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles('OWNER', 'SUPER_ADMIN')
  webhookUrls() {
    const base = (process.env.APP_URL ?? 'https://api.supplio.uz').replace(/\/$/, '');
    return {
      shopCallback:    `${base}/api/payments/click/shop`,
      serviceCheck:    `${base}/api/payments/click/service/check`,
      servicePay:      `${base}/api/payments/click/service/pay`,
      serviceId:       process.env.CLICK_SERVICE_ID ?? '(not configured)',
      merchantId:      process.env.CLICK_MERCHANT_ID ?? '(not configured)',
    };
  }
}
