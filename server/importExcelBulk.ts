import exceljs from 'exceljs';
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

async function importQuestions() {
  console.log("Deactivating old questions...");
  await prisma.question.updateMany({
    where: { status: 'ACTIVE' },
    data: { status: 'INACTIVE' }
  });

  console.log("Reading Excel file...");
  const workbook = new exceljs.Workbook();
  await workbook.xlsx.readFile('JobSync_All_114_Roles_3420_Tough_MCQs_Tough_Coding.xlsx');
  const worksheet = workbook.worksheets[0];
  
  const data: any[] = [];
  
  let skipCount = 0;
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    
    const position = row.getCell(1).value?.toString() || '';
    const sectionRaw = row.getCell(2).value?.toString() || '';
    const question_text = row.getCell(4).value?.toString() || '';
    const option_a = row.getCell(5).value?.toString() || '';
    const option_b = row.getCell(6).value?.toString() || '';
    const option_c = row.getCell(7).value?.toString() || '';
    const option_d = row.getCell(8).value?.toString() || '';
    
    // Sometimes Excel correct answer is e.g. "A) ...", we just need the first letter "A"
    let correct_answer = row.getCell(9).value?.toString() || 'A';
    correct_answer = correct_answer.substring(0,1).toUpperCase();
    
    const difficulty = row.getCell(10).value?.toString() || 'Hard';
    
    if (!position || !question_text || !option_a) {
      skipCount++;
      return;
    }

    let category = 'Role-Specific';
    if (sectionRaw.includes("Aptitude")) {
      category = "Logical & Quantitative Aptitude";
    } else if (sectionRaw.includes("Grammar") || sectionRaw.includes("English")) {
      category = "Verbal & Communication Skills";
    } else {
      if (IT_ROLES.includes(position)) {
        category = "Coding & Technical";
      } else {
        category = "Professional Knowledge";
      }
    }

    // Determine department
    const department = IT_ROLES.includes(position) ? 'IT' : 'Non-IT';

    data.push({
      department,
      position,
      category,
      difficulty,
      type: 'MCQ',
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      explanation: 'Imported from Excel',
      status: 'ACTIVE'
    });
  });

  console.log(`Parsed ${data.length} valid questions from Excel. Skipped ${skipCount} invalid rows.`);
  console.log("Inserting into database in chunks...");

  const CHUNK_SIZE = 500;
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    await prisma.question.createMany({
      data: chunk,
      skipDuplicates: true
    });
    console.log(`Inserted chunk ${Math.floor(i/CHUNK_SIZE) + 1} of ${Math.ceil(data.length/CHUNK_SIZE)}`);
  }

  console.log("✅ Import completed successfully!");
}

importQuestions().catch(console.error).finally(() => prisma.$disconnect());
