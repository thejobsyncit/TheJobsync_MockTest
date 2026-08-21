import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    const deleted = await prisma.question.deleteMany({
      where: { position: 'Full Stack Developer Java' }
    });
    console.log(`Deleted ${deleted.count} old questions for Full Stack Developer Java`);
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
