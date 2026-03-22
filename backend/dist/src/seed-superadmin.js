"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    const phone = "+998901112233";
    const password = "superpassword123";
    const passwordHash = await bcrypt.hash(password, 10);
    let company = await prisma.company.findFirst();
    if (!company) {
        company = await prisma.company.create({
            data: {
                name: "Supplio Central",
                slug: "supplio",
                trialExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                subscriptionStatus: "ACTIVE",
            },
        });
        console.log("Created system company");
    }
    const superAdmin = await prisma.user.upsert({
        where: { phone },
        update: {
            roleType: client_1.RoleType.SUPER_ADMIN,
            passwordHash,
        },
        create: {
            phone,
            passwordHash,
            fullName: "System Super Admin",
            roleType: client_1.RoleType.SUPER_ADMIN,
            companyId: company.id,
        },
    });
    console.log("Super Admin user ensured:");
    console.log(`Phone: ${superAdmin.phone}`);
    console.log(`Password: ${password}`);
    console.log(`ID: ${superAdmin.id}`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-superadmin.js.map