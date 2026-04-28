import { Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { ClickPaymentService } from "./click-payment.service";
import { ClickPaymentController } from "./click-payment.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { TelegramModule } from "../telegram/telegram.module";

@Module({
  imports: [PrismaModule, TelegramModule],
  controllers: [PaymentsController, ClickPaymentController],
  providers: [PaymentsService, ClickPaymentService],
})
export class PaymentsModule {}
