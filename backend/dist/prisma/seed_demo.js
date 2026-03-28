"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const phone = "+998000000000";
    const password = "demo1234";
    const passwordHash = await bcrypt.hash(password, 10);
    const company = await prisma.company.upsert({
        where: { slug: "supplio-demo" },
        update: {
            subscriptionPlan: "PREMIUM",
            subscriptionStatus: "ACTIVE",
            trialExpiresAt: new Date(2099, 0, 1),
            isDemo: true,
            siteActive: true,
            cashbackPercent: 5,
        },
        create: {
            name: "Supplio Demo",
            slug: "supplio-demo",
            isDemo: true,
            subscriptionPlan: "PREMIUM",
            subscriptionStatus: "ACTIVE",
            trialExpiresAt: new Date(2099, 0, 1),
            siteActive: true,
            cashbackPercent: 5,
        },
    });
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
        await prisma.user.update({
            where: { phone },
            data: {
                passwordHash,
                fullName: "Demo Distributor",
                roleType: client_1.RoleType.OWNER,
                companyId: company.id,
                isActive: true,
            },
        });
        console.log("Demo user updated");
    }
    else {
        await prisma.user.create({
            data: {
                phone,
                passwordHash,
                fullName: "Demo Distributor",
                roleType: client_1.RoleType.OWNER,
                companyId: company.id,
                isActive: true,
            },
        });
        console.log("Demo user created");
    }
    console.log("\n=== Demo Credentials ===");
    console.log("Company:  Supplio Demo");
    console.log("Phone:   ", phone);
    console.log("Password:", password);
    console.log("URL:      demo.supplio.uz");
    console.log("========================\n");
}
main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed_demo.js.map