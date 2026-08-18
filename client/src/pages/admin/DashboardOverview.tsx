import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Users, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Admin.module.css';

const API_URL = 'http://localhost:5000/api';

export default function DashboardOverview() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await axios.get(`${API_URL}/colleges`);
        setColleges(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchColleges();
  }, []);

  const stats = colleges.reduce((acc, curr) => {
    acc.candidates += curr.candidatesCount;
    acc.tests += curr.testsCount;
    acc.completed += curr.completed;
    acc.pending += curr.pending;
    acc.passed += curr.passed;
    acc.failed += curr.failed;
    return acc;
  }, { candidates: 0, tests: 0, completed: 0, pending: 0, passed: 0, failed: 0 });

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '2rem' }}>Global CRM Dashboard</h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading metrics...</div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(79, 70, 229, 0.08)', color: 'var(--primary)' }}><Building2 size={26} /></div>
              <div>
                <div className={styles.statLabel}>Total Colleges</div>
                <div className={styles.statValue}>{colleges.length}</div>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.08)', color: 'var(--success)' }}><Users size={26} /></div>
              <div>
                <div className={styles.statLabel}>Total Candidates</div>
                <div className={styles.statValue}>{stats.candidates}</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' }}><FileText size={26} /></div>
              <div>
                <div className={styles.statLabel}>Total Tests</div>
                <div className={styles.statValue}>{stats.tests}</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.08)', color: 'var(--warning)' }}><CheckCircle size={26} /></div>
              <div>
                <div className={styles.statLabel}>Passed Candidates</div>
                <div className={styles.statValue}>{stats.passed}</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--error)' }}><XCircle size={26} /></div>
              <div>
                <div className={styles.statLabel}>Failed Candidates</div>
                <div className={styles.statValue}>{stats.failed}</div>
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem' }}>College-wise Summary</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>College Name</th>
                  <th>Candidates</th>
                  <th>Completed Tests</th>
                  <th>Pending Tests</th>
                  <th>Passed</th>
                  <th>Failed</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {colleges.map(col => (
                  <tr key={col.college_id}>
                    <td style={{ fontWeight: 600 }}>{col.college_name}</td>
                    <td>{col.candidatesCount}</td>
                    <td>{col.completed}</td>
                    <td>{col.pending}</td>
                    <td style={{ color: 'var(--success)' }}>{col.passed}</td>
                    <td style={{ color: 'var(--error)' }}>{col.failed}</td>
                    <td>
                      <Link to={`/admin/colleges/${col.college_id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                        Open College &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
                {colleges.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No colleges found. Create one from the Colleges tab.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
