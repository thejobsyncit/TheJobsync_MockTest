import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

if (!process.env.GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is missing in .env file');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const position = process.argv[2];

if (!position) {
  console.error('Usage: npm run generate-questions "Java Developer"');
  process.exit(1);
}

const SYSTEM_PROMPT = `
JOBSYNC – ROLE-BASED HARD MCQ QUESTION GENERATOR

You are an advanced recruitment assessment question generator for The JobSync.
Generate exactly 30 hard-level multiple-choice questions (MCQs) based strictly on the candidate’s selected Job Position / Role: "${position}".

1. CORE RULE
The selected role is the primary source for question generation.
Every question MUST be directly relevant to the selected role.
DO NOT generate generic questions that could apply to every job.
DO NOT ask questions unrelated to the selected position.
Questions must test Technical knowledge, Practical problem solving, Role-specific concepts, Real-world workplace scenarios, Decision making, Troubleshooting, Advanced concepts, Analytical thinking.
Difficulty: 20% Medium-Hard, 60% Hard, 20% Very Hard. Avoid extremely obvious questions.

2. QUESTION STRUCTURE
Generate exactly 30 Questions.
Each question must have exactly ONE correct answer.
Do not use "All of the above" or "None of the above".
Randomize the correct answer position among A, B, C and D.

3. RANDOMIZATION
Randomize Question concepts, Question wording, Scenarios, Numerical values, Code snippets, Options, Correct-answer position, Question order.
Do not repeat the same concept more than necessary.

4. IT ROLE QUESTION RULES
For IT roles, questions MUST be technical and role-specific. If the role involves programming, include code-based MCQs in the appropriate language (e.g. Java code for Java Developer).

5. NON-IT ROLE RULES
For Non-IT roles, DO NOT generate programming questions unless programming is explicitly part of the selected role. Questions must be based on the actual responsibilities of that position.

6. CODE-BASED QUESTION RULE
For technical programming positions, at least 10 out of 30 questions must contain actual code.

7. SCENARIO-BASED QUESTIONS
At least 8 questions should be practical workplace scenarios.

8. OUTPUT JSON
Return ONLY valid JSON, with NO Markdown wrappers like \`\`\`json.
IMPORTANT: Ensure your output is STRICTLY valid JSON. Do NOT include any literal newline characters inside your string values. Use a single space instead of newlines for long explanations.
Format:
{
  "role": "${position}",
  "test_duration_minutes": 25,
  "total_questions": 30,
  "questions": [
    {
      "question": "Question text",
      "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      "correct_answer": "B",
      "explanation": "Short explanation",
      "category": "Topic Name (e.g. Java Core)",
      "difficulty": "Hard"
    }
  ]
}
`;

async function main() {
  console.log(`Generating 30 questions for ${position}... This might take a minute.`);
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: SYSTEM_PROMPT,
      config: {
         responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '';
    
    // Clean up potential markdown wrappers and literal newlines that break JSON.parse
    let cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    cleanedText = cleanedText.replace(/\n/g, ' '); // Replace all newlines with space to prevent parsing errors
    // Since we replaced all newlines, the JSON is now on one line, which is perfectly valid for JSON.parse
    
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse JSON response from Gemini. Raw response:");
      console.error(responseText);
      process.exit(1);
    }

    const questions = parsedData.questions;

    if (!Array.isArray(questions) || questions.length === 0) {
      console.error("Invalid response format: 'questions' array is missing or empty.");
      process.exit(1);
    }

    console.log(`Successfully generated ${questions.length} questions. Inserting into Database...`);

    const dataToInsert = questions.map((q: any) => {
      // Determine department generically if needed, defaulting to IT for now 
      // or derive from a map if non-IT
      const department = "IT"; // Usually determined by Admin, but setting default

      return {
        department: department,
        position: position,
        category: q.category || 'Technical',
        difficulty: q.difficulty || 'Hard',
        type: 'MCQ',
        question_text: q.question,
        option_a: q.options.A,
        option_b: q.options.B,
        option_c: q.options.C,
        option_d: q.options.D,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        status: 'ACTIVE'
      };
    });

    const result = await prisma.question.createMany({
      data: dataToInsert,
      skipDuplicates: true
    });

    console.log(`Done! Successfully inserted ${result.count} questions for "${position}" into the database.`);
  } catch (error) {
    console.error("Error generating or inserting questions:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
