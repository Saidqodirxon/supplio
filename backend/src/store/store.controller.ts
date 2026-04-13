import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  ForbiddenException,
  Post,
  Body,
  Headers,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PlanLimitsService } from "../common/services/plan-limits.service";

@Controller("store")
export class StoreController {
  private readonly logger = new Logger(StoreController.name);

  constructor(
    private prisma: PrismaService,
    private planLimits: PlanLimitsService
  ) {}

  private isCompanyAccessBlocked(
    company: {
      subscriptionStatus?: string | null;
      trialExpiresAt?: Date | null;
    } | null
  ) {
    if (!company) return true;
    if (company.subscriptionStatus === "LOCKED") return true;
    if (
      company.trialExpiresAt &&
      ["TRIAL", "ACTIVE"].includes(String(company.subscriptionStatus || "")) &&
      new Date() > new Date(company.trialExpiresAt)
    ) {
      return true;
    }
    return false;
  }

  /** Get public company info by slug */
  @Get(":slug/info")
  async getCompanyInfo(@Param("slug") slug: string) {
    const company = await this.prisma.company.findFirst({
      where: { slug, deletedAt: null, siteActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        telegram: true,
        instagram: true,
        website: true,
        subscriptionStatus: true,
        trialExpiresAt: true,
      },
    });

    if (!company) {
      throw new NotFoundException("Company not found or store is disabled");
    }

    // Check lockdown/expiry
    if (this.isCompanyAccessBlocked(company)) {
      throw new ForbiddenException("Store temporarily suspended");
    }

    await this.planLimits.checkFeatureAllowed(
      company.id as string,
      "allowWebStore"
    );

    return company;
  }

