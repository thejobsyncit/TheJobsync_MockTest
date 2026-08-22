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

async function import4SetsExcel() {
  console.log("Deactivating old questions...");
  await prisma.question.updateMany({
    where: { status: 'ACTIVE' },
    data: { status: 'INACTIVE' }
  });

  console.log("Reading 4 Sets Excel file...");
  const workbook = new exceljs.Workbook();
  await workbook.xlsx.readFile('JobSync_113_Roles_4_Sets_Hard_Level.xlsx');
  
  let totalImported = 0;

  // Process each worksheet (usually just one, but we'll loop just in case)
  for (const worksheet of workbook.worksheets) {
    let currentRole = '';
    const data: any[] = [];
    let skipCount = 0;

    worksheet.eachRow((row, rowNumber) => {
      // Assuming column A (1) contains the role name in merged cells
      const firstColValue = row.getCell(1).value?.toString() || '';
      
      if (firstColValue.includes('4 Sets × 30 MCQs')) {
        currentRole = firstColValue.split('—')[0].trim();
        if (currentRole.includes('(')) {
          currentRole = currentRole.split('(')[0].trim();
        }
        return; // Skip this header row
      }

      // If it's the secondary header row ("Set", "Section", "Q#", etc.), skip
      if (firstColValue === 'Set') {
        return;
      }

      // Read actual question data
      const setRaw = row.getCell(1).value?.toString() || '';
      const sectionRaw = row.getCell(2).value?.toString() || '';
      const question_text = row.getCell(4).value?.toString() || '';
      const option_a = row.getCell(5).value?.toString() || '';
      const option_b = row.getCell(6).value?.toString() || '';
      const option_c = row.getCell(7).value?.toString() || '';
      const option_d = row.getCell(8).value?.toString() || '';
      let correct_answer = row.getCell(9).value?.toString() || 'A';
      
      // Extract set number from "Set 1", "Set 2", etc.
      let set_number = 1;
      const setMatch = setRaw.match(/\d+/);
      if (setMatch) {
        set_number = parseInt(setMatch[0], 10);
      } else {
        // Not a valid question row if set cannot be parsed
        return;
      }

      correct_answer = correct_answer.substring(0, 1).toUpperCase();

      if (!currentRole || !question_text || !option_a) {
        skipCount++;
        return;
      }

      let category = 'Role-Specific';
      if (sectionRaw.includes("Aptitude")) {
        category = "Logical & Quantitative Aptitude";
      } else if (sectionRaw.includes("Grammar") || sectionRaw.includes("English")) {
        category = "Verbal & Communication Skills";
      } else {
        if (IT_ROLES.includes(currentRole)) {
          category = "Coding & Technical";
        } else {
          category = "Professional Knowledge";
        }
      }

      const department = IT_ROLES.includes(currentRole) ? 'IT' : 'Non-IT';

      data.push({
        department,
        position: currentRole,
        category,
        difficulty: 'Hard', // Assuming these are all tough based on prior logic
        type: 'MCQ',
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        explanation: 'Imported from 4-Sets Excel',
        status: 'ACTIVE',
        set_number
      });
    });

    console.log(`Parsed ${data.length} valid questions from worksheet ${worksheet.name}. Skipped ${skipCount} invalid rows.`);
    console.log(`Inserting into database in chunks...`);

    const CHUNK_SIZE = 1000;
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      await prisma.question.createMany({
        data: chunk,
        skipDuplicates: true
      });
      console.log(`Inserted chunk ${Math.floor(i / CHUNK_SIZE) + 1} of ${Math.ceil(data.length / CHUNK_SIZE)}`);
    }

    totalImported += data.length;
  }

  console.log(`✅ Import completed successfully! Total imported: ${totalImported}`);
}

import4SetsExcel().catch(console.error).finally(() => prisma.$disconnect());
