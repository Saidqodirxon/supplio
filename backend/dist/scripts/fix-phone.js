"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const result = await prisma.user.update({
        where: { phone: '998917505060' },
        data: { phone: '+998917505060' }
    });
    console.log('Fixed super admin phone:', result.phone);
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=fix-phone.js.map