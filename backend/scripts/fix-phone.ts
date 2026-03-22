import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.update({
    where: { phone: '998917505060' },
    data: { phone: '+998917505060' }
  });
  console.log('Fixed super admin phone:', result.phone);
}

main().finally(() => prisma.$disconnect());
