import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import helmet from "helmet";
import { ValidationPipe, Logger } from "@nestjs/common";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  // Required Env Validation
  const requiredEnvs = ["DATABASE_URL", "JWT_SECRET"];
  requiredEnvs.forEach((envName) => {
    if (!process.env[envName]) {
      console.error(`FATAL: Missing environment variable ${envName}`);
      process.exit(1);
    }
  });

  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ["error", "warn", "log"],
  });

  // Static assets
  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
  });

  // Security
  app.use(helmet());
  app.enableCors({ origin: "*" });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Global error handler — never crash
  app.useGlobalFilters(new GlobalExceptionFilter());

  // API prefix
  app.setGlobalPrefix("api", {
    exclude: ["/", "webhook/(.*)", "health", "health/db"],
  });

  // Swagger documentation (dev only or super-admin accessible)
  if (process.env.NODE_ENV !== "production" || process.env.ENABLE_SWAGGER === "true") {
    const swaggerConfig = new DocumentBuilder()
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
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    logger.log("Swagger docs available at /api/docs");
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Supplio API running on port ${port}`);

  // Handle unhandled rejections and exceptions to prevent process crash
  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  });

  process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception thrown:", err);
    // In a production environment, you might want to restart gracefully
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start Supplio API:", err);
  process.exit(1);
});
