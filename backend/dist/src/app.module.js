"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_module_1 = require("./prisma/prisma.module");
const payments_module_1 = require("./payments/payments.module");
const auth_module_1 = require("./auth/auth.module");
const telegram_module_1 = require("./telegram/telegram.module");
const orders_module_1 = require("./orders/orders.module");
const dealers_module_1 = require("./dealers/dealers.module");
const branches_module_1 = require("./branches/branches.module");
const products_module_1 = require("./products/products.module");
const expenses_module_1 = require("./expenses/expenses.module");
const categories_module_1 = require("./categories/categories.module");
const units_module_1 = require("./units/units.module");
const analytics_module_1 = require("./analytics/analytics.module");
const super_admin_module_1 = require("./super-admin/super-admin.module");
const audit_log_module_1 = require("./common/services/audit-log.module");
const demo_module_1 = require("./demo/demo.module");
const tasks_module_1 = require("./common/tasks/tasks.module");
const leads_module_1 = require("./leads/leads.module");
const company_module_1 = require("./company/company.module");
const health_module_1 = require("./common/health/health.module");
const notifications_module_1 = require("./notifications/notifications.module");
const store_module_1 = require("./store/store.module");
const upload_module_1 = require("./upload/upload.module");
const public_module_1 = require("./public/public.module");
const support_module_1 = require("./support/support.module");
const saas_payment_module_1 = require("./saas-payment/saas-payment.module");
const app_controller_1 = require("./app.controller");
const demo_readonly_middleware_1 = require("./common/middleware/demo-readonly.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(demo_readonly_middleware_1.DemoReadonlyMiddleware).forRoutes("*");
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            health_module_1.HealthModule,
            orders_module_1.OrdersModule,
            dealers_module_1.DealersModule,
            branches_module_1.BranchesModule,
            products_module_1.ProductsModule,
            categories_module_1.CategoriesModule,
            units_module_1.UnitsModule,
            expenses_module_1.ExpensesModule,
            payments_module_1.PaymentsModule,
            auth_module_1.AuthModule,
            telegram_module_1.TelegramModule,
            analytics_module_1.AnalyticsModule,
            super_admin_module_1.SuperAdminModule,
            audit_log_module_1.AuditLogModule,
            demo_module_1.DemoModule,
            tasks_module_1.TasksModule,
            leads_module_1.LeadsModule,
            company_module_1.CompanyModule,
            notifications_module_1.NotificationsModule,
            store_module_1.StoreModule,
            upload_module_1.UploadModule,
            public_module_1.PublicModule,
            support_module_1.SupportModule,
            saas_payment_module_1.SaasPaymentModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [demo_readonly_middleware_1.DemoReadonlyMiddleware],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map