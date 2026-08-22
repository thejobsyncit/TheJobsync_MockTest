import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const IT_ROLES = [
  "Software Developer", "Full Stack Developer Java", "Full Stack Developer Python", "Frontend Developer",
  "Backend Developer", "Web Developer", "Mobile App Developer",
  "Android Developer", "iOS Developer", "Python Developer",
  "Java Developer", ".NET Developer", "PHP Developer",
  "React Developer", "Node.js Developer", "UI/UX Designer",
  "Data Analyst", "Data Scientist", "Business Analyst",
  "AI/ML Engineer", "DevOps Engineer", "Cloud Engineer",
  "Cybersecurity Analyst", "Network Engineer", "System Administrator",
  "Database Administrator", "QA Engineer", "Software Tester",
  "Automation Tester", "Technical Support Engineer", "IT Support Executive",
  "IT Project Manager", "Product Manager", "Scrum Master",
  "Solutions Architect", "Blockchain Developer", "Game Developer",
  "SEO Specialist", "Digital Marketing Specialist", "Content Writer",
  "Technical Writer"
];

const GENERAL_ROLES = [
  "General Candidate"
];

const NON_IT_ROLES = [
  "HR Executive", "HR Manager", "Recruiter", "Talent Acquisition Executive",
  "Payroll Executive", "Accountant", "Finance Executive", "Financial Analyst",
  "Banking Executive", "Insurance Executive", "Sales Executive", "Sales Manager",
  "Business Development Executive", "Business Development Manager", "Marketing Executive",
  "Marketing Manager", "Digital Marketing Executive", "Customer Care Executive",
  "Customer Support Executive", "Telecaller", "Back Office Executive", "Data Entry Operator",
  "Office Administrator", "Administrative Executive", "Receptionist", "Front Office Executive",
  "Operations Executive", "Operations Manager", "Logistics Executive", "Supply Chain Executive",
  "Procurement Executive", "Purchase Executive", "Store Manager", "Warehouse Executive",
  "Inventory Executive", "Retail Sales Executive", "Store Executive", "Relationship Manager",
  "Account Manager", "Legal Executive", "Legal Assistant", "Content Writer", "Copywriter",
  "Graphic Designer", "Video Editor", "Social Media Executive", "Social Media Manager",
  "Teacher", "Tutor", "Trainer", "School Coordinator", "Healthcare Executive",
  "Medical Representative", "Hospital Administrator", "Pharmacist", "Lab Technician",
  "Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Production Engineer",
  "Quality Control Executive", "Quality Assurance Executive", "Manufacturing Executive",
  "Site Engineer", "Architect", "Interior Designer", "Real Estate Executive", "Hotel Manager",
  "Chef", "Restaurant Manager", "Hospitality Executive", "Travel Consultant", "Customer Relationship Executive"
];

const allRoles = [...IT_ROLES, ...GENERAL_ROLES, ...NON_IT_ROLES];

async function main() {
  console.log("Deactivating all existing questions so we have a clean slate...");
  await prisma.question.updateMany({
    data: { status: 'INACTIVE' }
  });

  console.log(`Generating mock questions for ${allRoles.length} roles...`);
  
  for (const role of allRoles) {
    const data = [];
    
    // APTITUDE (10)
    for(let i=1; i<=10; i++) {
      data.push({
        department: 'IT',
        position: role,
        category: 'Aptitude',
        difficulty: 'Hard',
        type: 'MCQ',
        question_text: `Aptitude Question ${i}: What is the probability of selecting an ace from a deck of 52 cards?`,
        option_a: '1/13',
        option_b: '1/52',
        option_c: '4/13',
        option_d: '1/4',
        correct_answer: 'A',
        explanation: 'There are 4 aces in 52 cards (4/52 = 1/13).',
        status: 'ACTIVE'
      });
    }

    // GRAMMAR (10)
    for(let i=1; i<=10; i++) {
      data.push({
        department: 'IT',
        position: role,
        category: 'Grammar & English',
        difficulty: 'Hard',
        type: 'MCQ',
        question_text: `Grammar Question ${i}: Identify the error: 'The company are planning to expand.'`,
        option_a: 'The',
        option_b: 'company',
        option_c: 'are',
        option_d: 'planning',
        correct_answer: 'C',
        explanation: 'Company is a singular noun, so it should be "is".',
        status: 'ACTIVE'
      });
    }

    // ROLE-SPECIFIC (10)
    for(let i=1; i<=10; i++) {
      data.push({
        department: 'IT',
        position: role,
        category: 'Role-Specific',
        difficulty: 'Hard',
        type: 'MCQ',
        question_text: `${role} Question ${i}: What is the most critical factor for success in the role of ${role}?`,
        option_a: 'Time management',
        option_b: 'Core competency and applied logic',
        option_c: 'Communication skills',
        option_d: 'Guessing answers randomly',
        correct_answer: 'B',
        explanation: `Core competency is essential for a ${role}.`,
        status: 'ACTIVE'
      });
    }

    await prisma.question.createMany({
      data: data,
      skipDuplicates: true
    });
    console.log(`Inserted 30 mock questions for ${role}`);
  }

  console.log('Successfully completed inserting mock questions for all roles!');
}

main().catch(console.error);
