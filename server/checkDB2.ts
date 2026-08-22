import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const q = await prisma.question.findFirst({ where: { status: 'ACTIVE' } });
  console.log("Sample active question:", q);
  
  const positions = await prisma.question.groupBy({
    by: ['position'],
    where: { status: 'ACTIVE' }
  });
  console.log("Active positions count:", positions.length);
  console.log("Positions:", positions.map(p => p.position).slice(0, 10));

  const totalQuestions = await prisma.question.count({ where: { status: 'ACTIVE' } });
  console.log("Total ACTIVE questions:", totalQuestions);
}

check().catch(console.error).finally(() => prisma.$disconnect());
