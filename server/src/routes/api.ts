// @ts-nocheck
import { Router, Request, Response } from 'express';
import exceljs from 'exceljs';
import { GoogleGenAI } from '@google/genai';
import prisma from '../db';

const router = Router();

// Cache questions in memory to prevent DB overload during concurrent logins
const questionsCache = new Map<string, any[]>();
const CACHE_EXPIRY_MS = 1000 * 60 * 60; // 1 hour

// Fetch 30 unique, position-specific MCQ questions based on assigned set
const fetchPositionQuestions = async (position: string, department: string, setNumber: number): Promise<any[]> => {
  const cacheKey = `${position}-${department}-${setNumber}`;
  
  if (questionsCache.has(cacheKey)) {
    return questionsCache.get(cacheKey)!;
  }

  const positionAliases: Record<string, string[]> = {
    'AI/ML Engineer': ['AI/ML Engineer', 'AIML Engineer'],
    'AIML Engineer': ['AIML Engineer', 'AI/ML Engineer'],
    'UI/UX Designer': ['UI/UX Designer', 'UIUX Designer'],
    'UIUX Designer': ['UIUX Designer', 'UI/UX Designer'],
  };

  const allowedPositions = positionAliases[position] || [position];

  const selected = await prisma.question.findMany({
    where: { 
      position: { in: allowedPositions },
      status: 'ACTIVE',
      type: 'MCQ',
      set_number: setNumber
    }
  });

  // Group them by category so they appear in order in the UI
  const sorted = selected.sort((a, b) => {
    const getOrder = (cat: string) => {
      if (cat.includes('Aptitude')) return 1;
      if (cat.includes('Verbal') || cat.includes('Grammar')) return 2;
      return 3;
    };
    
    const orderA = getOrder(a.category);
    const orderB = getOrder(b.category);
    
    if (orderA !== orderB) return orderA - orderB;
    // Fallback alphabetical if same primary order
    if (a.category < b.category) return -1;
    if (a.category > b.category) return 1;
    return 0;
  });
  
  // Set to cache
  questionsCache.set(cacheKey, sorted);
  
  // Auto-clear cache after expiry
  setTimeout(() => {
    questionsCache.delete(cacheKey);
  }, CACHE_EXPIRY_MS);
  
  return sorted;
};


// ===============================
// SYSTEM SETTINGS ENDPOINTS
// ===============================

