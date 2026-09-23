import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import styles from './Admin.module.css';
import logo from '../../assets/logo_new.jpg';
import { LayoutDashboard, Building2, Users, Briefcase, Lock, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!sessionStorage.getItem('adminAuth');
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const adminEmail = sessionStorage.getItem('adminAuth');
  const isSettingsAdmin = adminEmail === 'jobsync@gmail.com';
  const [addEnabled, setAddEnabled] = useState(() => {
    return localStorage.getItem('addEnabled') !== 'false';
  });

  const toggleAddEnabled = () => {
    const newVal = !addEnabled;
    setAddEnabled(newVal);
    localStorage.setItem('addEnabled', String(newVal));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if ((email === 'thejobsyncit@gmail.com' || email === 'jobsync@gmail.com') && password === 'Thejobsync@26') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', email);
      setError('');
    } else {
      setError('Invalid email or password');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    navigate('/admin');
  };

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.brandGroup} style={{ justifyContent: 'center', marginBottom: '2rem' }}>
            <img src={logo} alt="The JobSync" className={styles.logoImage} />
          </div>
          <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '1.5rem', fontWeight: 800 }}>ADMIN LOGIN</h2>
          
          <form onSubmit={handleLogin} className={styles.loginForm}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className={styles.input}
                placeholder="Enter admin email"
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className={styles.input}
                placeholder="Enter password"
                required 
              />
            </div>
            <button type="submit" className={styles.loginBtn}>
              <Lock size={18} /> Login to Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.brandGroup}>
          <img src={logo} alt="The JobSync" className={styles.logoImage} />
          <h2 className={styles.brand}>THE JOBSYNC</h2>
        </div>
        
        <nav className={styles.navMenu}>
          {!isSettingsAdmin && (
            <>
              <Link 
                to="/admin" 
                className={`${styles.navItem} ${isActive('/admin') && location.pathname === '/admin' ? styles.active : ''}`}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/admin/colleges" 
                className={`${styles.navItem} ${isActive('/admin/colleges') ? styles.active : ''}`}
              >
                <Building2 size={20} />
                <span>Colleges</span>
              </Link>
              <Link 
                to="/admin/candidates" 
                className={`${styles.navItem} ${isActive('/admin/candidates') ? styles.active : ''}`}
              >
                <Users size={20} />
                <span>All Candidates</span>
              </Link>
              <Link 
                to="/admin/positions" 
                className={`${styles.navItem} ${isActive('/admin/positions') ? styles.active : ''}`}
              >
                <Briefcase size={20} />
                <span>Positions</span>
              </Link>
            </>
          )}
          {isSettingsAdmin && (
            <div className={`${styles.navItem} ${styles.active}`}>
              <LayoutDashboard size={20} />
              <span>System Settings</span>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className={styles.navItem} 
            style={{ marginTop: 'auto', background: 'transparent', cursor: 'pointer', color: 'var(--error)' }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        {isSettingsAdmin ? (
          <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <h1 style={{ marginBottom: '2rem', fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>System Settings</h1>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>Enable Add Options</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Allow main admin to add new colleges and positions</p>
              </div>
              <button
                onClick={toggleAddEnabled}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '99px',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: addEnabled ? 'var(--success)' : '#ef4444',
                  color: 'white',
                  transition: 'all 0.2s'
                }}
              >
                {addEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
