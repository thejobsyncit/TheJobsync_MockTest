import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    const questions = await prisma.question.findMany({
      where: { position: 'Full Stack Developer Java', status: 'ACTIVE' }
    });
    console.log(`Found ${questions.length} active questions.`);
    const categories = new Set(questions.map(q => q.category));
    console.log('Categories:', Array.from(categories));
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