router.get('/settings/test-active', async (req: Request, res: Response) => {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'TEST_ACTIVE' } });
    res.json({ test_active: setting ? setting.value === 'true' : true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.post('/settings/test-active', async (req: Request, res: Response) => {
  try {
    const { test_active } = req.body;
    await prisma.systemSetting.upsert({
      where: { key: 'TEST_ACTIVE' },
      update: { value: String(test_active) },
      create: { key: 'TEST_ACTIVE', value: String(test_active) }
    });
    res.json({ success: true, test_active });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

router.get('/settings/add-enabled', async (req: Request, res: Response) => {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'ADD_ENABLED' } });
    // Default to true if not set
    res.json({ add_enabled: setting ? setting.value === 'true' : true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.post('/settings/add-enabled', async (req: Request, res: Response) => {
  try {
    const { add_enabled } = req.body;
    await prisma.systemSetting.upsert({
      where: { key: 'ADD_ENABLED' },
      update: { value: String(add_enabled) },
      create: { id: 2, key: 'ADD_ENABLED', value: String(add_enabled) }
    });
    res.json({ success: true, add_enabled });
  } catch (error) {
    console.error('Error updating ADD_ENABLED:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ===============================
// COLLEGE ENDPOINTS
// ===============================

// Create College
router.post('/colleges', async (req: Request, res: Response) => {
  try {
    const { college_name, college_code, location, contact_person, contact_email, contact_phone } = req.body;
    if (!college_name) return res.status(400).json({ error: 'College Name is required' });

    // Generate a unique ID that won't collide easily
    const generatedId = `COL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newCollege = await prisma.college.create({
      data: {
        college_id: generatedId,
        college_name,
        college_code,
        location,
        contact_person,
        contact_email,
        contact_phone
      }
    });
    res.json(newCollege);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Simple Colleges List (For Dropdown, no heavy joins)
router.get('/colleges/simple', async (req: Request, res: Response) => {
  try {
    const colleges = await prisma.college.findMany({
      select: { college_id: true, college_name: true },
      orderBy: { college_name: 'asc' }
    });
    res.json(colleges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get All Colleges with Statistics
router.get('/colleges', async (req: Request, res: Response) => {
  try {
    const colleges = await prisma.college.findMany({
      include: {
        candidates: true,
        assessments: true
      },
      orderBy: { created_at: 'desc' }
    });

    const stats = colleges.map(col => {
      const candidatesCount = col.candidates.length;
      const testsCount = col.assessments.length;
      const completed = col.assessments.filter(a => a.status === 'COMPLETED').length;
      const pending = col.assessments.filter(a => a.status !== 'COMPLETED').length;
      const passed = col.assessments.filter(a => a.result === 'Passed').length;
      const failed = col.assessments.filter(a => a.result === 'Failed').length;
      return {
        ...col,
        candidatesCount,
        testsCount,
        completed,
        pending,
        passed,
        failed,
        candidates: undefined,
        assessments: undefined
      };
    });
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete College
router.delete('/colleges/:collegeId', async (req: Request, res: Response) => {
  try {
    const { collegeId } = req.params;
    
    await prisma.$transaction([
      prisma.candidateAnswer.deleteMany({
        where: { assessment: { college_id: collegeId } }
      }),
      prisma.assessment.deleteMany({
        where: { college_id: collegeId }
      }),
      prisma.candidate.deleteMany({
        where: { college_id: collegeId }
      }),
      prisma.college.delete({
        where: { college_id: collegeId }
      })
    ]);
    
    res.json({ success: true, message: 'College deleted successfully' });
  } catch (error) {
    console.error('Error deleting college:', error);
    res.status(500).json({ error: 'Failed to delete college' });
  }
});

// Update College
router.put('/colleges/:collegeId', async (req: Request, res: Response) => {
  try {
    const { collegeId } = req.params;
    const { college_name, college_code, location, contact_person, contact_email, contact_phone, active_batch, active_date } = req.body;
    
    if (!college_name) return res.status(400).json({ error: 'College Name is required' });

    const updatedCollege = await prisma.college.update({
      where: { college_id: collegeId },
      data: {
        college_name,
        college_code,
        location,
        contact_person,
        contact_email,
        contact_phone,
        active_batch,
        active_date
      }
    });
    
    res.json(updatedCollege);
  } catch (error) {
    console.error('Error updating college:', error);
    res.status(500).json({ error: 'Failed to update college' });
  }
});

// Get Single College Detail
router.get('/colleges/:collegeId', async (req: Request, res: Response) => {
  try {
    const { collegeId } = req.params;
    const college = await prisma.college.findUnique({
      where: { college_id: collegeId },
      include: {
        candidates: {
          include: { assessment: true }
        },
        assessments: true
      }
    });

    if (!college) return res.status(404).json({ error: 'College not found' });
    
    const candidatesCount = college.candidates.length;
    const testsCount = college.assessments.length;
    const completed = college.assessments.filter(a => a.status === 'COMPLETED').length;
    const pending = college.assessments.filter(a => a.status !== 'COMPLETED').length;
    const passed = college.assessments.filter(a => a.result === 'Passed').length;
    const failed = college.assessments.filter(a => a.result === 'Failed').length;

    res.json({
      ...college,
      stats: {
        candidatesCount,
        testsCount,
        completed,
        pending,
        passed,
        failed
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===============================
// CANDIDATE ENDPOINTS
// ===============================

// Delete Candidate
router.delete('/admin/candidates/:candidateId', async (req: Request, res: Response) => {
  try {
    const { candidateId } = req.params;
    
    await prisma.$transaction([
      prisma.candidateAnswer.deleteMany({
        where: { assessment: { candidate_id: candidateId } }
      }),
      prisma.assessment.deleteMany({
        where: { candidate_id: candidateId }
      }),
      prisma.candidate.delete({
        where: { candidate_id: candidateId }
      })
    ]);
    
    res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

// 1. Register or Resume Test
router.post('/candidates/register', async (req: Request, res: Response) => {
  const { full_name, email, phone, department, position, degree, college_id } = req.body;
  if (!full_name || !email || !phone || !department || !position || !college_id) {
    return res.status(400).json({ error: 'All fields except degree are required, including college.' });
  }

  const normalized_email = email.toLowerCase().trim();
  const normalized_phone = phone.replace(/\D/g, '');

  try {
    const testActiveSetting = await prisma.systemSetting.findUnique({ where: { key: 'TEST_ACTIVE' } });
    if (testActiveSetting && testActiveSetting.value === 'false') {
      return res.status(403).json({ 
        error: 'TEST_INACTIVE', 
        message: 'The test is currently disabled by the administrator.' 
      });
    }
    let candidate = await prisma.candidate.findFirst({
      where: {
        OR: [
          { normalized_email },
          { normalized_phone }
        ]
      },
      include: { assessment: true }
    });

    if (candidate) {
      return res.status(403).json({ 
        error: 'TEST ALREADY COMPLETED', 
        message: 'You have already attempted this test. Only one attempt is allowed per email address and phone number.' 
      });
    }

    const college = await prisma.college.findUnique({
      where: { college_id }
    });
    const active_batch = college?.active_batch || "Batch 1";
    const active_date = college?.active_date || new Date().toISOString().split('T')[0];

    // Concurrency safe candidate creation
    const tempId = `TEMP-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    candidate = await prisma.candidate.create({
      data: {
        candidate_id: tempId,
        full_name,
        email,
        normalized_email,
        phone,
        normalized_phone,
        department,
        position,
        degree,
        college_id,
        batch: active_batch,
        test_date: active_date
      },
      include: { assessment: true }
    });
      // Update to correct sequential ID safely
      const newCandidateId = `JS-TEST-${String(candidate.id).padStart(5, '0')}`;
      candidate = await prisma.candidate.update({
        where: { id: candidate.id },
        data: { candidate_id: newCandidateId },
        include: { assessment: true }
      });

    if (!candidate.assessment) {
      const count = await prisma.assessment.count({
        where: { position }
      });
      const setNumber = (count % 4) + 1;

      let allQuestions = await fetchPositionQuestions(position, department, setNumber);
      if (allQuestions.length === 0) {
        return res.status(400).json({ error: `No questions available for this role in Set ${setNumber}.` });
      }

      // Do not globally shuffle the 30 questions, so sections remain sequential (1-10, 11-20, 21-30).

      const assessment = await prisma.assessment.create({
        data: {
          candidate_id: candidate.candidate_id,
          college_id: candidate.college_id,
          department,
          position,
          total_questions: allQuestions.length,
          status: 'IN_PROGRESS',
          start_time: new Date(),
          assigned_set: setNumber
        }
      });

      const frontendKeys = ['A', 'B', 'C', 'D'];

      await prisma.candidateAnswer.createMany({
        data: allQuestions.map(q => {
          // Shuffle options
          const mapping = ['A', 'B', 'C', 'D'].sort(() => Math.random() - 0.5);
          
          // Original correct answer was q.correct_answer (e.g. 'C')
          // What is its new index in the mapping?
          const correctIdx = mapping.indexOf(q.correct_answer);
          const newCorrectAnswer = frontendKeys[correctIdx];

          return {
            assessment_id: assessment.assessment_id,
            question_id: q.question_id,
            correct_answer: newCorrectAnswer,
            shuffled_options: JSON.stringify(mapping)
          };
        })
      });

      return res.json({ candidate, assessment });
    }

    if (candidate.assessment.status === 'NOT_STARTED') {
      await prisma.assessment.update({
        where: { assessment_id: candidate.assessment.assessment_id },
        data: { status: 'IN_PROGRESS', start_time: new Date() }
      });
    }

    res.json({ candidate, assessment: candidate.assessment });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 2. Get Assessment State
router.get('/assessments/:candidateId', async (req: Request, res: Response) => {
  const { candidateId } = req.params;
  const assessment = await prisma.assessment.findUnique({
    where: { candidate_id: candidateId },
    include: {
      answers: { 
        include: { question: true },
        orderBy: { answer_id: 'asc' }
      },
      candidate: true
    }
  });

  if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

  let timeRemaining = 25 * 60;
  if (assessment.start_time && assessment.status === 'IN_PROGRESS') {
    const elapsed = Math.floor((Date.now() - assessment.start_time.getTime()) / 1000);
    timeRemaining = Math.max(0, 25 * 60 - elapsed);
  }

  const safeAnswers = assessment.answers.map(a => {
    let mapping = ['A', 'B', 'C', 'D'];
    if (a.shuffled_options) mapping = JSON.parse(a.shuffled_options);

    const orig: any = {
      A: a.question.option_a,
      B: a.question.option_b,
      C: a.question.option_c,
      D: a.question.option_d,
    };

    return {
      answer_id: a.answer_id,
      question_id: a.question_id,
      selected_answer: a.selected_answer,
      question: {
        question_id: a.question.question_id,
        category: a.question.category,
        type: a.question.type,
        question_text: a.question.question_text,
        option_a: orig[mapping[0]],
        option_b: orig[mapping[1]],
        option_c: orig[mapping[2]],
        option_d: orig[mapping[3]],
      }
    };
  });

  res.json({
    assessment: { ...assessment, answers: undefined },
    questions: safeAnswers,
    timeRemaining
  });
});

// 3. Auto-save Answer
router.patch('/assessments/:assessmentId/answer', async (req: Request, res: Response) => {
  const { assessmentId } = req.params;
  const { answer_id, selected_answer } = req.body;

  try {
    const affectedRows = await prisma.$executeRaw`
      UPDATE "CandidateAnswer"
      SET "selected_answer" = ${selected_answer},
          "answered_at" = NOW(),
          "is_correct" = ("correct_answer" = ${selected_answer})
      WHERE "answer_id" = ${Number(answer_id)} AND "assessment_id" = ${Number(assessmentId)}
    `;

    if (affectedRows === 0) {
      return res.status(400).json({ error: 'Invalid answer reference' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error in auto-save answer:', error);
    res.status(500).json({ error: 'Failed to auto-save answer' });
  }
});

// 4. Submit Assessment
router.post('/assessments/:assessmentId/submit', async (req: Request, res: Response) => {
  const { assessmentId } = req.params;
  const { forcedStatus } = req.body || {};

  const assessment = await prisma.assessment.findUnique({
    where: { assessment_id: Number(assessmentId) },
    include: { answers: { include: { question: true } } }
  });

  if (!assessment) return res.status(404).json({ error: 'Not found' });
  if (assessment.status === 'COMPLETED' || assessment.status === 'TERMINATED' || assessment.status === 'CLOSED') return res.status(400).json({ error: 'Already completed, terminated, or closed' });

  const correct_answers = assessment.answers.filter((a: any) => a.is_correct).length;
  const unanswered = assessment.answers.filter((a: any) => !a.selected_answer).length;
  const wrong_answers = assessment.total_questions - correct_answers - unanswered;
  const score = correct_answers;
  const percentage = (score / assessment.total_questions) * 100;
  
  let aptitude_score = 0;
  let grammar_score = 0;
  let coding_score = 0;

  assessment.answers.forEach((a: any) => {
    if (a.is_correct) {
      if (a.question.category === 'Aptitude') aptitude_score++;
      else if (a.question.category.includes('Grammar')) grammar_score++;
      else coding_score++; // Anything else (Coding & Technical, General Knowledge, Reasoning) goes to coding/role-based
    }
  });
  
  let duration = 30 * 60;
  if (assessment.start_time) {
    duration = Math.floor((Date.now() - assessment.start_time.getTime()) / 1000);
    if (duration > 30 * 60) duration = 30 * 60;
  }

  let pass_mark = 15;
  if (assessment.position) {
    const pos = await prisma.position.findUnique({
      where: { position_name: assessment.position }
    });
    if (pos && pos.pass_mark !== undefined) {
      pass_mark = pos.pass_mark;
    }
  }
  
  const result = score >= pass_mark ? 'Passed' : 'Failed';

  const updated = await prisma.assessment.update({
    where: { assessment_id: Number(assessmentId) },
    data: {
      status: forcedStatus || 'COMPLETED',
      completed_at: new Date(),
      end_time: new Date(),
      correct_answers,
      wrong_answers,
      unanswered,
      score,
      aptitude_score,
      grammar_score,
      coding_score,
      percentage,
      duration,
      result
    }
  });

  res.json({ assessment: updated });
});

// 5. Generate AI Feedback
router.get('/assessments/:assessmentId/feedback', async (req: Request, res: Response) => {
  const { assessmentId } = req.params;
  
  const assessment = await prisma.assessment.findUnique({
    where: { assessment_id: Number(assessmentId) },
    include: { 
      candidate: true,
      answers: { include: { question: true } }
    }
  });

  if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
  if (assessment.status !== 'COMPLETED' && assessment.status !== 'TERMINATED') return res.status(400).json({ error: 'Assessment not completed' });

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API Key is not configured on the server. Please add GEMINI_API_KEY to the .env file.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const writtenCodeQuestions = assessment.answers.filter((a: any) => a.question.type === 'CODING' && a.selected_answer);
    let codeSnippetsText = '';
    if (writtenCodeQuestions.length > 0) {
       codeSnippetsText = "\nThe candidate wrote the following code for their programming questions:\n" + 
         writtenCodeQuestions.map((a: any) => `Q: ${a.question.question_text}\nCode:\n${a.selected_answer}\n`).join("\n");
    }
    
    const prompt = `You are an expert career counselor and technical evaluator. 
A candidate named ${assessment.candidate.full_name} has just completed a mock assessment for the role of "${assessment.position}" in the "${assessment.department}" department.
Their performance is as follows:
- Score: ${assessment.score} out of ${assessment.total_questions}
- Sectional Breakdown: Aptitude: ${assessment.aptitude_score}/10, Grammar: ${assessment.grammar_score}/10, Role-Based MCQ: ${assessment.coding_score}/10
- Percentage: ${Math.round(assessment.percentage)}%
${assessment.status === 'TERMINATED' ? 'NOTE: This test was TERMINATED due to cheating violations / suspicious activity.' : ''}
${codeSnippetsText}

Please provide a concise, encouraging 3-sentence feedback on their performance. If they wrote code, briefly evaluate the logic/quality of their code in one of the sentences. Also give one actionable tip for improvement based on their overall performance. ${assessment.status === 'TERMINATED' ? 'Also gently warn them about academic integrity.' : ''} Keep it professional and direct. Do not use Markdown, just plain text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    const feedbackText = response.text || "Unable to generate feedback at this time.";
    res.json({ feedback: feedbackText });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: 'Failed to generate AI feedback.' });
  }
});

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

// 5. Candidate Feedback
router.post('/assessments/:assessmentId/candidate-feedback', async (req: Request, res: Response) => {
  const { assessmentId } = req.params;
  const { rating, feedback } = req.body;

  try {
    const updated = await prisma.assessment.update({
      where: { assessment_id: Number(assessmentId) },
      data: {
        candidate_rating: rating,
        candidate_feedback: feedback
      }
    });
    res.json({ success: true, assessment: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// 6. Admin - List Candidates
router.get('/admin/candidates', async (req: Request, res: Response) => {
  const { search, department, position, status, college_id, date_filter, custom_start, custom_end, batch, test_date } = req.query;

  const where: any = {};
  if (batch) where.batch = batch as string;
  if (test_date) where.test_date = test_date as string;
  
  if (date_filter) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date_filter === 'today') {
      where.created_at = { gte: today };
    } else if (date_filter === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      where.created_at = { gte: yesterday, lt: today };
    } else if (date_filter === 'this_week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      where.created_at = { gte: startOfWeek };
    } else if (date_filter === 'this_month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      where.created_at = { gte: startOfMonth };
    } else if (date_filter === 'custom') {
      where.created_at = {};
      if (custom_start) where.created_at.gte = new Date(custom_start as string);
      if (custom_end) where.created_at.lte = new Date(custom_end as string);
    }
  }
  
  if (search) {
    where.OR = [
      { full_name: { contains: search as string } },
      { email: { contains: search as string } },
      { candidate_id: { contains: search as string } },
      { phone: { contains: search as string } }
    ];
  }

  if (department === 'IT') {
    where.position = position ? (position as string) : { in: IT_ROLES };
  } else if (department === 'Non-IT') {
    where.position = position ? (position as string) : { in: NON_IT_ROLES };
  } else if (department === 'General') {
    where.position = position ? (position as string) : { in: GENERAL_ROLES };
  } else {
    if (department) where.department = department as string;
    if (position) where.position = position as string;
  }
  
  if (college_id) {
    where.college_id = college_id as string;
  }

  if (status || req.query.score) {
    where.assessment = {};
    if (status) where.assessment.status = status as string;
    if (req.query.score) {
      const scoreQuery = req.query.score as string;
      if (scoreQuery.startsWith('range-')) {
        const parts = scoreQuery.replace('range-', '').split('-');
        where.assessment.score = {
          gte: Number(parts[0]),
          lte: Number(parts[1])
        };
      } else {
        where.assessment.score = Number(scoreQuery);
      }
    }
  }

  const candidates = await prisma.candidate.findMany({
    where,
    include: { assessment: true, college: true },
    orderBy: { created_at: 'desc' }
  });

  res.json(candidates);
});

// 6. Admin - Candidate Detail
router.get('/admin/candidates/:id', async (req: Request, res: Response) => {
  const candidate = await prisma.candidate.findUnique({
    where: { candidate_id: req.params.id },
    include: {
      assessment: {
        include: {
          answers: {
            include: { question: true }
          }
        }
      }
    }
  });
  if (!candidate) return res.status(404).json({ error: 'Not found' });
  res.json(candidate);
});

// 7. Admin - Export Excel
router.get('/admin/export', async (req: Request, res: Response) => {
  const { department, position, status, college_id, date_filter, custom_start, custom_end, batch, test_date } = req.query;

  const where: any = {};
  if (batch) where.batch = batch as string;
  if (test_date) where.test_date = test_date as string;
  
  if (date_filter) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date_filter === 'today') {
      where.created_at = { gte: today };
    } else if (date_filter === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      where.created_at = { gte: yesterday, lt: today };
    } else if (date_filter === 'this_week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      where.created_at = { gte: startOfWeek };
    } else if (date_filter === 'this_month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      where.created_at = { gte: startOfMonth };
    } else if (date_filter === 'custom') {
      where.created_at = {};
      if (custom_start) where.created_at.gte = new Date(custom_start as string);
      if (custom_end) where.created_at.lte = new Date(custom_end as string);
    }
  }
  
  if (department === 'IT') {
    where.position = position ? (position as string) : { in: IT_ROLES };
  } else if (department === 'Non-IT') {
    where.position = position ? (position as string) : { in: NON_IT_ROLES };
  } else if (department === 'General') {
    where.position = position ? (position as string) : { in: GENERAL_ROLES };
  } else {
    if (department) where.department = department as string;
    if (position) where.position = position as string;
  }
  
  if (college_id) {
    where.college_id = college_id as string;
  }

  if (status || req.query.score) {
    where.assessment = {};
    if (status) where.assessment.status = status as string;
    if (req.query.score) {
      const scoreQuery = req.query.score as string;
      if (scoreQuery.startsWith('range-')) {
        const parts = scoreQuery.replace('range-', '').split('-');
        where.assessment.score = {
          gte: Number(parts[0]),
          lte: Number(parts[1])
        };
      } else {
        where.assessment.score = Number(scoreQuery);
      }
    }
  }

  const candidates = await prisma.candidate.findMany({
    where,
    include: { assessment: true, college: true },
    orderBy: { created_at: 'desc' }
  });

  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet('Test Candidates');

  worksheet.columns = [
    { header: 'ID', key: 'candidate_id', width: 15 },
    { header: 'College', key: 'college_name', width: 20 },
    { header: 'Name', key: 'full_name', width: 25 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Phone Number', key: 'phone', width: 15 },
    { header: 'Degree', key: 'degree', width: 20 },
    { header: 'Department', key: 'department', width: 20 },
    { header: 'Position', key: 'position', width: 20 },
    { header: 'Test Date', key: 'created_at', width: 20 },
    { header: 'Test Status', key: 'status', width: 15 },
    { header: 'Score', key: 'score', width: 10 },
    { header: 'Percentage', key: 'percentage', width: 10 },
    { header: 'Duration (s)', key: 'duration', width: 15 },
  ];

  candidates.forEach(c => {
    worksheet.addRow({
      candidate_id: c.candidate_id,
      college_name: c.college?.college_name || 'N/A',
      full_name: c.full_name,
      email: c.email,
      phone: c.phone,
      degree: c.degree,
      department: c.department,
      position: c.position,
      created_at: c.created_at.toLocaleString(),
      status: c.assessment?.status || 'NOT_STARTED',
      score: c.assessment?.score || 0,
      percentage: c.assessment?.percentage || 0,
      duration: c.assessment?.duration || 0,
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=' + 'candidates.xlsx');

  await workbook.xlsx.write(res);
  res.end();
});

// 7.5 Admin - Export All Colleges (Separate Sheets)
router.get('/admin/export-colleges', async (req: Request, res: Response) => {
  try {
    const colleges = await prisma.college.findMany({
      include: {
        candidates: {
          include: { assessment: true },
          orderBy: { created_at: 'desc' }
        }
      },
      orderBy: { college_name: 'asc' }
    });

    const workbook = new exceljs.Workbook();

    for (const college of colleges) {
      // Clean sheet name: max 31 characters, and remove characters like \ / ? * : [ ]
      let sheetName = college.college_name.replace(/[\\/?*:[\]]/g, '').trim();
      if (sheetName.length > 30) {
        sheetName = sheetName.substring(0, 30);
      }
      if (!sheetName) {
        sheetName = `COL-${college.college_id.substring(0, 10)}`;
      }

      // Ensure sheet name is unique within workbook
      let count = 1;
      let uniqueSheetName = sheetName;
      while (workbook.getWorksheet(uniqueSheetName)) {
        const suffix = ` (${count})`;
        uniqueSheetName = sheetName.substring(0, 31 - suffix.length) + suffix;
        count++;
      }

      const worksheet = workbook.addWorksheet(uniqueSheetName);

      worksheet.columns = [
        { header: 'Candidate ID', key: 'candidate_id', width: 18 },
        { header: 'Full Name', key: 'full_name', width: 25 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Phone Number', key: 'phone', width: 18 },
        { header: 'Degree', key: 'degree', width: 15 },
        { header: 'Department', key: 'department', width: 20 },
        { header: 'Position', key: 'position', width: 22 },
        { header: 'Registration Date', key: 'created_at', width: 22 },
        { header: 'Test Status', key: 'status', width: 15 },
        { header: 'Score', key: 'score', width: 12 },
        { header: 'Percentage', key: 'percentage', width: 12 },
        { header: 'Duration (s)', key: 'duration', width: 15 },
      ];

      // Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.height = 25;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '4F46E5' } // Indigo color
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      });

      college.candidates.forEach((c) => {
        const row = worksheet.addRow({
          candidate_id: c.candidate_id,
          full_name: c.full_name,
          email: c.email,
          phone: c.phone,
          degree: c.degree || 'N/A',
          department: c.department,
          position: c.position,
          created_at: c.created_at.toLocaleString(),
          status: c.assessment?.status || 'NOT_STARTED',
          score: c.assessment?.score || 0,
          percentage: c.assessment?.percentage || 0,
          duration: c.assessment?.duration || 0,
        });

        // Add some basic styling to data rows
        row.height = 20;
        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        });
      });
    }

    if (colleges.length === 0) {
      const worksheet = workbook.addWorksheet('No Colleges');
      worksheet.addRow(['No college data found in the database.']);
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'Colleges_Candidates_Report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting colleges report:', error);
    res.status(500).json({ error: 'Failed to export colleges report' });
  }
});


// 8. Admin - Add Question
router.post('/admin/questions', async (req: Request, res: Response) => {
  const question = await prisma.question.create({
    data: req.body
  });
  res.json(question);
});

// 9. Admin - Delete Candidate
router.delete('/admin/candidates/:id', async (req: Request, res: Response) => {
  const candidateId = req.params.id;
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { candidate_id: candidateId }
    });
    
    if (assessment) {
      await prisma.candidateAnswer.deleteMany({
        where: { assessment_id: assessment.assessment_id }
      });
      await prisma.assessment.delete({
        where: { candidate_id: candidateId }
      });
    }
    
    await prisma.candidate.delete({
      where: { candidate_id: candidateId }
    });
    
    res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

// ===============================
// POSITIONS ENDPOINTS
// ===============================

// Get all positions
router.get('/positions', async (req: Request, res: Response) => {
  try {
    const positions = await prisma.position.findMany({
      where: { status: 'ACTIVE' },
      orderBy: [
        { department_type: 'asc' },
        { position_name: 'asc' }
      ]
    });
    res.json(positions);
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Get all positions (including inactive)
router.get('/admin/positions', async (req: Request, res: Response) => {
  try {
    const positions = await prisma.position.findMany({
      orderBy: [
        { department_type: 'asc' },
        { position_name: 'asc' }
      ]
    });
    res.json(positions);
  } catch (error) {
    console.error('Error fetching admin positions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Create a position
router.post('/admin/positions', async (req: Request, res: Response) => {
  try {
    const { position_name, department_type, status, pass_mark } = req.body;
    if (!position_name || !department_type) {
      return res.status(400).json({ error: 'Position name and department type are required' });
    }
    const newPosition = await prisma.position.create({
      data: { 
        position_name, 
        department_type, 
        status: status || 'INACTIVE',
        pass_mark: pass_mark !== undefined ? Number(pass_mark) : 15
      }
    });
    res.json(newPosition);
  } catch (error: any) {
    console.error('Error creating position:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Position already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Update a position
router.put('/admin/positions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { position_name, department_type, status, pass_mark } = req.body;
    const updated = await prisma.position.update({
      where: { id: Number(id) },
      data: { 
        position_name, 
        department_type, 
        status,
        pass_mark: pass_mark !== undefined ? Number(pass_mark) : undefined
      }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Delete a position
router.delete('/admin/positions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.position.delete({
      where: { id: Number(id) }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
