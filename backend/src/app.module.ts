import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./prisma/prisma.module";
import { PaymentsModule } from "./payments/payments.module";
import { AuthModule } from "./auth/auth.module";
import { TelegramModule } from "./telegram/telegram.module";
import { OrdersModule } from "./orders/orders.module";
import { DealersModule } from "./dealers/dealers.module";
import { BranchesModule } from "./branches/branches.module";
import { ProductsModule } from "./products/products.module";
import { ExpensesModule } from "./expenses/expenses.module";
import { CategoriesModule } from "./categories/categories.module";
import { UnitsModule } from "./units/units.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { SuperAdminModule } from "./super-admin/super-admin.module";
import { AuditLogModule } from "./common/services/audit-log.module";
import { DemoModule } from "./demo/demo.module";
import { TasksModule } from "./common/tasks/tasks.module";
import { LeadsModule } from "./leads/leads.module";
import { CompanyModule } from "./company/company.module";
import { HealthModule } from "./common/health/health.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { StoreModule } from "./store/store.module";
import { UploadModule } from "./upload/upload.module";
import { PublicModule } from "./public/public.module";

import { AppController } from "./app.controller";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    HealthModule,
    OrdersModule,
    DealersModule,
    BranchesModule,
    ProductsModule,
    CategoriesModule,
    UnitsModule,
    ExpensesModule,
    PaymentsModule,
    AuthModule,
    TelegramModule,
    AnalyticsModule,
    SuperAdminModule,
    AuditLogModule,
    DemoModule,
    TasksModule,
    LeadsModule,
    CompanyModule,
    NotificationsModule,
    StoreModule,
    UploadModule,
    PublicModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
