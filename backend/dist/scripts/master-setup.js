"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('realcoder', salt);
    console.log('Cleaning up old data...');
    await prisma.auditLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.news.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.ledgerTransaction.deleteMany({});
    await prisma.dealer.deleteMany({});
    await prisma.product.deleteMany({});
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
    const systemBranch = await prisma.branch.findFirst({ where: { companyId: systemCompany.id } })
        || await prisma.branch.create({ data: { companyId: systemCompany.id, name: 'Main Headquarters' } });
    const distributorBranch = await prisma.branch.findFirst({ where: { companyId: distributorCompany.id } })
        || await prisma.branch.create({ data: { companyId: distributorCompany.id, name: 'Main Branch' } });
    await prisma.user.deleteMany({});
    console.log('Creating users...');
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
//# sourceMappingURL=master-setup.js.map