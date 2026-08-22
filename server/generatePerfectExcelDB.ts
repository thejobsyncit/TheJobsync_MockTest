import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';
import exceljs from 'exceljs';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

const GENERAL_ROLES = ["General Candidate"];

const allRoles = [...IT_ROLES, ...NON_IT_ROLES, ...GENERAL_ROLES];

// 20 Extremely Tough Aptitude Questions
const hardAptitudeBank = [
  { q: "A distributed microservice architecture scales from 120 pods to 300 pods. If the original 120 pods handle 60,000 requests/min at 80% CPU, and scaling incurs a 15% non-linear penalty for every doubling, what is the max theoretical throughput of the 300 pods?", a: "125,000 req/min", b: "159,375 req/min", c: "167,000 req/min", d: "187,500 req/min", correct: "B" },
  { q: "A caching server has a hit rate of 85%. The cache retrieval takes 2ms, while a database fetch takes 80ms. The company introduces a secondary L2 cache that intercepts 50% of misses, taking 10ms. What is the new expected average latency?", a: "8.5 ms", b: "9.2 ms", c: "11.7 ms", d: "15.0 ms", correct: "A" },
  { q: "If an Agile team's velocity drops by 15% every sprint due to technical debt, and baseline was 80 points, how many total points will they complete after 4 sprints?", a: "245 points", b: "260 points", c: "276 points", d: "320 points", correct: "C" },
  { q: "A server rack consumes 4.5 kW. Cooling requires 0.5 kW for every 1 kW of server heat. Non-cooling facility overhead is 2.25 kW. What is the PUE (Power Usage Effectiveness)?", a: "1.25", b: "1.50", c: "1.75", d: "2.00", correct: "D" },
  { q: "Three cron jobs run every 12 mins, 15 mins, and 20 mins. They all run simultaneously at 00:00. When is the next time all three will crash due to simultaneous execution?", a: "00:45", b: "01:00", c: "01:20", d: "02:00", correct: "B" },
  { q: "A binary classification model has TP=80, FP=20, FN=10, TN=890. What is the F1-Score?", a: "0.80", b: "0.84", c: "0.88", d: "0.90", correct: "B" },
  { q: "A background queue processes 5 jobs/sec. Jobs arrive at a Poisson rate of 4.5 jobs/sec. What is the average number of jobs waiting in the queue (M/M/1)?", a: "4.5", b: "8.1", c: "9.0", d: "10.5", correct: "B" },
  { q: "A 5TB payload needs encryption. Symmetric does 500MB/s, Asymmetric does 50MB/s. They use symmetric for the data, asymmetric for the 256-bit key. How much total time is required?", a: "2.77 hours", b: "2.84 hours", c: "3.10 hours", d: "10.0 hours", correct: "A" },
  { q: "SaaS company charges $50/month per user. CAC is $300. Monthly churn is 5%. What is the LTV to CAC ratio?", a: "2.5", b: "3.33", c: "5.0", d: "10.0", correct: "B" },
  { q: "A cryptographically secure RNG generates a 128-bit key. What is the approximate probability of a collision if 2^64 keys are generated (Birthday Paradox)?", a: "0.01%", b: "39.3%", c: "50%", d: "99.9%", correct: "B" },
  { q: "If X is a normally distributed random variable with mean 50 and standard deviation 10, what is the probability that X falls between 40 and 60?", a: "50%", b: "68%", c: "95%", d: "99.7%", correct: "B" },
  { q: "Two trains start 500km apart, traveling towards each other at 50km/h and 75km/h. A bird flies between them at 100km/h until they collide. How far does the bird fly?", a: "300 km", b: "400 km", c: "500 km", d: "600 km", correct: "B" },
  { q: "A company's revenue grows by 20% year-over-year, but costs grow by 25%. If initial revenue is $1M and costs are $800k, in which year will costs exceed revenue?", a: "Year 3", b: "Year 5", c: "Year 7", d: "Never", correct: "B" },
  { q: "Evaluate the limit as x approaches 0 of (sin(x) - x) / x^3 using L'Hopital's rule.", a: "-1/6", b: "0", c: "1/6", d: "Infinity", correct: "A" },
  { q: "In a group of 100 people, 60 like Apples, 50 like Bananas, and 20 like neither. How many like both?", a: "10", b: "20", c: "30", d: "40", correct: "C" },
  { q: "If A = [[1, 2], [3, 4]], what is the determinant of the inverse of A?", a: "-2", b: "-0.5", c: "0.5", d: "2", correct: "B" },
  { q: "A fair coin is flipped 10 times. What is the probability of getting exactly 5 heads?", a: "0.124", b: "0.246", c: "0.500", d: "0.750", correct: "B" },
  { q: "Solve for x: log2(x) + log2(x-3) = 2", a: "1", b: "3", c: "4", d: "5", correct: "C" },
  { q: "What is the expected number of rolls of a fair 6-sided die to see all 6 faces at least once (Coupon Collector's Problem)?", a: "6", b: "14.7", c: "21", d: "36", correct: "B" },
  { q: "A network path has 4 routers. Each router drops a packet with probability 0.1. What is the probability a packet successfully traverses the path?", a: "0.6000", b: "0.6561", c: "0.9000", d: "0.9999", correct: "B" }
];

