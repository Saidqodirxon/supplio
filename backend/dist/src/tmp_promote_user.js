"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const phone = "+998991112233";
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
        console.log(`User ${phone} not found`);
        return;
    }
    await prisma.user.update({
        where: { phone },
        data: { roleType: "SUPER_ADMIN" },
    });
    console.log(`User ${phone} promoted to SUPER_ADMIN`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=tmp_promote_user.js.map