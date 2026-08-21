import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    const updated = await prisma.question.updateMany({
      where: { position: 'Full Stack Developer Java' },
      data: { status: 'ARCHIVED' }
    });
    console.log(`Archived ${updated.count} old questions for Full Stack Developer Java`);
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
