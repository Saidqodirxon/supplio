"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const users = await prisma.user.findMany({
        select: { id: true, phone: true, roleType: true, companyId: true, branchId: true }
    });
    const companies = await prisma.company.findMany({
        select: { id: true, name: true, slug: true }
    });
    const branches = await prisma.branch.findMany({
        select: { id: true, name: true, companyId: true }
    });
    console.log('Users:');
    console.log(users);
    console.log('Companies:');
    console.log(companies);
    console.log('Branches:');
    console.log(branches);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=check-db.js.map