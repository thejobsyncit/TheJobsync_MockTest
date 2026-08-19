import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './TestInterface.module.css';
import logo from '../assets/logo_new.jpg';

const API_URL = 'http://localhost:5000/api';

export default function TestInterface() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(1800);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [codeValue, setCodeValue] = useState("");
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [warningCount, setWarningCount] = useState(() => {
    const saved = localStorage.getItem(`warnings_${candidateId}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [securityLock, setSecurityLock] = useState<string | null>(null);

  const submittingRef = useRef(submitting);
  useEffect(() => { submittingRef.current = submitting; }, [submitting]);

  const assessmentRef = useRef(assessment);
  useEffect(() => { assessmentRef.current = assessment; }, [assessment]);

  // Auto-terminate if component unmounts (e.g. user hits back button or navigates away)
  useEffect(() => {
    return () => {
      if (!submittingRef.current && assessmentRef.current?.status === 'IN_PROGRESS') {
        const url = `${API_URL}/assessments/${assessmentRef.current.assessment_id}/submit`;
        const data = JSON.stringify({ forcedStatus: 'CLOSED' });
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: data,
          keepalive: true
        });
      }
    };
  }, []);

  useEffect(() => {
    fetchAssessment();
  }, [candidateId]);

  useEffect(() => {
    if (loading || submitting) return;

    if (timeRemaining <= 0) {
      autoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, timeRemaining, submitting]);

  useEffect(() => {
    if (loading || submitting) return;

    const handleViolation = (reason: string) => {
      setWarningCount(prev => {
        const newCount = prev + 1;
        localStorage.setItem(`warnings_${candidateId}`, newCount.toString());
        if (newCount >= 3) {
          setSecurityLock(`WARNING: You have triggered a violation (${reason}) 3 times. Your test is being terminated and submitted automatically.`);
          autoSubmit('TERMINATED');
        } else {
          setSecurityLock(`WARNING: Test violation detected (${reason})! This is warning ${newCount} of 2. If you do this ${3 - newCount} more time(s), your test will be terminated and submitted.`);
        }
        return newCount;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('Tab Switch / Focus Lost');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Print Screen key
      if (e.key === 'PrintScreen') {
        handleViolation('Screenshot Attempt');
      }
      // Windows Snipping Tool (Meta + Shift + S)
      if (e.metaKey && e.shiftKey && e.key.toLowerCase() === 's') {
        handleViolation('Screenshot Attempt');
      }
      // Mac Screenshot (Meta + Shift + 3, 4, or 5)
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        handleViolation('Screenshot Attempt');
      }
      // Print Page (Ctrl/Cmd + P)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleViolation('Print Attempt');
      }
    };

    const handleBlur = () => {
      handleViolation('Window Focus Lost / Possible Screen Capture Overlay');
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Required for Chrome to show the warning dialog
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [loading, submitting, assessment]);

  const fetchAssessment = async () => {
    try {
      const res = await axios.get(`${API_URL}/assessments/${candidateId}`);
      if (res.data.assessment.status === 'COMPLETED' || res.data.assessment.status === 'TERMINATED') {
        navigate(`/result/${candidateId}`);
        return;
      }
      setAssessment(res.data.assessment);
      setQuestions(res.data.questions);
      setTimeRemaining(res.data.timeRemaining);
    } catch (err) {
      alert('Error fetching assessment');
    } finally {
      setLoading(false);
    }
  };

  // Keep codeValue in sync when switching questions
  useEffect(() => {
    if (questions.length > 0 && questions[currentIdx].question.type === 'CODING') {
      setCodeValue(questions[currentIdx].selected_answer || "");
    }
  }, [currentIdx, questions]);

  const handleOptionSelect = async (option: string) => {
    if (timeRemaining <= 0 || submitting) return;
    
    const newQuestions = [...questions];
    newQuestions[currentIdx].selected_answer = option;
    setQuestions(newQuestions);

    try {
      await axios.patch(`${API_URL}/assessments/${assessment.assessment_id}/answer`, {
        answer_id: questions[currentIdx].answer_id,
        selected_answer: option
      });
    } catch (err) {
      console.error('Failed to auto-save answer');
    }
  };

  const handleCodeBlur = async () => {
    if (timeRemaining <= 0 || submitting) return;
    if (codeValue === questions[currentIdx].selected_answer) return;
    
    const newQuestions = [...questions];
    newQuestions[currentIdx].selected_answer = codeValue;
    setQuestions(newQuestions);

    try {
      await axios.patch(`${API_URL}/assessments/${assessment.assessment_id}/answer`, {
        answer_id: questions[currentIdx].answer_id,
        selected_answer: codeValue
      });
    } catch (err) {
      console.error('Failed to auto-save code answer');
    }
  };

  const toggleReview = () => {
    const newMarked = new Set(markedForReview);
    if (newMarked.has(currentIdx)) newMarked.delete(currentIdx);
    else newMarked.add(currentIdx);
    setMarkedForReview(newMarked);
  };

  const autoSubmit = async (forcedStatus?: string) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/assessments/${assessment?.assessment_id}/submit`, { forcedStatus });
      navigate(`/result/${candidateId}`);
    } catch (err) {
      alert('Failed to submit test');
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading test...</div>;
  if (!questions || questions.length === 0) return <div className={styles.loading}>No questions found for this assessment.</div>;

  const currentQ = questions[currentIdx];
  const answeredCount = questions.filter(q => q.selected_answer).length;
  const progress = Math.round((answeredCount / questions.length) * 100);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (securityLock) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 999999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ color: '#ef4444', fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>SECURITY ALERT</h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', color: '#1e293b', maxWidth: '600px', lineHeight: 1.6 }}>{securityLock}</p>
        {warningCount < 3 && (
          <button 
            onClick={() => setSecurityLock(null)}
            style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)' }}
          >
            I Understand, Return to Test
          </button>
        )}
      </div>
    );
  }

  return (
    <div 
      className={styles.container}
      onCopy={e => e.preventDefault()} 
      onPaste={e => e.preventDefault()} 
      onContextMenu={e => e.preventDefault()}
      onSelect={e => e.preventDefault()}
      style={{ userSelect: 'none' }}
    >
      {/* Sidebar Nav */}
      <aside className={styles.sidebar}>
        <div className={styles.brandGroup}>
          <img src={logo} alt="The JobSync Logo" className={styles.logoImage} />
          <div className={styles.brand}>THE JOBSYNC</div>
        </div>
        <div className={styles.candidateInfo}>
          <p className={styles.name}>{assessment?.candidate?.full_name}</p>
          <p className={styles.role}>{assessment?.department} - {assessment?.position}</p>
        </div>
        
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span>Progress</span>
            <span>{progress}% Completed</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className={styles.sidebarScroll}>
          {Array.from(new Set(questions.map(q => q.question.category))).map(category => (
            <div key={category}>
              <div className={styles.sectionHeader}>{category}</div>
              <div className={styles.grid}>
                {questions.map((q, idx) => {
                  if (q.question.category !== category) return null;

                  const isCurrent = idx === currentIdx;
                  const isAnswered = !!q.selected_answer;
                  // const isMarked = markedForReview.has(idx);
                  
                  let classes = styles.gridBtn;
                  if (isCurrent) classes += ` ${styles.gridBtn_current}`;
                  if (isAnswered) classes += ` ${styles.gridBtn_answered}`;
                  // if (isMarked) classes += ` ${styles.gridBtn_marked}`;

                  return (
                    <button 
                      key={q.question_id}
                      className={classes}
                      onClick={() => setCurrentIdx(idx)}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className={styles.main}>
        <div className={styles.topbar}>
          <div className={`${styles.timer} ${timeRemaining < 300 ? styles.timerWarning : ''}`}>
            <span className={styles.timerLabel}>Time Remaining</span>
            <span className={styles.timerValue}>{formatTime(timeRemaining)}</span>
          </div>
        </div>

        {/* Question Area */}
        <section className={styles.content}>
          <div className={styles.questionCard}>
            <div className={styles.questionCardHeader}>
              <h2 className={styles.sectionTitle}>{currentQ.question.category} Section</h2>
              <h3 className={styles.questionMeta}>Question {currentIdx + 1} of {questions.length}</h3>
            </div>
            <p className={styles.questionText}>{currentQ.question.question_text}</p>
            
            {currentQ.question.type === 'CODING' ? (
              <div className={styles.codingArea}>
                <textarea 
                  className={styles.codeEditor}
                  placeholder="// Write your code here...&#10;// E.g., function solve() { ... }"
                  value={codeValue}
                  onChange={(e) => setCodeValue(e.target.value)}
                  onBlur={handleCodeBlur}
                  spellCheck={false}
                />
              </div>
            ) : (
              <div className={styles.options}>
                {['A', 'B', 'C', 'D'].map(opt => {
                  const optKey = `option_${opt.toLowerCase()}` as keyof typeof currentQ.question;
                  return (
                    <label 
                      key={opt}
                      className={`${styles.optionBtn} ${currentQ.selected_answer === opt ? styles.optionBtn_selected : ''}`}
                    >
                      <input 
                        type="radio" 
                        name={`q-${currentQ.question_id}`} 
                        value={opt}
                        checked={currentQ.selected_answer === opt}
                        onChange={() => handleOptionSelect(opt)}
                        style={{ display: 'none' }}
                      />
                      <span className={styles.optionBadge}>{opt}</span>
                      <span className={styles.optionText}>{currentQ.question[optKey]}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button 
              className={styles.navBtn} 
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
            >
              Previous
            </button>
            
            <button 
              className={styles.navBtn} 
              onClick={toggleReview}
              style={{ borderColor: markedForReview.has(currentIdx) ? 'var(--warning)' : '', color: markedForReview.has(currentIdx) ? 'var(--warning)' : '' }}
            >
              {markedForReview.has(currentIdx) ? 'Unmark Review' : 'Mark for Review'}
            </button>
            
            {currentIdx < questions.length - 1 ? (
              <button 
                className={styles.submitBtn} 
                onClick={() => setCurrentIdx(currentIdx + 1)}
              >
                Next
              </button>
            ) : (
              <button 
                className={styles.submitBtn} 
                onClick={() => {
                  if(window.confirm('Are you sure you want to submit the test?')) {
                    autoSubmit();
                  }
                }}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Test'}
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
