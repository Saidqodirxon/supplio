/**
 * Test distributor seed — creates a realistic distributor account for dashboard testing.
 * Usage: npx ts-node scripts/seed-test-distributor.ts
 *
 * Credentials:
 *   Phone:    +998901112234
 *   Password: dist1234
 */
import { PrismaClient, RoleType } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const DIST_PHONE = "+998901112234";
const DIST_PASSWORD = "dist1234";
const COMPANY_SLUG = "test-distributor";

async function main() {
  const passwordHash = await bcrypt.hash(DIST_PASSWORD, 10);

  // Upsert company
  const company = await prisma.company.upsert({
    where: { slug: COMPANY_SLUG },
    update: {
      subscriptionPlan: "PREMIUM" as any,
      subscriptionStatus: "ACTIVE" as any,
      trialExpiresAt: new Date(2099, 0, 1),
      siteActive: true,
      cashbackPercent: 5,
      name: "Test Distribution LLC",
    },
    create: {
      name: "Test Distribution LLC",
      slug: COMPANY_SLUG,
      subscriptionPlan: "PREMIUM" as any,
      subscriptionStatus: "ACTIVE" as any,
      trialExpiresAt: new Date(2099, 0, 1),
      siteActive: true,
      cashbackPercent: 5,
      website: "https://test-dist.uz",
      telegram: "@testdist",
    },
  });

  console.log(`Company: ${company.name} (${company.id})`);

  // Clean existing data
  await prisma.$transaction([
    prisma.order.deleteMany({ where: { companyId: company.id } }),
    prisma.payment.deleteMany({ where: { companyId: company.id } }),
    prisma.expense.deleteMany({ where: { companyId: company.id } }),
    prisma.ledgerTransaction.deleteMany({ where: { companyId: company.id } }),
    prisma.dealer.deleteMany({ where: { companyId: company.id } }),
    prisma.product.deleteMany({ where: { companyId: company.id } }),
    prisma.branch.deleteMany({ where: { companyId: company.id } }),
    prisma.user.deleteMany({ where: { companyId: company.id } }),
  ]);

  // Branches
  const branchNames = ["Toshkent bosh filial", "Samarqand filiali", "Andijon filiali", "Namangan filiali"];
  const branches = await Promise.all(
    branchNames.map((name, i) =>
      prisma.branch.create({
        data: {
          companyId: company.id,
          name,
          address: `Test manzil ${i + 1}`,
          phone: `+998900001${String(i + 1).padStart(3, "0")}`,
        },
      })
    )
  );

  // Owner user
  await prisma.user.create({
    data: {
      phone: DIST_PHONE,
      passwordHash,
      fullName: "Test Distributor",
      roleType: RoleType.OWNER,
      companyId: company.id,
      branchId: branches[0].id,
      isActive: true,
    },
  });

  // Staff
  for (let i = 0; i < 5; i++) {
    await prisma.user.create({
      data: {
        phone: `+9989010001${String(i + 1).padStart(2, "0")}`,
        passwordHash,
        fullName: `Xodim ${i + 1}`,
        roleType: i < 2 ? RoleType.MANAGER : RoleType.SALES,
        companyId: company.id,
        branchId: branches[i % branches.length].id,
        isActive: true,
      },
    });
  }

  // Products (100 items)
  const categories = ["Elektronika", "Oziq-ovqat", "Kiyim", "Maishiy texnika", "Sport"];
  const productData = Array.from({ length: 100 }).map((_, i) => ({
    companyId: company.id,
    name: `${categories[i % categories.length]} mahsulot ${i + 1}`,
    sku: `TEST-${String(i + 1).padStart(4, "0")}`,
    price: 15_000 + (i % 30) * 8_000,
    costPrice: 9_000 + (i % 25) * 5_000,
    stock: 20 + (i % 80) * 3,
    unit: i % 3 === 0 ? "box" : "pcs",
    isPromo: i % 10 === 0,
  }));
  await prisma.product.createMany({ data: productData });

  const products = await prisma.product.findMany({ where: { companyId: company.id }, orderBy: { createdAt: "asc" } });

  // Dealers (50 items)
  const dealerNames = [
    "Abdullayev Sardor", "Toshmatov Jasur", "Karimov Bobur", "Yusupov Asilbek",
    "Nazarov Sherzod", "Qodirov Firdavs", "Hamidov Ulugbek", "Raximov Dilshod",
    "Xoliqov Mansur", "Botirov Sanjar", "Mirzayev Elbek", "Sobirov Nodir",
    "Holmatov Doniyor", "Tursunov Zafar", "Ismoilov Jamshid",
  ];
  const dealerData = Array.from({ length: 50 }).map((_, i) => ({
    companyId: company.id,
    branchId: branches[i % branches.length].id,
    name: i < dealerNames.length ? dealerNames[i] : `Diler ${i + 1}`,
    phone: `+99894${String(5000000 + i).slice(1)}`,
    address: `Toshkent, ${i + 1}-uy`,
    creditLimit: 3_000_000 + (i % 15) * 2_000_000,
    currentDebt: (i % 6) * 600_000,
    isApproved: true,
    cashbackBalance: (i % 8) * 20_000,
  }));
  await prisma.dealer.createMany({ data: dealerData });

  const dealers = await prisma.dealer.findMany({ where: { companyId: company.id }, orderBy: { createdAt: "asc" } });

  const statuses = ["PENDING", "ACCEPTED", "PREPARING", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED"] as const;

  // Orders (200 items spanning last 6 months)
  let totalOrderRevenue = 0;
  for (let i = 0; i < 200; i++) {
    const dealer = dealers[i % dealers.length];
    const prodA = products[i % products.length];
    const prodB = products[(i + 13) % products.length];
    const qA = (i % 8) + 1;
    const qB = (i % 4) + 1;
    const totalAmount = prodA.price * qA + prodB.price * qB;
    const totalCost = prodA.costPrice * qA + prodB.costPrice * qB;
    totalOrderRevenue += totalAmount;

    // Spread across 6 months
    const daysAgo = Math.floor((200 - i) * 0.9);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const status = statuses[i % statuses.length];

    const order = await prisma.order.create({
      data: {
        companyId: company.id,
        dealerId: dealer.id,
        branchId: dealer.branchId,
        status,
        totalAmount,
        totalCost,
        createdAt,
        items: [
          { productId: prodA.id, name: prodA.name, qty: qA, price: prodA.price, unit: prodA.unit, total: prodA.price * qA },
          { productId: prodB.id, name: prodB.name, qty: qB, price: prodB.price, unit: prodB.unit, total: prodB.price * qB },
        ],
      },
    });

    await prisma.ledgerTransaction.create({
      data: { companyId: company.id, branchId: dealer.branchId, dealerId: dealer.id, type: "ORDER", amount: totalAmount, createdAt },
    });

    // 60% of orders have payments
    if (i % 5 !== 0) {
      const paid = Math.round(totalAmount * (0.5 + (i % 5) * 0.1));
      const payAt = new Date(createdAt.getTime() + 3 * 60 * 60 * 1000);
      await prisma.payment.create({
        data: {
          companyId: company.id,
          branchId: dealer.branchId,
          dealerId: dealer.id,
          amount: paid,
          method: i % 3 === 0 ? "cash" : i % 3 === 1 ? "bank" : "card",
          note: "To'lov",
          createdAt: payAt,
        },
      });
      await prisma.ledgerTransaction.create({
        data: { companyId: company.id, branchId: dealer.branchId, dealerId: dealer.id, type: "PAYMENT", amount: paid, createdAt: payAt },
      });
    }
  }

  // Expenses (60 items)
  await prisma.expense.createMany({
    data: Array.from({ length: 60 }).map((_, i) => ({
      companyId: company.id,
      branchId: branches[i % branches.length].id,
      amount: 80_000 + (i % 10) * 120_000,
      category: ["Logistika", "Xodimlar", "Ijara", "Marketing", "Kommunal"][i % 5],
      description: `Xarajat ${i + 1}`,
      createdAt: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000),
    })),
  });

  console.log("\n=== Test Distributor Created ===");
  console.log("Company : Test Distribution LLC");
  console.log("Phone   :", DIST_PHONE);
  console.log("Password:", DIST_PASSWORD);
  console.log("Branches:", branches.length);
  console.log("Staff   : 6 (1 owner + 5)");
  console.log("Dealers :", dealers.length);
  console.log("Products:", products.length);
  console.log("Orders  : 200");
  console.log("================================\n");
  console.log("Dashboard URL: http://localhost:5173/login");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