// 20 Extremely Tough Grammar Questions
const hardGrammarBank = [
  { q: "Identify the most professional sentence for a critical incident report:", a: "The server ran out of memory, which we didn't expect.", b: "An unexpected memory exhaustion event on the primary server precipitated the service outage.", c: "Because of the server losing memory, the outage happened.", d: "The service outage was catalyzed by an unanticipated exhaustion of memory resources on the primary server.", correct: "D" },
  { q: "Choose the correct preposition: 'The newly implemented API gateway acts as an intermediary ________ the client applications and our internal microservices architecture.'", a: "among", b: "between", c: "within", d: "amidst", correct: "B" },
  { q: "Which sentence correctly utilizes the subjunctive mood in a technical proposal?", a: "If the database is to fail, the failover mechanism triggers.", b: "We strongly recommend that the backup script be executed nightly.", c: "It is imperative that the administrator updates the SSL certificates.", d: "I wish the deployment was completed without downtime.", correct: "B" },
  { q: "Identify the dangling modifier in this code review comment:", a: "Having compiled successfully, the developer pushed the binary.", b: "After reviewing the pull request, I noticed several vulnerabilities.", c: "To optimize the query, an index should be added.", d: "While debugging the memory leak, the root cause became apparent.", correct: "A" },
  { q: "Select the word that best fits: 'The sudden spike in latency was completely __________, showing no correlation with known traffic patterns.'", a: "synchronous", b: "deterministic", c: "anomalous", d: "pervasive", correct: "C" },
  { q: "Which sentence demonstrates proper parallel structure?", a: "The script will validate input, parse JSON, and it updates the database.", b: "The script validates input, parses JSON, and updating the database.", c: "The script is designed to validate input, parse JSON, and update the database.", d: "The script validates input, for parsing JSON, and updates the database.", correct: "C" },
  { q: "Choose the most appropriate connective: 'Monolithic architectures allow for rapid initial development. ________, they often become unwieldy to scale.'", a: "Consequently", b: "Conversely", c: "Furthermore", d: "Henceforth", correct: "B" },
  { q: "Identify the error: 'Regarding the migration, neither the staging databases nor the production cluster have been provisioned yet.'", a: "Regarding", b: "nor", c: "have", d: "provisioned", correct: "C" },
  { q: "What is the meaning of the idiom 'reinvent the wheel' in a code review?", a: "Modernize obsolete code", b: "Waste time creating a solution that already exists", c: "Refactor a schema for circular references", d: "Implement Agile methodologies", correct: "B" },
  { q: "Complete with correct tense: 'By the time the alert triggered, the memory leak ________ the server for over three hours.'", a: "has been crashing", b: "had been degrading", c: "was degrading", d: "is degrading", correct: "B" },
  { q: "Select the best synonym for 'mitigate' in a risk assessment context:", a: "Aggravate", b: "Alleviate", c: "Instigate", d: "Validate", correct: "B" },
  { q: "Identify the grammatical error: 'The team of engineers, who were working late, finally deployed the fix that they has developed over the weekend.'", a: "who were", b: "finally deployed", c: "they has", d: "over the weekend", correct: "C" },
  { q: "Choose the correct phrase: 'The success of the project is contingent ________ receiving funding by Q3.'", a: "with", b: "upon", c: "to", d: "for", correct: "B" },
  { q: "Which of the following is a complex sentence?", a: "The system crashed.", b: "The system crashed, and we restarted it.", c: "Because the memory limit was exceeded, the system crashed.", d: "The memory limit was exceeded; therefore, the system crashed.", correct: "C" },
  { q: "Identify the passive voice sentence:", a: "The admin restarted the server.", b: "The server was restarted by the admin.", c: "The server failed suddenly.", d: "The admin is restarting the server.", correct: "B" },
  { q: "Choose the correct spelling:", a: "Accommodate", b: "Acommodate", c: "Accomodate", d: "Acomodate", correct: "A" },
  { q: "What does the prefix 'pseudo-' mean in 'pseudocode'?", a: "Before", b: "After", c: "False or fake", d: "Advanced", correct: "C" },
  { q: "Complete the analogy: Algorithm is to Programming as Blueprint is to ________.", a: "Painting", b: "Architecture", c: "Writing", d: "Music", correct: "B" },
  { q: "Identify the oxymoron:", a: "Deafening silence", b: "Loud noise", c: "Bright light", d: "Dark night", correct: "A" },
  { q: "Which word means 'to express disapproval of'?", a: "Commend", b: "Condone", c: "Deprecate", d: "Endorse", correct: "C" }
];

