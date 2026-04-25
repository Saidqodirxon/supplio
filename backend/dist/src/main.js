"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const helmet_1 = require("helmet");
const common_1 = require("@nestjs/common");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const path_1 = require("path");
const swagger_1 = require("@nestjs/swagger");
const express = require("express");
async function bootstrap() {
    const requiredEnvs = ["DATABASE_URL", "JWT_SECRET"];
    requiredEnvs.forEach((envName) => {
        if (!process.env[envName]) {
            console.error(`FATAL: Missing environment variable ${envName}`);
            process.exit(1);
        }
    });
    const logger = new common_1.Logger("Bootstrap");
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bodyParser: false,
        logger: ["error", "warn", "log"],
    });
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));
    app.useStaticAssets((0, path_1.join)(__dirname, "..", "..", "uploads"), {
        prefix: "/uploads/",
    });
    app.useStaticAssets((0, path_1.join)(__dirname, "..", "..", "public"), {
        prefix: "/public/",
    });
    app.use((0, helmet_1.default)());
    app.enableCors({ origin: "*" });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    app.setGlobalPrefix("api", {
        exclude: ["/", "webhook/(.*)", "health", "health/db"],
    });
    if (process.env.NODE_ENV !== "production" || process.env.ENABLE_SWAGGER === "true") {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle("Supplio API")
            .setDescription("Multi-tenant B2B SaaS Platform — Complete API Reference")
            .setVersion("1.0.0")
            .addBearerAuth()
            .addTag("auth", "Authentication & Profiles")
            .addTag("company", "Company & Subscription Management")
            .addTag("dealers", "Dealer CRUD & Debt Tracking")
            .addTag("orders", "Order Management")
            .addTag("payments", "Payment Recording")
            .addTag("products", "Product Catalogue")
            .addTag("expenses", "Expense Tracking")
            .addTag("branches", "Branch Management")
            .addTag("analytics", "Reporting & Analytics")
            .addTag("notifications", "Notification System")
            .addTag("telegram", "Telegram Bot Management")
            .addTag("super", "Super Admin Controls")
            .addTag("store", "Public Web Store")
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup("api/docs", app, document, {
            swaggerOptions: { persistAuthorization: true },
        });
        logger.log("Swagger docs available at /api/docs");
    }
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Supplio API running on port ${port}`);
    process.on("unhandledRejection", (reason, promise) => {
        logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    });
    process.on("uncaughtException", (err) => {
        logger.error("Uncaught Exception thrown:", err);
    });
}
bootstrap().catch((err) => {
    console.error("Failed to start Supplio API:", err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map