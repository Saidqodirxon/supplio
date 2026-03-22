"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const phone = "+998901112233";
    const password = "root_supplio_2026";
    const passwordHash = await bcrypt.hash(password, 10);
    const existing = await prisma.user.findUnique({
        where: { phone },
    });
    if (existing) {
        console.log("Super Admin already exists.");
        return;
    }
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
            roleType: client_1.RoleType.SUPER_ADMIN,
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
//# sourceMappingURL=seed_super.js.map