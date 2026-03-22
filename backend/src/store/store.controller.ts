import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  ForbiddenException,
  Post,
  Body,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("store")
export class StoreController {
  private readonly logger = new Logger(StoreController.name);

  constructor(private prisma: PrismaService) {}

  /** Get public company info by slug */
  @Get(":slug/info")
  async getCompanyInfo(@Param("slug") slug: string) {
    const company = await this.prisma.company.findFirst({
      where: { slug, deletedAt: null, siteActive: true },
      select: {
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

    // Check lockdown
    if (company.subscriptionStatus === "LOCKED") {
      throw new ForbiddenException("Store temporarily suspended");
    }

    if (
      company.subscriptionStatus === "TRIAL" &&
      new Date() > company.trialExpiresAt
    ) {
      throw new ForbiddenException("Maintenance in progress");
    }

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
    @Query("search") search?: string,
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

    if (
      compInfo?.subscriptionStatus === "LOCKED" ||
      (compInfo?.subscriptionStatus === "TRIAL" &&
        new Date() > (compInfo?.trialExpiresAt || 0))
    ) {
      throw new ForbiddenException("Catalog unavailable");
    }

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
    @Body("phone") phone: string
  ) {
    const company = await this.prisma.company.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true },
    });

    if (!company) throw new NotFoundException("Company not found");

    let cleanPhone = phone.replace("+", "");
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
      },
    });

    if (!dealer)
      throw new NotFoundException(
        "Diler topilmadi. Iltimos, raqamni tekshiring yoki menejer bilan bog'laning."
      );

    return dealer;
  }

  /** Place order from public store */
  @Post(":slug/order")
  async placeOrder(
    @Param("slug") slug: string,
    @Body()
    body: { dealerId: string; items: { productId: string; quantity: number }[] }
  ) {
    const company = await this.prisma.company.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true },
    });
    if (!company) throw new NotFoundException("Company not found");

    const dealer = await this.prisma.dealer.findUnique({
      where: { id: body.dealerId },
    });
    if (!dealer || dealer.companyId !== company.id)
      throw new BadRequestException("Invalid dealer");

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
