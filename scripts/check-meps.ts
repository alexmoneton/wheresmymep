import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.mEP.count();
  console.log('MEPs in database:', count);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });

