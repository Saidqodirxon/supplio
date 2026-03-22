import { PrismaClient, RoleType } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const phone = "+998901112233";
  const password = "root_supplio_2026";
  const passwordHash = await bcrypt.hash(password, 10);

  // Check if super admin exists
  const existing = await prisma.user.findUnique({
    where: { phone },
  });

  if (existing) {
    console.log("Super Admin already exists.");
    return;
  }

  // Create a system company for super admin
  const company = await prisma.company.upsert({
    where: { slug: "supplio-system" },
    update: {},
    create: {
      name: "Supplio Global System",
      slug: "supplio-system",
      trialExpiresAt: new Date(2030, 0, 1),
    },
  });

  await prisma.user.create({
    data: {
      phone,
      passwordHash,
      fullName: "Super Admin",
      roleType: RoleType.SUPER_ADMIN,
      companyId: company.id,
    },
  });

  console.log("Super Admin created successfully!");
  console.log("Phone:", phone);
  console.log("Password:", password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
