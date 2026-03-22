import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('realcoder', salt);

  console.log('Cleaning up old data...');
  
  // Clean up relations that would block user deletion
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.news.deleteMany({});
  
  // Optionally clean up other operational data for a fresh start
  await prisma.order.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.ledgerTransaction.deleteMany({});
  await prisma.dealer.deleteMany({});
  await prisma.product.deleteMany({});

  // 1. Create/Ensure System Company for Super Admin
  const systemCompany = await prisma.company.upsert({
    where: { slug: 'system' },
    update: {},
    create: {
      name: 'Supplio System',
      slug: 'system',
      trialExpiresAt: new Date('2099-01-01'),
      subscriptionPlan: 'PREMIUM',
      subscriptionStatus: 'ACTIVE',
    }
  });

  // 2. Create/Ensure Distributor Company
  const distributorCompany = await prisma.company.upsert({
    where: { slug: 'realcoder' },
    update: {},
    create: {
      name: 'RealCoder Distributor',
      slug: 'realcoder',
      trialExpiresAt: new Date('2099-01-01'),
      subscriptionPlan: 'PRO',
      subscriptionStatus: 'ACTIVE',
    }
  });

  // Get or Create branches
  const systemBranch = await prisma.branch.findFirst({ where: { companyId: systemCompany.id } })
    || await prisma.branch.create({ data: { companyId: systemCompany.id, name: 'Main Headquarters' } });

  const distributorBranch = await prisma.branch.findFirst({ where: { companyId: distributorCompany.id } })
    || await prisma.branch.create({ data: { companyId: distributorCompany.id, name: 'Main Branch' } });

  // 3. Delete ALL users (including those that might have different hashes)
  await prisma.user.deleteMany({});

  console.log('Creating users...');

  // 4. Create Super Admin
  await prisma.user.create({
    data: {
      phone: '998917505060',
      passwordHash,
      fullName: 'Super Admin',
      roleType: 'SUPER_ADMIN',
      companyId: systemCompany.id,
      branchId: systemBranch.id,
      isActive: true,
      language: 'uz'
    }
  });

  // 5. Create Distributor User (RealCoder)
  await prisma.user.create({
    data: {
      phone: '+998200116877',
      passwordHash,
      fullName: 'RealCoder Distributor',
      roleType: 'OWNER',
      companyId: distributorCompany.id,
      branchId: distributorBranch.id,
      isActive: true,
      language: 'uz'
    }
  });

  console.log('--------------------------------------------------');
  console.log('Setup completed successfully.');
  console.log('Super Admin: 998917505060 / realcoder');
  console.log('Distributor: +998200116877 / realcoder');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Error during setup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