  /** Get categories for store */
  @Get(":slug/categories")
  async getCategories(@Param("slug") slug: string) {
    const company = await this.prisma.company.findFirst({
      where: { slug, deletedAt: null, siteActive: true },
      select: { id: true },
    });
    if (!company) throw new NotFoundException("Company not found");

    await this.planLimits.checkFeatureAllowed(company.id, "allowWebStore");

    return this.prisma.category.findMany({
      where: { companyId: company.id, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  }

  /** Get public product catalog by company slug */
  @Get(":slug/products")
  async getProducts(
    @Param("slug") slug: string,
    @Query("categoryId") categoryId?: string,
    @Query("search") search?: string
  ) {
    const company = await this.prisma.company.findFirst({
      where: { slug, deletedAt: null, siteActive: true },
      select: { id: true },
    });

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    const compInfo = await this.prisma.company.findUnique({
      where: { id: company.id },
      select: { subscriptionStatus: true, trialExpiresAt: true },
    });

    if (this.isCompanyAccessBlocked(compInfo)) {
      throw new ForbiddenException("Catalog unavailable");
    }

    await this.planLimits.checkFeatureAllowed(company.id, "allowWebStore");

    const where: Record<string, unknown> = {
      companyId: company.id,
      deletedAt: null,
      isActive: true,
    };
    if (categoryId) where.categoryId = categoryId;
    if (search) where.name = { contains: search, mode: "insensitive" };

    const products = await this.prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        sku: true,
        description: true,
        price: true,
        stock: true,
        unit: true,
        imageUrl: true,
        categoryId: true,
        category: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });

    return products;
  }

  /** Identify dealer by phone and company slug */
  @Post(":slug/identify")
  async identifyDealer(
    @Param("slug") slug: string,
    @Body("phone") phone: string,
    @Body("telegramUserId") telegramUserId?: string,
    @Body("name") name?: string,
    @Headers("x-supplio-channel") channel?: string
  ) {
    if (channel !== "telegram-webapp") {
      throw new ForbiddenException(
        "Buyurtma berish faqat Telegram bot ichida mavjud"
      );
    }

    const company = await this.prisma.company.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true },
    });

    if (!company) throw new NotFoundException("Company not found");

    const companyAccess = await this.prisma.company.findUnique({
      where: { id: company.id },
      select: { subscriptionStatus: true, trialExpiresAt: true },
    });
    if (this.isCompanyAccessBlocked(companyAccess)) {
      throw new ForbiddenException("Store temporarily suspended");
    }
    await this.planLimits.checkFeatureAllowed(company.id, "allowWebStore");

    const chatId = telegramUserId ? String(telegramUserId) : "";

    if (chatId) {
      const dealerByChat = await this.prisma.dealer.findFirst({
        where: {
          companyId: company.id,
          telegramChatId: chatId,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          creditLimit: true,
          currentDebt: true,
          branchId: true,
          isApproved: true,
          isBlocked: true,
        },
      });

      if (dealerByChat) {
        if (dealerByChat.isBlocked) {
          throw new ForbiddenException(
            "Hisob bloklangan. Distributor bilan bog'laning."
          );
        }
        if (!dealerByChat.isApproved) {
          throw new ForbiddenException(
            "So'rovingiz yuborilgan. Distributor tasdiqlashini kuting."
          );
        }

        const { isApproved, isBlocked, ...dealerPayload } = dealerByChat as any;
        return dealerPayload;
      }
    }

    const cleanPhone = (phone || "").replace("+", "");
    if (!cleanPhone) {
      throw new BadRequestException("Telefon raqami talab qilinadi");
    }

    const dealer = await this.prisma.dealer.findFirst({
      where: {
        companyId: company.id,
        phone: { contains: cleanPhone.slice(-9) },
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        creditLimit: true,
        currentDebt: true,
        branchId: true,
        isApproved: true,
        isBlocked: true,
      },
    });

    if (dealer) {
      if (dealer.isBlocked) {
        throw new ForbiddenException(
          "Hisob bloklangan. Distributor bilan bog'laning."
        );
      }

      // Link telegram chat if user came from Telegram web app.
      if (chatId && dealer.telegramChatId !== chatId) {
        await this.prisma.dealer.update({
          where: { id: dealer.id },
          data: { telegramChatId: chatId },
        });
      }

      if (!dealer.isApproved) {
        const pending = await (
          this.prisma as any
        ).dealerApprovalRequest.findFirst({
          where: { dealerId: dealer.id, status: "PENDING" },
        });
        if (!pending) {
          await (this.prisma as any).dealerApprovalRequest.create({
            data: {
              companyId: company.id,
              dealerId: dealer.id,
              status: "PENDING",
              requestedAt: new Date(),
            },
          });
        }
        throw new ForbiddenException(
          "So'rovingiz yuborilgan. Distributor tasdiqlashini kuting."
        );
      }

      const { isApproved, isBlocked, ...dealerPayload } = dealer as any;
      return dealerPayload;
    }

    // If dealer does not exist in this store, create as pending request.
    const defaultBranch = await this.prisma.branch.findFirst({
      where: { companyId: company.id, deletedAt: null },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });
    if (!defaultBranch?.id) {
      throw new BadRequestException(
        "Filial topilmadi. Distributor bilan bog'laning."
      );
    }

    const pendingDealer = await this.prisma.dealer.create({
      data: {
        companyId: company.id,
        branchId: defaultBranch.id,
        name: (name || "Yangi diler").trim(),
        phone: cleanPhone.startsWith("+") ? cleanPhone : `+${cleanPhone}`,
        telegramChatId: chatId || null,
        isApproved: false,
      },
    });

    await (this.prisma as any).dealerApprovalRequest.create({
      data: {
        companyId: company.id,
        dealerId: pendingDealer.id,
        status: "PENDING",
        requestedAt: new Date(),
      },
    });

    throw new ForbiddenException(
      "Ro'yxatdan o'tish so'rovi yuborildi. Distributor tasdiqlashini kuting."
    );
  }

  /** Place order from public store */
  @Post(":slug/order")
  async placeOrder(
    @Param("slug") slug: string,
    @Headers("x-supplio-channel") channel: string | undefined,
    @Body()
    body: { dealerId: string; items: { productId: string; quantity: number }[] }
  ) {
    if (channel !== "telegram-webapp") {
      throw new ForbiddenException(
        "Buyurtma berish faqat Telegram bot ichida mavjud"
      );
    }

    const company = await this.prisma.company.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true },
    });
    if (!company) throw new NotFoundException("Company not found");

    const companyAccess = await this.prisma.company.findUnique({
      where: { id: company.id },
      select: { subscriptionStatus: true, trialExpiresAt: true },
    });
    if (this.isCompanyAccessBlocked(companyAccess)) {
      throw new ForbiddenException("Store temporarily suspended");
    }
    await this.planLimits.checkFeatureAllowed(company.id, "allowWebStore");

    const dealer = await this.prisma.dealer.findUnique({
      where: { id: body.dealerId },
    });
    if (!dealer || dealer.companyId !== company.id)
      throw new BadRequestException("Invalid dealer");
    if (!dealer.isApproved) {
      throw new ForbiddenException("Dealer hali tasdiqlanmagan");
    }
    if (dealer.isBlocked) {
      throw new ForbiddenException("Dealer bloklangan");
    }

    // 1. Calculate total and check stock
    let total = 0;
    const orderItemsData = [];

    for (const item of body.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product || product.companyId !== company.id)
        throw new BadRequestException(`Mahsulot topilmadi: ${item.productId}`);
      if (product.stock < item.quantity)
        throw new BadRequestException(`${product.name} stogi yetarli emas`);

      total += product.price * item.quantity;
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // 2. Check credit limit
    const availableCredit =
      (dealer.creditLimit || 0) - (dealer.currentDebt || 0);
    if (total > availableCredit && dealer.creditLimit > 0) {
      throw new BadRequestException("Kredit limiti yetarli emas!");
    }

    // 3. Create Order, Items, and update Stock in transaction
    return await this.prisma.$transaction(async (tx) => {
      // Create Order
      const order = await tx.order.create({
        data: {
          companyId: company.id,
          branchId: dealer.branchId,
          dealerId: dealer.id,
          totalAmount: total,
          status: "PENDING",
          items: orderItemsData, // Items is Json in schema
        },
      });

      // Update Stock
      for (const item of body.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Update Dealer Debt
      await tx.dealer.update({
        where: { id: dealer.id },
        data: { currentDebt: { increment: total } },
      });

      // Create Ledger Record
      await tx.ledgerTransaction.create({
        data: {
          companyId: company.id,
          dealerId: dealer.id,
          type: "ORDER",
          amount: total,
          reference: order.id,
        },
      });

      return order;
    });
  }
}
