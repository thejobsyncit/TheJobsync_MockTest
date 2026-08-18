const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const javaQuestions = [
  // MCQs
  { type: 'MCQ', category: 'Coding & Technical', difficulty: 'Easy', q: 'Which of the following is not a feature of Java?', options: ['Object-oriented', 'Use of pointers', 'Portable', 'Dynamic and Extensible'], answer: 'B' },
  { type: 'MCQ', category: 'Coding & Technical', difficulty: 'Medium', q: 'What is the default value of a local variable in Java?', options: ['null', '0', 'Depends on data type', 'Not assigned (Compiler error)'], answer: 'D' },
  { type: 'MCQ', category: 'Coding & Technical', difficulty: 'Hard', q: 'Which design pattern is used by the Java Runtime Environment to implement the event listener mechanism?', options: ['Observer', 'Factory', 'Decorator', 'Singleton'], answer: 'A' },
  // Coding
  { type: 'CODING', category: 'Coding & Technical', difficulty: 'Easy', q: 'Write a Java program to reverse a given String without using the reverse() method.' },
  { type: 'CODING', category: 'Coding & Technical', difficulty: 'Medium', q: 'Write a Java program to check if a given number is a prime number.' },
  { type: 'CODING', category: 'Coding & Technical', difficulty: 'Hard', q: 'Write a Java program to implement a Singleton class.' }
];

const pythonQuestions = [
  // MCQs
  { type: 'MCQ', category: 'Coding & Technical', difficulty: 'Easy', q: 'Which of the following data types is immutable in Python?', options: ['List', 'Dictionary', 'Set', 'Tuple'], answer: 'D' },
  { type: 'MCQ', category: 'Coding & Technical', difficulty: 'Medium', q: 'What is the output of print(2 ** 3 ** 2) in Python?', options: ['64', '512', '256', 'Error'], answer: 'B' },
  { type: 'MCQ', category: 'Coding & Technical', difficulty: 'Hard', q: 'Which of the following is used to handle exceptions in Python?', options: ['try...catch', 'try...except', 'try...finally', 'Both B and C'], answer: 'D' },
  // Coding
  { type: 'CODING', category: 'Coding & Technical', difficulty: 'Easy', q: 'Write a Python function to check if a given string is a palindrome.' },
  { type: 'CODING', category: 'Coding & Technical', difficulty: 'Medium', q: 'Write a Python program to generate the Fibonacci series up to n terms using a generator yield.' },
  { type: 'CODING', category: 'Coding & Technical', difficulty: 'Hard', q: 'Write a Python decorator that measures and prints the execution time of a function.' }
];

async function seed() {
  const allQuestions = [];
  
  for (const q of javaQuestions) {
    allQuestions.push({
      department: 'IT',
      position: 'Full Stack Developer Java',
      category: q.category,
      difficulty: q.difficulty,
      type: q.type,
      question_text: q.q,
      option_a: q.options ? q.options[0] : null,
      option_b: q.options ? q.options[1] : null,
      option_c: q.options ? q.options[2] : null,
      option_d: q.options ? q.options[3] : null,
      correct_answer: q.answer || null,
      status: 'ACTIVE'
    });
  }

  for (const q of pythonQuestions) {
    allQuestions.push({
      department: 'IT',
      position: 'Full Stack Developer Python',
      category: q.category,
      difficulty: q.difficulty,
      type: q.type,
      question_text: q.q,
      option_a: q.options ? q.options[0] : null,
      option_b: q.options ? q.options[1] : null,
      option_c: q.options ? q.options[2] : null,
      option_d: q.options ? q.options[3] : null,
      correct_answer: q.answer || null,
      status: 'ACTIVE'
    });
  }

  const result = await prisma.question.createMany({
    data: allQuestions,
    skipDuplicates: true
  });
  console.log('Successfully inserted ' + result.count + ' Full Stack specific questions.');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
