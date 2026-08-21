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

const SYSTEM_PROMPT = `JOBSYNC – ROLE-BASED HARD MCQ QUESTION GENERATOR

You are an advanced recruitment assessment question generator for The JobSync.
Generate exactly 30 hard-level multiple-choice questions (MCQs) based strictly on the candidate’s selected Job Position / Role: "${position}".

1. DISTRIBUTION RULE (STRICTLY 30 QUESTIONS TOTAL)
Generate EXACTLY 30 questions divided into three strict categories:
- Exactly 10 questions for "Aptitude & Logical Reasoning"
- Exactly 10 questions for "Grammar & Verbal Ability"
- Exactly 10 questions for "Coding & Technical" (for IT roles) OR "Core Domain Knowledge" (for Non-IT roles).

2. CORE DOMAIN / TECHNICAL RULE (10 Questions)
- For IT Developer roles (e.g. Java, Python, React, Full Stack, Android, etc.): You MUST generate 10 medium-to-hard level technical questions. At least 5 of them must contain actual CODE SNIPPETS (predict output, find bug, time complexity, etc.) relevant to the exact language/framework in the role title.
- For Non-IT roles (e.g. HR, Sales, Finance, Civil): Generate 10 medium-to-hard level domain-specific scenario questions based on their real-world responsibilities. DO NOT ask programming questions for Non-IT.

3. APTITUDE & REASONING RULE (10 Questions)
- Generate 10 medium-to-tough Quantitative Aptitude and Logical Reasoning questions (e.g. time & work, probability, puzzles, data interpretation).
- Where possible, frame the word problems using scenarios related to the candidate's industry (e.g. for a developer: "A team of 5 devs takes 10 days...").

4. GRAMMAR & VERBAL RULE (10 Questions)
- Generate 10 medium-to-tough English Grammar, Vocabulary, and Verbal Reasoning questions (e.g. error spotting, synonyms, reading comprehension snippets, advanced sentence correction).

5. RANDOMIZATION & SHUFFLING
Every time this prompt is run, generate entirely DIFFERENT questions. DO NOT reuse the same numbers in aptitude or the same code snippets. Ensure options are randomized so the correct answer isn't always the same letter.

6. QUESTION STRUCTURE
Each question must have: Question text, Option A, Option B, Option C, Option D, Correct Answer, Short Explanation, Difficulty (Medium or Hard), Category (Aptitude, Grammar, or Technical), and Role.
DO NOT use "All of the above" or "None of the above".

7. OUTPUT FORMAT
Return ONLY valid JSON.
Format:
{
  "role": "${position}",
  "test_duration_minutes": 30,
  "total_questions": 30,
  "questions": [
    {
      "question_id": 1,
      "question": "Question text",
      "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      "correct_answer": "B",
      "explanation": "Short explanation",
      "category": "Specific Category",
      "difficulty": "Hard",
      "role": "${position}",
      "question_type": "Technical"
    }
  ]
}

Return only the raw JSON, without any markdown formatting.`;

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
    
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse JSON response from Gemini. Raw response:");
      console.error(responseText);
      process.exit(1);
    }

    let questions = [];
    if (parsedData.questions && Array.isArray(parsedData.questions)) {
      questions = parsedData.questions;
    } else if (Array.isArray(parsedData)) {
      questions = parsedData;
    }

    if (questions.length === 0) {
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
        question_text: q.question || q.question_text,
        option_a: q.options?.A || q.option_a,
        option_b: q.options?.B || q.option_b,
        option_c: q.options?.C || q.option_c,
        option_d: q.options?.D || q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.explanation || '',
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
