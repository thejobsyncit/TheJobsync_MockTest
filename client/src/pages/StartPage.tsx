import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './StartPage.module.css';
import { ENGINEERING_DEPARTMENTS, ARTS_AND_SCIENCE_DEPARTMENTS, DEGREES } from '../data';
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
    otherDepartment: '',
    position: ''
  });
  
  const [colleges, setColleges] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
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
    
    const fetchPositions = async () => {
      try {
        const response = await axios.get(`${API_URL}/positions`);
        setPositions(response.data);
      } catch (err) {
        console.error('Failed to fetch positions:', err);
      }
    };
    
    fetchColleges();
    fetchPositions();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.phone.replace(/\D/g, '').length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    setLoading(true);

    try {
      const dataToSubmit = { ...formData };
      if (dataToSubmit.department === 'Others') {
        dataToSubmit.department = dataToSubmit.otherDepartment || 'Others';
      }
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
              maxLength={10}
              value={formData.phone}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 10) {
                  setFormData({...formData, phone: val});
                }
              }}
              placeholder="10-digit phone number"
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
            <label>Specialization</label>
            <select 
              required
              value={formData.department}
              onChange={e => setFormData({...formData, department: e.target.value})}
            >
              <option value="" disabled>Select Specialization</option>
              <optgroup label="Engineering">
                {ENGINEERING_DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </optgroup>
              <optgroup label="Arts and Science">
                {ARTS_AND_SCIENCE_DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </optgroup>
              <option value="Others">Others</option>
            </select>
          </div>

          {formData.department === 'Others' && (
            <div className={styles.formGroup}>
              <label>Please specify your Specialization</label>
              <input 
                type="text" 
                required
                value={formData.otherDepartment}
                onChange={e => setFormData({...formData, otherDepartment: e.target.value})}
                placeholder="Type your specialization"
              />
            </div>
          )}

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
                  {positions.filter(p => p.department_type === 'IT').map(pos => (
                    <option key={pos.id} value={pos.position_name}>{pos.position_name}</option>
                  ))}
                </optgroup>
                <optgroup label="Non-IT Roles">
                  {positions.filter(p => p.department_type === 'Non-IT').map(pos => (
                    <option key={pos.id} value={pos.position_name}>{pos.position_name}</option>
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
