import { PrismaClient, Prisma, RoleType } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();
const DEMO_PHONE = "+998000000000";
const DEMO_PASSWORD = "demo1234";

function isMissingTableError(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code !== "P2010") return false;
  const meta = error.meta as { code?: string; message?: string } | undefined;
  return meta?.code === "42P01";
}

async function safeDeleteByCompany(table: string, companyId: string) {
  try {
    await prisma.$executeRawUnsafe(
      `DELETE FROM "${table}" WHERE "companyId" = $1`,
      companyId
    );
  } catch (error) {
    if (!isMissingTableError(error)) {
      throw error;
    }
    console.warn(`[seed:demo] Table ${table} mavjud emas, skip qilindi.`);
  }
}

async function hardDeleteDemoCompanyData(companyId: string) {
  await safeDeleteByCompany("NotificationLog", companyId);
  await safeDeleteByCompany("NotificationTemplate", companyId);
  await safeDeleteByCompany("Notification", companyId);
  await safeDeleteByCompany("UpgradeRequest", companyId);
  await safeDeleteByCompany("DealerApprovalRequest", companyId);
  await safeDeleteByCompany("Order", companyId);
  await safeDeleteByCompany("Payment", companyId);
  await safeDeleteByCompany("LedgerTransaction", companyId);
  await safeDeleteByCompany("Expense", companyId);
  await safeDeleteByCompany("Product", companyId);
  await safeDeleteByCompany("Dealer", companyId);
  await safeDeleteByCompany("CustomBot", companyId);
  await safeDeleteByCompany("FeatureFlag", companyId);
  await safeDeleteByCompany("Branch", companyId);
  await safeDeleteByCompany("CustomRole", companyId);
  await safeDeleteByCompany("User", companyId);
  await safeDeleteByCompany("Subscription", companyId);
}

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const company = await prisma.company.upsert({
    where: { slug: "supplio-demo" },
    update: {
      subscriptionPlan: "PREMIUM" as any,
      subscriptionStatus: "ACTIVE" as any,
      trialExpiresAt: new Date(2099, 0, 1),
      isDemo: true,
      siteActive: true,
      cashbackPercent: 5,
    },
    create: {
      name: "Supplio Demo",
      slug: "supplio-demo",
      isDemo: true,
      subscriptionPlan: "PREMIUM" as any,
      subscriptionStatus: "ACTIVE" as any,
      trialExpiresAt: new Date(2099, 0, 1),
      siteActive: true,
      cashbackPercent: 5,
    },
  });

  await hardDeleteDemoCompanyData(company.id);

  const branches = await Promise.all(
    [
      "Tashkent Main",
      "Samarkand Hub",
      "Andijan Point",
      "Bukhara North",
      "Namangan East",
    ].map((name, idx) =>
      prisma.branch.create({
        data: {
          companyId: company.id,
          name,
          address: `Demo address ${idx + 1}`,
          phone: `+998900000${String(idx + 1).padStart(3, "0")}`,
        },
      })
    )
  );

  await prisma.user.create({
    data: {
      phone: DEMO_PHONE,
      passwordHash,
      fullName: "Demo Distributor",
      roleType: RoleType.OWNER,
      companyId: company.id,
      branchId: branches[0].id,
      isActive: true,
    },
  });

  for (let i = 1; i <= 8; i++) {
    await prisma.user.create({
      data: {
        phone: `+998910000${String(i).padStart(3, "0")}`,
        passwordHash,
        fullName: `Demo User ${i}`,
        roleType: i <= 2 ? RoleType.MANAGER : RoleType.SALES,
        companyId: company.id,
        branchId: branches[i % branches.length].id,
        isActive: true,
      },
    });
  }

  const dealersData = Array.from({ length: 30 }).map((_, i) => ({
    companyId: company.id,
    branchId: branches[i % branches.length].id,
    name: `Demo Dealer ${i + 1}`,
    phone: `+9989500${String(i + 1).padStart(5, "0")}`,
    address: `Dealer street ${i + 1}`,
    creditLimit: 5_000_000 + (i % 10) * 2_000_000,
    currentDebt: (i % 5) * 450_000,
    isApproved: true,
    cashbackBalance: (i % 7) * 15_000,
  }));

  await prisma.dealer.createMany({ data: dealersData });

  const dealerList = await prisma.dealer.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "asc" },
  });

  await prisma.product.createMany({
    data: Array.from({ length: 180 }).map((_, i) => ({
      companyId: company.id,
      name: `Demo Product ${i + 1}`,
      sku: `DMO-${String(i + 1).padStart(4, "0")}`,
      price: 10_000 + (i % 25) * 5_000,
      costPrice: 6_000 + (i % 20) * 3_000,
      stock: 30 + (i % 60) * 5,
      unit: i % 3 === 0 ? "box" : "pcs",
      isPromo: i % 11 === 0,
    })),
  });

  const productList = await prisma.product.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "asc" },
  });

  const statuses = [
    "PENDING",
    "ACCEPTED",
    "PREPARING",
    "SHIPPED",
    "DELIVERED",
    "COMPLETED",
    "CANCELLED",
  ] as const;

  for (let i = 0; i < 140; i++) {
    const dealer = dealerList[i % dealerList.length];
    const productA = productList[i % productList.length];
    const productB = productList[(i + 17) % productList.length];
    const qtyA = (i % 7) + 2;
    const qtyB = (i % 5) + 1;
    const totalAmount = productA.price * qtyA + productB.price * qtyB;
    const totalCost = productA.costPrice * qtyA + productB.costPrice * qtyB;

    const createdAt = new Date(Date.now() - (140 - i) * 6 * 60 * 60 * 1000);

    await prisma.order.create({
      data: {
        companyId: company.id,
        dealerId: dealer.id,
        branchId: dealer.branchId,
        status: statuses[i % statuses.length],
        totalAmount,
        totalCost,
        createdAt,
        items: [
          {
            productId: productA.id,
            name: productA.name,
            qty: qtyA,
            price: productA.price,
            unit: productA.unit,
            total: productA.price * qtyA,
          },
          {
            productId: productB.id,
            name: productB.name,
            qty: qtyB,
            price: productB.price,
            unit: productB.unit,
            total: productB.price * qtyB,
          },
        ],
      },
    });

    await prisma.ledgerTransaction.create({
      data: {
        companyId: company.id,
        branchId: dealer.branchId,
        dealerId: dealer.id,
        type: "ORDER",
        amount: totalAmount,
        createdAt,
      },
    });

    if (i % 3 === 0) {
      const paid = Math.round(totalAmount * 0.75);
      await prisma.payment.create({
        data: {
          companyId: company.id,
          branchId: dealer.branchId,
          dealerId: dealer.id,
          amount: paid,
          method: i % 2 === 0 ? "cash" : "bank",
          note: "Demo seeded payment",
          createdAt: new Date(createdAt.getTime() + 2 * 60 * 60 * 1000),
        },
      });

      await prisma.ledgerTransaction.create({
        data: {
          companyId: company.id,
          branchId: dealer.branchId,
          dealerId: dealer.id,
          type: "PAYMENT",
          amount: paid,
          createdAt: new Date(createdAt.getTime() + 2 * 60 * 60 * 1000),
        },
      });
    }
  }

  await prisma.expense.createMany({
    data: Array.from({ length: 45 }).map((_, i) => ({
      companyId: company.id,
      branchId: branches[i % branches.length].id,
      amount: 120_000 + (i % 8) * 85_000,
      category: i % 2 === 0 ? "Logistics" : "Operations",
      description: `Demo expense ${i + 1}`,
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    })),
  });

  console.log("Demo branches seeded: 5");
  console.log("Demo users seeded: 9");
  console.log("Demo dealers seeded: 30");
  console.log("Demo products seeded: 180");
  console.log("Demo orders seeded: 140");
  console.log("Demo expenses seeded: 45");

  console.log("\n=== Demo Credentials ===");
  console.log("Company:  Supplio Demo");
  console.log("Phone:   ", DEMO_PHONE);
  console.log("Password:", DEMO_PASSWORD);
  console.log("URL:      demo.supplio.uz");
  console.log("========================\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
