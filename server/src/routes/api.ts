import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import exceljs from 'exceljs';
import { GoogleGenAI } from '@google/genai';

const router = Router();
const prisma = new PrismaClient();

// Helper to generate Candidate ID
const generateCandidateId = async () => {
  const count = await prisma.candidate.count();
  return `JS-TEST-${String(count + 1).padStart(5, '0')}`;
};

// Helper to fetch section questions with 3 Easy, 4 Medium, 3 Hard distribution
const fetchSectionQuestions = async (position: string, category: string): Promise<any[]> => {
  const easy = await prisma.$queryRaw<any[]>`SELECT * FROM "Question" WHERE position = ${position} AND category = ${category} AND difficulty = 'Easy' AND status = 'ACTIVE' ORDER BY RANDOM() LIMIT 3`;
  const medium = await prisma.$queryRaw<any[]>`SELECT * FROM "Question" WHERE position = ${position} AND category = ${category} AND difficulty = 'Medium' AND status = 'ACTIVE' ORDER BY RANDOM() LIMIT 4`;
  const hard = await prisma.$queryRaw<any[]>`SELECT * FROM "Question" WHERE position = ${position} AND category = ${category} AND difficulty = 'Hard' AND status = 'ACTIVE' ORDER BY RANDOM() LIMIT 3`;

  let selected = [...easy, ...medium, ...hard];
  
  if (selected.length < 10) {
    const selectedIds = selected.map(q => q.question_id);
    const gap = 10 - selected.length;
    
    // Fallback: fetch remaining questions to fill gap
    const remaining = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "Question" WHERE position = $1 AND category = $2 AND status = 'ACTIVE' ${selectedIds.length > 0 ? `AND question_id NOT IN (${selectedIds.join(',')})` : ''} ORDER BY RANDOM() LIMIT $3`,
      position, category, gap
    );
    selected = [...selected, ...remaining];
  }
  return selected;
};

// ===============================
// COLLEGE ENDPOINTS
// ===============================

// Create College
router.post('/colleges', async (req: Request, res: Response) => {
  try {
    const { college_name, college_code, location, contact_person, contact_email, contact_phone } = req.body;
    if (!college_name) return res.status(400).json({ error: 'College Name is required' });

    // Generate a unique ID using timestamp to avoid collisions
    const generatedId = `COL${Date.now().toString().slice(-6)}`;

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
    const { college_name, college_code, location, contact_person, contact_email, contact_phone } = req.body;
    
    if (!college_name) return res.status(400).json({ error: 'College Name is required' });

    const updatedCollege = await prisma.college.update({
      where: { college_id: collegeId },
      data: {
        college_name,
        college_code,
        location,
        contact_person,
        contact_email,
        contact_phone
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
    } else {
      candidate = await prisma.candidate.create({
        data: {
          candidate_id: await generateCandidateId(),
          full_name,
          email,
          normalized_email,
          phone,
          normalized_phone,
          department,
          position,
          degree,
          college_id
        },
        include: { assessment: true }
      });
    }

    if (!candidate.assessment) {
      let allQuestions: any[] = [];
      const isIT = IT_ROLES.includes(position);
      const isGeneral = GENERAL_ROLES.includes(position);
      
      if (isIT) {
        const aptitude = await fetchSectionQuestions(position, 'Aptitude');
        const grammar = await fetchSectionQuestions(position, 'Grammar & Reasoning');
        const technical = await fetchSectionQuestions(position, 'Coding & Technical');
        allQuestions = [...aptitude, ...grammar, ...technical];
      } else if (isGeneral) {
        const aptitude = await fetchSectionQuestions(position, 'Aptitude');
        const grammar = await fetchSectionQuestions(position, 'Grammar');
        const general = await fetchSectionQuestions(position, 'General Knowledge');
        allQuestions = [...aptitude, ...grammar, ...general];
      } else {
        const aptitude = await fetchSectionQuestions(position, 'Aptitude');
        const grammar = await fetchSectionQuestions(position, 'Grammar');
        const workplace = await fetchSectionQuestions(position, 'Reasoning & Workplace Ability');
        allQuestions = [...aptitude, ...grammar, ...workplace];
      }
      if (allQuestions.length === 0) {
        return res.status(400).json({ error: 'No questions available for this role.' });
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
          start_time: new Date()
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

  let timeRemaining = 30 * 60;
  if (assessment.start_time && assessment.status === 'IN_PROGRESS') {
    const elapsed = Math.floor((Date.now() - assessment.start_time.getTime()) / 1000);
    timeRemaining = Math.max(0, 30 * 60 - elapsed);
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

  const answer = await prisma.candidateAnswer.findUnique({ where: { answer_id: Number(answer_id) } });
  if (!answer || answer.assessment_id !== Number(assessmentId)) {
    return res.status(400).json({ error: 'Invalid answer reference' });
  }

  const is_correct = answer.correct_answer === selected_answer;

  await prisma.candidateAnswer.update({
    where: { answer_id: Number(answer_id) },
    data: { selected_answer, is_correct, answered_at: new Date() }
  });

  res.json({ success: true });
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
      duration
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
  const { search, department, position, status, college_id } = req.query;

  const where: any = {};
  
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
    if (req.query.score) where.assessment.score = Number(req.query.score);
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
  const { department, position, status, college_id } = req.query;

  const where: any = {};
  
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
    if (req.query.score) where.assessment.score = Number(req.query.score);
  }

  const candidates = await prisma.candidate.findMany({
    where,
    include: { assessment: true, college: true },
    orderBy: { created_at: 'desc' }
  });

  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet('Test Candidates');

  worksheet.columns = [
    { Header: 'ID', Key: 'candidate_id', Width: 15 },
    { Header: 'College', Key: 'college_name', Width: 20 },
    { Header: 'Name', Key: 'full_name', Width: 25 },
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

export default router;
