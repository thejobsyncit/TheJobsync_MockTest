import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const IT_ROLES = ["Software Developer", "Full Stack Developer Java", "Full Stack Developer Python", "Frontend Developer", "Backend Developer", "Web Developer", "Mobile App Developer", "Android Developer", "iOS Developer", "Python Developer", "Java Developer", ".NET Developer", "PHP Developer", "React Developer", "Node.js Developer", "UI/UX Designer", "Data Analyst", "Data Scientist", "Business Analyst", "AI/ML Engineer", "DevOps Engineer", "Cloud Engineer", "Cybersecurity Analyst", "Network Engineer", "System Administrator", "Database Administrator", "QA Engineer", "Software Tester", "Automation Tester", "Technical Support Engineer", "IT Support Executive", "IT Project Manager", "Product Manager", "Scrum Master", "Solutions Architect", "Blockchain Developer", "Game Developer", "SEO Specialist", "Digital Marketing Specialist", "Content Writer", "Technical Writer"];

  console.log("Updating Aptitude categories...");
  await prisma.question.updateMany({
    where: { category: 'Aptitude' },
    data: { category: 'Logical & Quantitative Aptitude' }
  });

  console.log("Updating Grammar categories...");
  await prisma.question.updateMany({
    where: { category: 'Grammar & English' },
    data: { category: 'Verbal & Communication Skills' }
  });

  console.log("Updating IT Role-Specific categories...");
  await prisma.question.updateMany({
    where: { category: 'Role-Specific', position: { in: IT_ROLES } },
    data: { category: 'Coding & Technical' }
  });

  console.log("Updating Non-IT Role-Specific categories...");
  await prisma.question.updateMany({
    where: { category: 'Role-Specific', position: { notIn: IT_ROLES } },
    data: { category: 'Professional Knowledge' }
  });

  console.log("Done updating categories!");
}

main().catch(console.error);
