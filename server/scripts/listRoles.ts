import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.question.groupBy({
    by: ['position'],
    _count: true,
  });
  console.log(JSON.stringify(roles, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
