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

const codingQuestionsTemplate = [
  { q: 'What is the correct syntax for a single-line comment in JavaScript?', options: ['// comment', '/* comment */', '<!-- comment -->', '# comment'], answer: 'A', difficulty: 'Easy' },
  { q: 'Which of the following data types is NOT supported in Python?', options: ['List', 'Dictionary', 'Tree', 'Tuple'], answer: 'C', difficulty: 'Easy' },
  { q: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Text Machine Language', 'Hyperlink and Text Markup Language', 'None of the above'], answer: 'A', difficulty: 'Easy' },
  { q: 'In Git, which command is used to save changes to the local repository?', options: ['git push', 'git pull', 'git commit', 'git add'], answer: 'C', difficulty: 'Easy' },
  { q: 'What will be the output of console.log(typeof null) in JavaScript?', options: ['"null"', '"undefined"', '"object"', '"boolean"'], answer: 'C', difficulty: 'Medium' },
  { q: 'Which data structure uses LIFO (Last In First Out) principle?', options: ['Queue', 'Stack', 'Linked List', 'Array'], answer: 'B', difficulty: 'Medium' },
  { q: 'In SQL, what is the primary purpose of a JOIN clause?', options: ['To sort results', 'To combine rows from two or more tables', 'To delete records', 'To insert new data'], answer: 'B', difficulty: 'Medium' },
  { q: 'Which sorting algorithm has the best average-case time complexity?', options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'], answer: 'C', difficulty: 'Medium' },
  { q: 'What does REST stand for in web services?', options: ['Representational State Transfer', 'Remote Execution State Transfer', 'Random Endpoint Service Technology', 'Request Entity State Transfer'], answer: 'A', difficulty: 'Medium' },
  { q: 'What is the time complexity of searching for an element in a balanced Binary Search Tree?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'], answer: 'C', difficulty: 'Hard' },
  { q: 'Which design pattern restricts the instantiation of a class to one object?', options: ['Factory', 'Singleton', 'Observer', 'Decorator'], answer: 'B', difficulty: 'Hard' },
  { q: 'In React, what is the primary purpose of the useMemo hook?', options: ['To trigger side effects', 'To memoize expensive calculations', 'To manage global state', 'To directly manipulate the DOM'], answer: 'B', difficulty: 'Hard' },
  { q: 'What is the purpose of the volatile keyword in Java?', options: ['To prevent a variable from being modified', 'To ensure memory visibility across threads', 'To mark a class as un-inheritable', 'To force garbage collection'], answer: 'B', difficulty: 'Hard' }
];

async function seed() {
  const allQuestions = [];
  
  for (const role of IT_ROLES) {
    for (const cq of codingQuestionsTemplate) {
      allQuestions.push({
        department: 'IT',
        position: role,
        category: 'Coding & Technical',
        difficulty: cq.difficulty,
        question_text: cq.q,
        option_a: cq.options[0],
        option_b: cq.options[1],
        option_c: cq.options[2],
        option_d: cq.options[3],
        correct_answer: cq.answer,
        status: 'ACTIVE'
      });
    }
  }

  const result = await prisma.question.createMany({
    data: allQuestions,
    skipDuplicates: true
  });
  console.log('Successfully inserted ' + result.count + ' coding questions.');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
