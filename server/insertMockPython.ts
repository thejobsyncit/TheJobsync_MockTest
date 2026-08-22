import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const position = 'Full Stack Developer Python';
  const data = [];
  
  for(let i=1; i<=10; i++) {
    data.push({
      department: 'IT',
      position: position,
      category: 'Aptitude',
      difficulty: 'Hard',
      type: 'MCQ',
      question_text: `Aptitude Question ${i}: What is the time complexity of binary search?`,
      option_a: 'O(1)',
      option_b: 'O(n)',
      option_c: 'O(log n)',
      option_d: 'O(n^2)',
      correct_answer: 'C',
      explanation: 'Binary search halves the search space each time.',
      status: 'ACTIVE'
    });
  }

  for(let i=1; i<=10; i++) {
    data.push({
      department: 'IT',
      position: position,
      category: 'Grammar & English',
      difficulty: 'Hard',
      type: 'MCQ',
      question_text: `Grammar Question ${i}: Identify the error: 'The team are winning the match.'`,
      option_a: 'The',
      option_b: 'team',
      option_c: 'are',
      option_d: 'winning',
      correct_answer: 'C',
      explanation: 'Team is a collective noun, so it should be is.',
      status: 'ACTIVE'
    });
  }

  for(let i=1; i<=10; i++) {
    data.push({
      department: 'IT',
      position: position,
      category: 'Role-Specific',
      difficulty: 'Hard',
      type: 'MCQ',
      question_text: `Python Question ${i}: What does this Python code print?\n\nx = [1, 2, 3]\nprint(x[1])`,
      option_a: '1',
      option_b: '2',
      option_c: '3',
      option_d: 'IndexError',
      correct_answer: 'B',
      explanation: 'Lists are 0-indexed.',
      status: 'ACTIVE'
    });
  }

  const result = await prisma.question.createMany({
    data: data,
    skipDuplicates: true
  });
  console.log('Inserted ' + result.count + ' mock questions');
}
main();
