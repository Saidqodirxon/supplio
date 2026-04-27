import { Module } from '@nestjs/common';
import { SaasPaymentController } from './saas-payment.controller';
import { SaasPaymentService } from './saas-payment.service';
import { ClickService } from './click.service';
import { PaylovService } from './paylov.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SaasPaymentController],
  providers: [SaasPaymentService, ClickService, PaylovService],
  exports: [SaasPaymentService],
})
export class SaasPaymentModule {}
