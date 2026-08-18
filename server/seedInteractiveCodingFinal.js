const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const IT_ROLES = [
  'Software Developer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Web Developer',
  'Mobile App Developer',
  'Android Developer',
  'iOS Developer',
  'Python Developer',
  'Java Developer',
  '.NET Developer',
  'PHP Developer',
  'React Developer',
  'Node.js Developer',
  'UI/UX Designer',
  'Data Analyst',
  'Data Scientist',
  'Business Analyst',
  'AI/ML Engineer',
  'DevOps Engineer',
  'Cloud Engineer',
  'Cybersecurity Analyst',
  'Network Engineer',
  'System Administrator',
  'Database Administrator',
  'QA Engineer',
  'Software Tester',
  'Automation Tester',
  'Technical Support Engineer',
  'IT Support Executive',
  'IT Project Manager',
  'Product Manager',
  'Scrum Master',
  'Solutions Architect'
];

const interactiveCodingQuestions = [
  { q: 'Write a JavaScript function that takes a string and returns it reversed.', difficulty: 'Easy' },
  { q: 'Write a function to check if a given string is a palindrome. Return true or false.', difficulty: 'Easy' },
  { q: 'Write a Python function to find the maximum element in an array without using built-in max().', difficulty: 'Medium' },
  { q: 'Implement a function that returns the nth number in the Fibonacci sequence.', difficulty: 'Medium' },
  { q: 'Write a function that accepts an array of integers and returns two numbers that add up to a specific target.', difficulty: 'Hard' },
  { q: 'Implement a method to compress a string using the counts of repeated characters (e.g., "aabcccccaaa" becomes "a2b1c5a3").', difficulty: 'Hard' }
];

async function seed() {
  const allQuestions = [];
  
  for (const role of IT_ROLES) {
    for (const cq of interactiveCodingQuestions) {
      allQuestions.push({
        department: 'IT',
        position: role,
        category: 'Coding & Technical',
        difficulty: cq.difficulty,
        type: 'CODING',
        question_text: cq.q,
        status: 'ACTIVE'
      });
    }
  }

  const result = await prisma.question.createMany({
    data: allQuestions,
    skipDuplicates: true
  });
  console.log('Successfully inserted ' + result.count + ' interactive coding questions.');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
