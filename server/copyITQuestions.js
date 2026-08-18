const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  // Get all generic IT questions (e.g. from Software Developer)
  const baseQuestions = await prisma.question.findMany({
    where: { position: 'Software Developer' }
  });

  const newRoles = ['Full Stack Developer Java', 'Full Stack Developer Python'];
  const allNewQuestions = [];

  for (const role of newRoles) {
    for (const q of baseQuestions) {
      // For coding & technical, we only want to copy the MCQs and generic ones
      // Since we already added specific ones, but we need enough to reach 10
      allNewQuestions.push({
        department: 'IT',
        position: role,
        category: q.category,
        difficulty: q.difficulty,
        type: q.type,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        status: 'ACTIVE'
      });
    }
  }

  const result = await prisma.question.createMany({
    data: allNewQuestions,
    skipDuplicates: true
  });
  console.log('Successfully copied ' + result.count + ' base IT questions for new Full Stack roles.');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
