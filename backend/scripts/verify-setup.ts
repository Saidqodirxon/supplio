import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  const users = await prisma.user.findMany({ select: { phone: true, roleType: true } });
  
  console.log(`User Count: ${userCount}`);
  for (const u of users) {
    console.log(`- ${u.phone} (${u.roleType})`);
  }
}
 
main().finally(() => prisma.$disconnect());

