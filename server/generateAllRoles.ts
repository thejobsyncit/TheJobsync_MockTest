import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';
import { IT_ROLES, NON_IT_ROLES, GENERAL_ROLES } from '../client/src/data';

const prisma = new PrismaClient();
const ALL_ROLES = [...IT_ROLES, ...NON_IT_ROLES, ...GENERAL_ROLES];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  console.log(`Found ${ALL_ROLES.length} total roles to process.`);
  
  if (!process.env.GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY");
    process.exit(1);
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  for (let i = 0; i < ALL_ROLES.length; i++) {
    const position = ALL_ROLES[i];
    
    // Skip Frontend Developer since we manually perfected it already
    if (position === "Frontend Developer") {
      console.log(`[${i+1}/${ALL_ROLES.length}] Skipping ${position}: Manually perfected.`);
      continue;
    }

    let department = "General";
    if (IT_ROLES.includes(position)) department = "Information Technology";
    if (NON_IT_ROLES.includes(position)) department = "Business and Administration";
    
    // Check if it already has HIGH QUALITY new questions (we will mark our new ones as Hard)
    const existingHard = await prisma.question.count({
      where: { position, status: 'ACTIVE', difficulty: 'Hard' }
    });
    
    // Wait, the generic ones might be medium. Wait, earlier some generic ones were 'Medium' (like HR Manager had all Medium).
    // Let's assume if there are >= 25 Hard questions, it's already generated.
    if (existingHard >= 25) {
      console.log(`[${i+1}/${ALL_ROLES.length}] Skipping ${position}: already has ${existingHard} Hard questions.`);
      continue;
    }
    
    console.log(`[${i+1}/${ALL_ROLES.length}] Generating 30 Hard questions for ${position}...`);
    
    const prompt = `JOBSYNC – ROLE-BASED EXTREMELY TOUGH MCQ QUESTION GENERATOR

You are an advanced recruitment assessment question generator for The JobSync.
Generate exactly 30 EXTREMELY HARD AND ADVANCED level multiple-choice questions (MCQs) based strictly on the candidate’s selected Job Position / Role: "${position}" in "${department}" department.

1. DISTRIBUTION RULE (STRICTLY 30 QUESTIONS TOTAL)
Generate EXACTLY 30 questions divided into three strict categories:
- Exactly 10 questions for "Aptitude & Logical Reasoning" (Tailor the word problems to ${position} scenarios if possible).
- Exactly 10 questions for "Grammar & Verbal Ability" (Use advanced vocabulary relevant to the professional workplace).
- Exactly 10 questions for "Coding & Technical" (for IT roles) OR "Core Domain Knowledge" (for Non-IT roles). These must test DEEP expertise in ${position}.

2. DIFFICULTY LEVEL (EXTREMELY HARD)
- The questions must be AT THE HARDEST POSSIBLE LEVEL.
- For IT Developer roles: At least 8 technical questions must contain complex CODE SNIPPETS.
- For Non-IT Roles: Provide highly situational, analytical, and domain-expert level questions.

3. REQUIRED JSON SCHEMA (NO DEVIATION)
Each question MUST follow this EXACT structure:
- "question_id": Number (1 to 30)
- "category": String (Must be one of the three category names above)
- "type": "MCQ"
- "difficulty": "Hard"
- "question": String (The question text. IF IT IS A CODE SNIPPET, USE \n for newlines).
- "options": Object with EXACTLY 4 keys: "A", "B", "C", "D" (String values)
- "correct_answer": String (Must be exactly "A", "B", "C", or "D")
- "explanation": String (Detailed explanation of why the answer is correct)

4. NO DUPLICATES
Ensure no two questions are identical or too similar.

5. OUTPUT FORMAT
Return ONLY valid raw JSON text. Do not use markdown blocks like \`\`\`json.
{
  "questions": [
    {
      "question_id": 1,
      "category": "Aptitude & Logical Reasoning",
      "type": "MCQ",
      "difficulty": "Hard",
      "question": "...",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correct_answer": "A",
      "explanation": "..."
    }
  ]
}
`;

    let success = false;
    let attempts = 0;
    
    while (!success && attempts < 5) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
        
        let text = response.text || "{}";
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        let generatedQuestions: any[] = [];
        try {
          const parsed = JSON.parse(text);
          if (parsed.questions && Array.isArray(parsed.questions)) {
            generatedQuestions = parsed.questions;
          } else if (Array.isArray(parsed)) {
            generatedQuestions = parsed;
          }
        } catch (e) {
           console.warn("JSON parsing failed, trying fallback regex...");
           const regex = /{[\s\S]*?"question"[\s\S]*?"options"[\s\S]*?}/g;
           const matches = text.match(regex);
           if (matches) {
             matches.forEach(m => {
               try { 
                 let cleanM = m;
                 if (!cleanM.endsWith("}")) cleanM += "}";
                 generatedQuestions.push(JSON.parse(cleanM)); 
               } catch(err){}
             });
           }
        }

        if (generatedQuestions.length >= 25) {
          // Archive old generic questions for this role BEFORE inserting new ones
          await prisma.question.updateMany({
            where: { position, status: 'ACTIVE' },
            data: { status: 'ARCHIVED' }
          });
          
          const dataToInsert = generatedQuestions.map((q: any) => ({
            department,
            position,
            category: q.category || "Technical",
            difficulty: "Hard",
            type: "MCQ",
            question_text: q.question,
            option_a: q.options?.A || "N/A",
            option_b: q.options?.B || "N/A",
            option_c: q.options?.C || "N/A",
            option_d: q.options?.D || "N/A",
            correct_answer: q.correct_answer || "A",
            explanation: q.explanation || "No explanation provided",
            status: 'ACTIVE'
          }));
          
          await prisma.question.createMany({ data: dataToInsert });
          console.log(`Inserted ${dataToInsert.length} perfect questions for ${position}.`);
          success = true;
        } else {
          console.log(`Failed to parse enough questions for ${position}. Retrying...`);
          attempts++;
          await delay(12000); // 12 seconds delay on failure
        }

      } catch (err: any) {
        if (err?.status === 429 || err?.message?.includes('429')) {
          console.log(`Rate limit hit (429) for ${position}. Waiting 60 seconds before retry...`);
          await delay(60000); // 1 minute delay for rate limit
        } else {
          console.error(`Error generating for ${position}:`, err?.message || err);
          attempts++;
          await delay(12000);
        }
      }
    }
    
    // Strict 12 seconds delay between roles to ensure ~5 RPM
    await delay(12000);
  }
  
  console.log("Finished generating all perfect position-specific questions!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
