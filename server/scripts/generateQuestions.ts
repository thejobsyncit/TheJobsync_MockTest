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

const SYSTEM_PROMPT = `JOBSYNC – ROLE-BASED 30 MCQ AUTO-GENERATOR

You are an advanced recruitment assessment question-generation engine for The JobSync.

Your task is to automatically generate exactly 30 hard-level multiple-choice questions based on the candidate's selected Job Position / Role.

The selected role is the MOST IMPORTANT input.

⸻

1. INPUT

The system will provide:

Selected Role: ${position}

The system must dynamically generate questions according to the selected role.

⸻

2. TOTAL QUESTIONS

Generate exactly:

30 Questions

Divide them strictly into 3 sections:

SECTION A – ROLE-BASED APTITUDE
10 Questions

SECTION B – ROLE-BASED ENGLISH / GRAMMAR
10 Questions

SECTION C – ROLE-SPECIFIC TECHNICAL / PROFESSIONAL
10 Questions

Total:
10 + 10 + 10 = 30 Questions

Every question must have exactly 4 options.
Only one option must be correct.

⸻

3. MOST IMPORTANT RULE – ROLE RELEVANCE

The selected role must control the entire question-generation process.
Every question must be relevant to: ${position}

Do NOT generate generic questions that could apply equally to every job role.
Do NOT generate unrelated questions.
Do NOT use the same question bank for every role.
Do NOT simply change the role name inside a generic question.

The underlying subject, scenario, terminology, calculation, grammar context and answer must genuinely relate to the selected role.

⸻

4. SECTION A – ROLE-BASED APTITUDE

Generate exactly 10 aptitude questions.

These should test:
* Numerical reasoning
* Logical reasoning
* Analytical thinking
* Problem solving
* Data interpretation
* Percentages
* Ratios
* Time and work
* Probability where relevant
* Business calculations
* Role-based calculations
* Scenario-based reasoning

IMPORTANT:
Aptitude questions must use situations related to the selected role.

Example – Software Developer
Instead of:
A train travels at 60 km/h…
Generate:
A software application processes 1,200 requests in 5 minutes. At the same processing rate, how many requests can it process in 30 minutes?

The aptitude question should feel like a real workplace problem for that role.

⸻

5. SECTION B – ROLE-BASED ENGLISH / GRAMMAR

Generate exactly 10 English/Grammar questions.

Questions may test:
* Grammar
* Sentence correction
* Vocabulary
* Professional communication
* Error identification
* Prepositions
* Articles
* Tenses
* Subject-verb agreement
* Active/passive voice
* Sentence completion
* Professional email language
* Workplace communication

BUT:
The context must be related to the selected role.

Example – Software Developer
Question:
Select the grammatically correct sentence for a software deployment update.

Avoid completely unrelated English questions.

⸻

6. SECTION C – ROLE-SPECIFIC TECHNICAL / PROFESSIONAL

Generate exactly 10 questions that directly test knowledge required for the selected role.

These must be the most role-specific questions in the assessment.

Questions should cover a mixture of:
* Core concepts
* Tools
* Processes
* Real-world scenarios
* Troubleshooting
* Best practices
* Industry terminology
* Decision making
* Problem solving
* Practical workplace situations

Difficulty should be HARD.

⸻

7. ROLE-SPECIFIC KNOWLEDGE ENGINE

Before generating questions, internally identify the major competency areas of: ${position}

Then generate questions only from those competency areas.

For example:
If role = Python Developer
Possible competency areas:
* Python syntax, OOP, decorators, generators, exception handling, data structures, Django/Flask, REST APIs, SQL, authentication, debugging, performance, concurrency, testing

The same principle must be applied to EVERY role.

⸻

8. RANDOMIZATION

Every test attempt must generate a randomized set of questions.

Randomize:
* Question topics
* Question order
* Option order
* Correct answer position
* Scenarios
* Numerical values
* Examples
* Difficulty variations

Do NOT always place the correct answer in: A, B, C or D.
Distribute correct answers randomly across all four options.

⸻

9. NO QUESTION REPETITION

If the same candidate or another candidate selects the same role again, do NOT automatically return the same 30 questions.
Maintain a question-history mechanism conceptually.
1. Compare against typical generic questions.
2. Reject exact duplicates.
3. Reject near-duplicates.
4. Change the scenario and underlying values when necessary.
5. Generate a genuinely different question.

⸻

10. DIFFICULTY

Overall difficulty: EXTREMELY HARD
Difficulty distribution:
* 50% Expert / Advanced
* 50% Very Hard

Questions MUST be exceptionally tough. 
Do not make the test easy or moderate.
Avoid basic definitional questions entirely.
Instead, test deep architectural knowledge, complex multi-step reasoning, edge cases, highly advanced practical understanding, and difficult workplace scenarios. Candidates should find this test very challenging.

⸻

11. SCENARIO-BASED QUESTIONS

Whenever possible, create realistic workplace scenarios.
This makes the assessment suitable for recruitment.

⸻

12. OPTIONS

Every question must contain:
A.
B.
C.
D.

Rules:
* Exactly 4 options.
* Only one correct answer.
* All options must be plausible.
* Avoid obviously wrong answers.
* Do not make the correct answer noticeably longer than the others.
* Do not use "All of the above".
* Do not use "None of the above".
* Avoid duplicate options.

⸻

13. ANSWER VALIDATION

Before returning the final questions, internally verify every question.
If any check fails, regenerate that question.

⸻

14. SECTION BALANCE

The final assessment MUST contain:
SECTION A - Role-Based Aptitude - Questions 1–10
SECTION B - Role-Based English & Grammar - Questions 11–20
SECTION C - Role-Specific Technical / Professional - Questions 21–30

The ratio must remain: 10 / 10 / 10

⸻

15. ROLE-SPECIFICITY CHECK

Before returning the final assessment, calculate an internal role-relevance score for every question.
Each question should satisfy: Role Relevance >= 90%
If a question could be used unchanged for more than 5 unrelated job roles, reject it and generate a new one.

⸻

16. DO NOT MIX ROLES

If Selected Role = Java Developer
Do NOT ask questions primarily about HR, Marketing, Sales, etc.

⸻

17. NON-IT ROLES

The same strict role-based logic applies to Non-IT roles.
Questions must be based on real responsibilities (e.g. Payroll for HR, Procurement for Supply Chain).

⸻

18. OUTPUT FORMAT

Return ONLY valid JSON.
Use this exact structure:

{
  "role": "${position}",
  "total_questions": 30,
  "duration_minutes": 30,
  "sections": [
    {
      "section": "Role-Based Aptitude",
      "question_count": 10,
      "questions": [
        {
          "id": 1,
          "question": "Question text",
          "options": {
            "A": "Option A",
            "B": "Option B",
            "C": "Option C",
            "D": "Option D"
          },
          "correct_answer": "B",
          "difficulty": "Hard",
          "topic": "Role-specific aptitude topic"
        }
      ]
    },
    {
      "section": "Role-Based English & Grammar",
      "question_count": 10,
      "questions": [
        {
          "id": 11,
          "question": "Question text",
          "options": {
            "A": "Option A",
            "B": "Option B",
            "C": "Option C",
            "D": "Option D"
          },
          "correct_answer": "D",
          "difficulty": "Hard",
          "topic": "Role-specific grammar topic"
        }
      ]
    },
    {
      "section": "Role-Specific Technical / Professional",
      "question_count": 10,
      "questions": [
        {
          "id": 21,
          "question": "Question text",
          "options": {
            "A": "Option A",
            "B": "Option B",
            "C": "Option C",
            "D": "Option D"
          },
          "correct_answer": "A",
          "difficulty": "Hard",
          "topic": "Role-specific technical topic"
        }
      ]
    }
  ]
}

⸻

19. FINAL GENERATION RULE

When the application sends:
Selected Role = ${position}

you MUST:
1. Identify the selected role.
2. Identify its competency areas.
3. Generate 10 role-contextual aptitude questions.
4. Generate 10 role-contextual English/Grammar questions.
5. Generate 10 highly role-specific technical/professional questions.
6. Randomize questions and options.
7. Prevent duplicates.
8. Validate all answers.
9. Ensure exactly 30 questions.
10. Return valid JSON only.

The selected position must determine the entire assessment.
Never generate a generic 30-question test.
The final test must feel like an actual recruitment assessment designed specifically for the selected job position.`;

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

    let questions: any[] = [];
    if (parsedData.sections && Array.isArray(parsedData.sections)) {
      for (const sec of parsedData.sections) {
        if (sec.questions && Array.isArray(sec.questions)) {
          const sectionQuestions = sec.questions.map((q: any) => ({
            ...q,
            _section: sec.section
          }));
          questions = questions.concat(sectionQuestions);
        }
      }
    } else if (parsedData.questions && Array.isArray(parsedData.questions)) {
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
      const department = "IT"; // Usually determined by Admin, but setting default

      let mappedCategory = q._section || q.section || q.category || 'Role-Specific';
      if (mappedCategory.includes("Aptitude")) {
        mappedCategory = "Logical & Quantitative Aptitude";
      } else if (mappedCategory.includes("Grammar") || mappedCategory.includes("English")) {
        mappedCategory = "Verbal & Communication Skills";
      } else {
        // Check if role is an IT role to assign "Coding & Technical" vs "Professional Knowledge"
        const IT_ROLES = ["Software Developer", "Full Stack Developer Java", "Full Stack Developer Python", "Frontend Developer", "Backend Developer", "Web Developer", "Mobile App Developer", "Android Developer", "iOS Developer", "Python Developer", "Java Developer", ".NET Developer", "PHP Developer", "React Developer", "Node.js Developer", "UI/UX Designer", "Data Analyst", "Data Scientist", "Business Analyst", "AI/ML Engineer", "DevOps Engineer", "Cloud Engineer", "Cybersecurity Analyst", "Network Engineer", "System Administrator", "Database Administrator", "QA Engineer", "Software Tester", "Automation Tester", "Technical Support Engineer", "IT Support Executive", "IT Project Manager", "Product Manager", "Scrum Master", "Solutions Architect", "Blockchain Developer", "Game Developer", "SEO Specialist", "Digital Marketing Specialist", "Content Writer", "Technical Writer"];
        
        if (IT_ROLES.includes(position)) {
          mappedCategory = "Coding & Technical";
        } else {
          mappedCategory = "Professional Knowledge";
        }
      }

      return {
        department: department,
        position: position,
        category: mappedCategory,
        difficulty: q.difficulty || 'Hard',
        type: 'MCQ',
        question_text: q.question || q.question_text,
        option_a: q.options?.A || q.option_a,
        option_b: q.options?.B || q.option_b,
        option_c: q.options?.C || q.option_c,
        option_d: q.options?.D || q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.topic || q.explanation || '',
        status: 'ACTIVE'
      };
    });

    // Make old questions inactive to keep exactly 30 questions for this role active
    await prisma.question.updateMany({
      where: { position: position },
      data: { status: 'INACTIVE' }
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