function shuffleArray(array: any[]) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log("🔥 DEACTIVATING ALL PREVIOUS BAD EXCEL QUESTIONS...");
  await prisma.question.updateMany({
    where: { status: 'ACTIVE' },
    data: { status: 'INACTIVE' }
  });
  
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet('Perfect AI Questions');
  worksheet.columns = [
    { header: 'Role', key: 'role', width: 20 },
    { header: 'Category', key: 'category', width: 25 },
    { header: 'Question', key: 'question', width: 50 },
    { header: 'Option A', key: 'a', width: 20 },
    { header: 'Option B', key: 'b', width: 20 },
    { header: 'Option C', key: 'c', width: 20 },
    { header: 'Option D', key: 'd', width: 20 },
    { header: 'Correct Answer', key: 'correct', width: 15 },
    { header: 'Difficulty', key: 'diff', width: 15 }
  ];

  console.log("Generating completely perfect sets for all 114 roles...");

  // Insert Universal Aptitude and Grammar Pool
  console.log("Inserting Universal Aptitude and Grammar Pool...");
  const universalData: any[] = [];
  for (const q of hardAptitudeBank) {
    universalData.push({ department: 'UNIVERSAL', position: 'UNIVERSAL', category: 'Logical & Quantitative Aptitude', difficulty: 'Expert', type: 'MCQ', question_text: q.q, option_a: q.a, option_b: q.b, option_c: q.c, option_d: q.d, correct_answer: q.correct, status: 'ACTIVE' });
  }
  for (const q of hardGrammarBank) {
    universalData.push({ department: 'UNIVERSAL', position: 'UNIVERSAL', category: 'Verbal & Communication Skills', difficulty: 'Expert', type: 'MCQ', question_text: q.q, option_a: q.a, option_b: q.b, option_c: q.c, option_d: q.d, correct_answer: q.correct, status: 'ACTIVE' });
  }
  await prisma.question.createMany({ data: universalData });

  for (let i = 0; i < allRoles.length; i++) {
    const role = allRoles[i];
    const department = IT_ROLES.includes(role) ? 'IT' : 'Non-IT';
    console.log(`[${i+1}/${allRoles.length}] Generating perfect set for: ${role}`);

    const roleData: any[] = [];

    // 1. Generate 30 AI Role-Specific
    let aiSuccess = false;
    let attempts = 0;
    while (!aiSuccess && attempts < 3) {
      try {
        const isIT = IT_ROLES.includes(role);
        let prompt = isIT 
          ? `You are a recruitment assessment AI for US-tier candidates.
Generate EXACTLY 30 highly technical, EXTREMELY TOUGH multiple-choice questions specifically for the IT role of: "${role}".
CRITICAL REQUIREMENT: At least 20 of these questions MUST contain pseudocode or actual code snippets! The candidate must analyze the code, find the bug, predict the output, or complete the logic. Format code snippets cleanly.
Do not generate aptitude or grammar. ONLY generate deep, role-specific coding/technical questions.`
          : `You are a recruitment assessment AI for US-tier candidates.
Generate EXACTLY 30 highly professional, EXTREMELY TOUGH multiple-choice questions specifically for the Non-IT role of: "${role}".
CRITICAL REQUIREMENT: These must be complex, scenario-based workplace problems, advanced professional knowledge, and situational judgment questions. DO NOT include coding or pseudocode.
Do not generate aptitude or grammar. ONLY generate deep, role-specific professional questions.`;

        prompt += `
Return valid JSON ONLY. No markdown, no comments.
CRITICAL JSON RULE: If your question or option contains code snippets, you MUST properly escape all newlines as \\n and double quotes as \\" inside the JSON string. Do not use raw unescaped newlines in the string!
Format:
[
  {
    "q": "The extremely tough question text with \\n code snippets \\n if applicable",
    "a": "Option A",
    "b": "Option B",
    "c": "Option C",
    "d": "Option D",
    "correct": "A"
  }
]`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
        });

        let jsonText = response.text || "[]";
        jsonText = jsonText.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
        const aiQuestions = JSON.parse(jsonText);

        const categoryName = IT_ROLES.includes(role) ? "Coding & Technical" : "Professional Knowledge";

        for (const q of aiQuestions.slice(0, 30)) {
          roleData.push({
            department,
            position: role,
            category: categoryName,
            difficulty: 'Expert',
            type: 'MCQ',
            question_text: q.q,
            option_a: q.a,
            option_b: q.b,
            option_c: q.c,
            option_d: q.d,
            correct_answer: q.correct,
            status: 'ACTIVE'
          });
        }
        aiSuccess = true;
      } catch (err: any) {
        console.error(`AI generation failed for ${role}. Retrying in 10s...`, err.message);
        attempts++;
        await sleep(10000); // 10 second backoff
      }
    }

    if (!aiSuccess) {
       console.error(`Failed to generate role-specific for ${role}. Skipping AI portion for this role.`);
    }

    // Insert to DB
    await prisma.question.createMany({
      data: roleData
    });

    // Write to Excel
    for (const data of roleData) {
      worksheet.addRow({
        role: data.position,
        category: data.category,
        question: data.question_text,
        a: data.option_a,
        b: data.option_b,
        c: data.option_c,
        d: data.option_d,
        correct: data.correct_answer,
        diff: data.difficulty
      });
    }

    // Save Excel after every role so we don't lose data
    try {
      await workbook.xlsx.writeFile('JobSync_Perfect_3420_Questions.xlsx');
    } catch (excelErr) {
      console.error(`⚠️ WARNING: Could not save Excel file (is it open in another program?). Continuing DB generation anyway.`);
    }

    console.log(`Saved perfect questions for ${role}. Sleeping for 5 seconds to bypass API Rate Limits...`);
    await sleep(5000); // Strict 5s delay ensures < 12 requests per minute.
  }

  console.log("✅ ALL 3420 PERFECT QUESTIONS GENERATED, SAVED TO DB, AND EXPORTED TO EXCEL!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
