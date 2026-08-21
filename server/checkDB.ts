import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    const questions = await prisma.question.findMany({
      where: { position: 'Full Stack Developer Java' }
    });
    console.log(`Found ${questions.length} questions for Full Stack Developer Java`);
    for (const q of questions) {
      console.log(q.question_id, q.category, q.question_text.substring(0, 50));
    }
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
