import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    const questions = await prisma.question.findMany({
      where: { position: 'HR Executive' },
      orderBy: { question_id: 'desc' },
      take: 15
    });
    for (const q of questions) {
      console.log(`[${q.category}] ${q.question_text}\n  A) ${q.option_a}\n  B) ${q.option_b}\n  C) ${q.option_c}\n  D) ${q.option_d}\n  Correct: ${q.correct_answer}\n`);
    }
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
