import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Admin.module.css';
import { Search, Download, Users, CheckCircle, Clock, X, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function GlobalCandidates() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [colleges, setColleges] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    position: '',
    status: '',
    score: '',
    college_id: ''
  });

  const [stats, setStats] = useState({
    total: 0,
    notStarted: 0,
    started: 0,
    completed: 0,
    avgScore: 0
  });

  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, [filters]);

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const res = await axios.get(`${API_URL}/colleges`);
      setColleges(res.data);
    } catch (err) {
      console.error('Failed to fetch colleges');
    }
  };

  const fetchCandidates = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.department) params.append('department', filters.department);
      if (filters.position) params.append('position', filters.position);
      if (filters.status) params.append('status', filters.status);
      if (filters.score) params.append('score', filters.score);
      if (filters.college_id) params.append('college_id', filters.college_id);

      const res = await axios.get(`${API_URL}/admin/candidates?${params.toString()}`);
      setCandidates(res.data);
      calculateStats(res.data);
    } catch (err) {
      console.error('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: any[]) => {
    let started = 0;
    let completed = 0;
    let totalScore = 0;
    
    data.forEach(c => {
      const status = c.assessment?.status;
      if (status === 'IN_PROGRESS' || status === 'COMPLETED' || status === 'TERMINATED') started++;
      if (status === 'COMPLETED') {
        completed++;
        totalScore += (c.assessment.percentage || 0);
      }
    });

    setStats({
      total: data.length,
      notStarted: data.length - started,
      started,
      completed,
      avgScore: completed > 0 ? Math.round(totalScore / completed) : 0
    });
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (filters.department) params.append('department', filters.department);
    if (filters.position) params.append('position', filters.position);
    if (filters.status) params.append('status', filters.status);
    if (filters.score) params.append('score', filters.score);
    if (filters.college_id) params.append('college_id', filters.college_id);

    window.open(`${API_URL}/admin/export?${params.toString()}`, '_blank');
  };

  const handleRowClick = async (candidateId: string) => {
    setDetailsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/candidates/${candidateId}`);
      setSelectedCandidate(res.data);
    } catch(err) {
      console.error(err);
      alert('Failed to load candidate details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeleteCandidate = async (e: React.MouseEvent, candidateId: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this candidate? This action cannot be undone.")) return;
    
    try {
      await axios.delete(`${API_URL}/admin/candidates/${candidateId}`);
      // Refresh the list
      fetchCandidates();
    } catch(err) {
      console.error(err);
      alert('Failed to delete candidate');
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '-';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>Global Candidates</h1>
        <button className={styles.exportBtn} onClick={handleExport}>
          <Download size={18} /> EXPORT TO EXCEL
        </button>
      </div>

      <div className={styles.main}>
        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)'}}><Users size={24} /></div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statLabel}>Total Candidates</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)'}}><Clock size={24} /></div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.notStarted}</span>
              <span className={styles.statLabel}>Not Started</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)'}}><Clock size={24} /></div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.started}</span>
              <span className={styles.statLabel}>Tests Started</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)'}}><CheckCircle size={24} /></div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.completed}</span>
              <span className={styles.statLabel}>Tests Completed</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc'}}>
              <span style={{fontWeight: 800, fontSize: '1.25rem'}}>%</span>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.avgScore}%</span>
              <span className={styles.statLabel}>Average Score</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filtersSection}>
          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by Name, ID, Email, Phone..." 
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value})}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <select value={filters.college_id} onChange={e => setFilters({...filters, college_id: e.target.value})}>
              <option value="">All Colleges</option>
              {colleges.map(c => (
                <option key={c.college_id} value={c.college_id}>{c.college_name}</option>
              ))}
            </select>
            <select value={filters.department} onChange={e => setFilters({...filters, department: e.target.value})}>
              <option value="">All Departments</option>
              <option value="IT">IT</option>
              <option value="Non-IT">Non IT</option>
            </select>
            <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
              <option value="">All Statuses</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="TERMINATED">Terminated</option>
              <option value="CLOSED">Closed</option>
            </select>
            <select value={filters.score} onChange={e => setFilters({...filters, score: e.target.value})}>
              <option value="">All Marks</option>
              <option value="30">30 Marks</option>
              <option value="25">25 Marks</option>
              <option value="20">20 Marks</option>
              <option value="15">15 Marks</option>
              <option value="10">10 Marks</option>
              <option value="5">5 Marks</option>
              <option value="0">0 Marks</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Candidate ID</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Degree</th>
                <th>Role</th>
                <th>Mark</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{textAlign:'center', padding: '2rem'}}>Loading...</td></tr>
              ) : candidates.length === 0 ? (
                <tr><td colSpan={10} style={{textAlign:'center', padding: '2rem'}}>No candidates found</td></tr>
              ) : (
                candidates.map((c, i) => (
                  <tr key={c.candidate_id} onClick={() => handleRowClick(c.candidate_id)} style={{cursor: 'pointer'}}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td><span className={styles.idBadge}>{c.candidate_id}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{c.full_name}</td>
                    <td>
                      <div className={styles.candidateInfo}>
                        <span className={styles.email}>{c.email}</span>
                        <span className={styles.phone}>{c.phone}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{c.department}</td>
                    <td style={{ fontWeight: 500, color: 'var(--primary)' }}>{c.position}</td>
                    <td>
                      {(c.assessment?.status === 'COMPLETED' || c.assessment?.status === 'TERMINATED') ? (
                        <div className={styles.scoreCell}>
                          <span className={styles.scoreVal}>{c.assessment.score}/30</span>
                          <span className={styles.percentVal}>{Math.round(c.assessment.percentage)}%</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      {c.assessment?.candidate_rating ? (
                        <div style={{display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 600}}>
                          {c.assessment.candidate_rating} <span style={{fontSize: '1.2em'}}>★</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles['status_' + (c.assessment?.status || 'NOT_STARTED')]}`}>
                        {c.assessment?.status?.replace('_', ' ') || 'NOT STARTED'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={styles.deleteBtn} 
                        onClick={(e) => handleDeleteCandidate(e, c.candidate_id)}
                        title="Delete Candidate"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detailsLoading && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalLoading}>Loading details...</div>
        </div>
      )}

      {selectedCandidate && (
        <div className={styles.modalOverlay} onClick={() => setSelectedCandidate(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Candidate Details</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedCandidate(null)}><X size={24} /></button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailCard}>
                  <h3>Personal Info</h3>
                  <p><strong>Name:</strong> {selectedCandidate.full_name}</p>
                  <p><strong>Email:</strong> {selectedCandidate.email}</p>
                  <p><strong>Phone:</strong> {selectedCandidate.phone}</p>
                  <p><strong>Role:</strong> {selectedCandidate.department} - {selectedCandidate.position}</p>
                </div>
                
                <div className={styles.detailCard}>
                  <h3>Test Activity</h3>
                  <p><strong>Status:</strong> <span className={`${styles.statusBadge} ${styles['status_' + (selectedCandidate.assessment?.status || 'NOT_STARTED')]}`}>{selectedCandidate.assessment?.status?.replace('_', ' ') || 'NOT STARTED'}</span></p>
                  <p><strong>Login Time (Start):</strong> {formatDateTime(selectedCandidate.assessment?.start_time)}</p>
                  <p><strong>Exit Time (Submit):</strong> {formatDateTime(selectedCandidate.assessment?.completed_at)}</p>
                  <p><strong>Time Taken:</strong> {formatDuration(selectedCandidate.assessment?.duration)}</p>
                  <p><strong>Score:</strong> {selectedCandidate.assessment?.score}/30 ({Math.round(selectedCandidate.assessment?.percentage || 0)}%)</p>
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(79, 70, 229, 0.05)', borderRadius: '8px', border: '1px solid rgba(79, 70, 229, 0.1)' }}>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}><strong>Aptitude:</strong> {selectedCandidate.assessment?.aptitude_score || 0}/10</p>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}><strong>Grammar:</strong> {selectedCandidate.assessment?.grammar_score || 0}/10</p>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}><strong>Role-Based:</strong> {selectedCandidate.assessment?.coding_score || 0}/10</p>
                  </div>
                </div>

                {selectedCandidate.assessment?.candidate_rating && (
                  <div className={styles.detailCard}>
                    <h3>Candidate Feedback</h3>
                    <div style={{display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '1.5rem', marginBottom: '0.5rem'}}>
                      {Array.from({length: selectedCandidate.assessment.candidate_rating}).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                      {Array.from({length: 5 - selectedCandidate.assessment.candidate_rating}).map((_, i) => (
                        <span key={i} style={{color: '#e5e7eb'}}>★</span>
                      ))}
                    </div>
                    {selectedCandidate.assessment.candidate_feedback ? (
                      <p style={{fontStyle: 'italic', color: '#4b5563', lineHeight: 1.5, background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
                        "{selectedCandidate.assessment.candidate_feedback}"
                      </p>
                    ) : (
                      <p style={{color: '#9ca3af', fontStyle: 'italic'}}>No written feedback provided.</p>
                    )}
                  </div>
                )}
              </div>

              {selectedCandidate.assessment?.answers && selectedCandidate.assessment.answers.length > 0 && (
                <div className={styles.answersSection}>
                  <h3>Test Answers Breakdown</h3>
                  <div className={styles.answersList}>
                    {selectedCandidate.assessment.answers.map((a: any, i: number) => (
                      <div key={a.answer_id} className={`${styles.answerItem} ${a.is_correct ? styles.answerCorrect : (a.selected_answer ? styles.answerWrong : styles.answerUnanswered)}`}>
                        <div className={styles.answerQ}>{i + 1}. {a.question.question_text}</div>
                        <div className={styles.answerDetails}>
                          <span className={styles.selectedAns}><strong>Selected:</strong> {a.selected_answer ? a.selected_answer : 'None'}</span>
                          <span className={styles.correctAns}><strong>Correct:</strong> {a.correct_answer}</span>
                          <span className={styles.ansStatus}>{a.is_correct ? '✅ Correct' : (a.selected_answer ? '❌ Wrong' : '⚠️ Unanswered')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
