import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './StartPage.module.css';
import { IT_DEPARTMENTS, NON_IT_DEPARTMENTS, IT_ROLES, NON_IT_ROLES, DEGREES } from '../data';
import logo from '../assets/logo_new.jpg';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function StartPage() {
  const [formData, setFormData] = useState({
    college_id: '',
    full_name: '',
    email: '',
    phone: '',
    degree: '',
    department: '',
    position: ''
  });
  
  const [colleges, setColleges] = useState<any[]>([]);
  

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await axios.get(`${API_URL}/colleges/simple`);
        setColleges(response.data);
      } catch (err) {
        console.error('Failed to fetch colleges:', err);
      }
    };
    fetchColleges();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const dataToSubmit = { ...formData };
      if (dataToSubmit.department === 'General') {
        dataToSubmit.position = 'General Candidate';
      }
      const response = await axios.post(`${API_URL}/candidates/register`, dataToSubmit);
      const { candidate } = response.data;
      navigate(`/test/${candidate.candidate_id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.brandGroup}>
            <img src={logo} alt="The JobSync Logo" className={styles.logoImage} />
            <h1 className={styles.brand}>THE JOBSYNC</h1>
          </div>
          <h2 className={styles.title}>ONLINE ASSESSMENT TEST</h2>
          <p className={styles.subtitle}>Complete your role-specific assessment and discover your score.</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>College</label>
            <select 
              required
              value={formData.college_id}
              onChange={e => setFormData({...formData, college_id: e.target.value})}
            >
              <option value="">Select College</option>
              {colleges.map(c => (
                <option key={c.college_id} value={c.college_id}>{c.college_name}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input 
              type="text" 
              required
              value={formData.full_name}
              onChange={e => setFormData({...formData, full_name: e.target.value})}
              placeholder="Enter your full name"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Phone Number</label>
            <input 
              type="tel" 
              required
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              placeholder="Enter your phone number"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Degree (Optional)</label>
            <select 
              value={formData.degree}
              onChange={e => setFormData({...formData, degree: e.target.value})}
            >
              <option value="">Select Degree</option>
              {Object.entries(DEGREES).map(([category, degrees]) => (
                <optgroup key={category} label={category}>
                  {degrees.map(deg => (
                    <option key={deg} value={deg}>{deg}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Department</label>
            <select 
              required
              value={formData.department}
              onChange={e => setFormData({...formData, department: e.target.value})}
            >
              <option value="" disabled>Select Department</option>
              <optgroup label="IT Departments">
                {IT_DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </optgroup>
              <optgroup label="Non-IT Departments">
                {NON_IT_DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {formData.department !== 'General' && (
            <div className={styles.formGroup}>
              <label>Position</label>
              <select 
                required
                value={formData.position}
                onChange={e => setFormData({...formData, position: e.target.value})}
              >
                <option value="" disabled>Select Position</option>
                <optgroup label="IT Roles">
                  {IT_ROLES.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </optgroup>
                <optgroup label="Non-IT Roles">
                  {NON_IT_ROLES.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Starting...' : 'START TEST'}
          </button>
        </form>
      </div>
    </div>
  );
}
