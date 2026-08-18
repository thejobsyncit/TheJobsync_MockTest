import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Users, FileText, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import styles from './Admin.module.css';

const API_URL = 'http://localhost:5000/api';

export default function CollegeDetails() {
  const { collegeId } = useParams();
  const [college, setCollege] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const res = await axios.get(`${API_URL}/colleges/${collegeId}`);
        setCollege(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollege();
  }, [collegeId]);

  const handleDeleteCandidate = async (e: React.MouseEvent, candidateId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    
    try {
      await axios.delete(`${API_URL}/admin/candidates/${candidateId}`);
      // Refresh the college details to get updated candidate list
      const res = await axios.get(`${API_URL}/colleges/${collegeId}`);
      setCollege(res.data);
    } catch(err) {
      console.error(err);
      alert('Failed to delete candidate');
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading college details...</div>;
  if (!college) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--error)' }}>College not found</div>;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin/colleges" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Colleges
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>{college.college_name}</h1>
          <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
            ID: <span style={{color: '#0f172a'}}>{college.college_id}</span> {college.college_code ? `| Code: ` : ''}<span style={{color: '#0f172a'}}>{college.college_code}</span> | Location: <span style={{color: '#0f172a'}}>{college.location || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(79, 70, 229, 0.08)', color: 'var(--primary)' }}><Users size={26} /></div>
          <div>
            <div className={styles.statLabel}>College Candidates</div>
            <div className={styles.statValue}>{college.candidates?.length || 0}</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' }}><FileText size={26} /></div>
          <div>
            <div className={styles.statLabel}>Total Tests</div>
            <div className={styles.statValue}>{college.stats.total}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.08)', color: 'var(--success)' }}><CheckCircle size={26} /></div>
          <div>
            <div className={styles.statLabel}>Completed Tests</div>
            <div className={styles.statValue}>{college.stats.completed}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--error)' }}><XCircle size={26} /></div>
          <div>
            <div className={styles.statLabel}>Failed Tests</div>
            <div className={styles.statValue}>{college.stats.failed}</div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem' }}>College Candidates</h2>
      
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
            {college.candidates.map((c: any, i: number) => (
              <tr key={c.candidate_id}>
                <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{i + 1}</td>
                <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.candidate_id}</td>
                <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{c.full_name}</td>
                <td>
                  <div className={styles.candidateInfo}>
                    <span className={styles.email}>{c.email}</span>
                    <span className={styles.phone}>{c.phone}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{c.department}</td>
                <td style={{ fontWeight: 500, color: 'var(--primary)' }}>{c.position}</td>
                <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.assessment?.score || 0} / {c.assessment?.total_questions || 30}</td>
                <td>
                  {c.assessment?.candidate_rating ? (
                    <div style={{display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 600}}>
                      {c.assessment.candidate_rating} <span style={{fontSize: '1.2em'}}>★</span>
                    </div>
                  ) : '-'}
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[`status_${c.assessment?.status || 'NOT_STARTED'}`]}`}>
                    {(c.assessment?.status || 'NOT_STARTED').replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <button 
                    className={styles.deleteBtn}
                    onClick={(e) => handleDeleteCandidate(e, c.candidate_id)}
                    title="Delete Candidate"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {college.candidates.length === 0 && (
              <tr>
                <td colSpan={10} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No candidates registered under this college yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
