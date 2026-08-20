import { execSync } from 'child_process';

const roles = [
  "Software Developer",
  "Full Stack Developer",
  "Front-End Developer",
  "Back-End Developer",
  "Java Developer",
  "Java Full Stack Developer",
  "Python Developer",
  "Django Developer",
  "PHP Developer",
  "WordPress Developer",
  "Android Developer",
  "iOS Developer",
  "Flutter Developer",
  "React Native Developer",
  "QA Tester",
  "Automation Tester",
  "Cloud Engineer",
  "AWS Engineer",
  "Azure Engineer",
  "DevOps Engineer",
  "Site Reliability Engineer",
  "Data Analyst",
  "Data Engineer",
  "Data Scientist",
  "BI Developer",
  "AI Engineer",
  "Machine Learning Engineer",
  "Generative AI Developer",
  "Cybersecurity Analyst",
  "SOC Analyst",
  "Network Engineer",
  "IT Support",
  "Application Support Engineer",
  "ERP Consultant",
  "Database Administrator",
  "SQL Developer",
  "UI Designer",
  "Product Manager",
  "Business Analyst",
  "Project Manager",
  "Scrum Master",
  "IT Sales",
  "Technical Writer",
  "Logistics",
  "Manufacturing",
  "Mechanical Engineer",
  "Civil Engineer",
  "HR",
  "Accounts",
  "Sales",
  "Banking",
  "Healthcare",
  "Retail",
  "Hospitality",
  "BPO",
  "Legal",
  "Operations"
];

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateAll() {
  console.log(`Starting bulk generation for ${roles.length} roles...`);
  
  for (let i = 0; i < roles.length; i++) {
    const role = roles[i];
    console.log(`\n[${i + 1}/${roles.length}] Generating for: ${role}`);
    try {
      // Execute the generateQuestions script synchronously
      execSync(`npx tsx scripts/generateQuestions.ts "${role}"`, { stdio: 'inherit' });
      
      console.log(`Waiting 10 seconds to respect API rate limits...`);
      await sleep(10000); // 10 second delay between requests
    } catch (error) {
      console.error(`\nFailed to generate questions for ${role}. Skipping to next...`);
      console.log(`Waiting 10 seconds before retrying next role...`);
      await sleep(10000);
    }
  }
  
  console.log("\nFinished generating questions for all roles!");
}

generateAll();
