import { Link, Outlet, useLocation } from 'react-router-dom';
import styles from './Admin.module.css';
import logo from '../../assets/logo_new.jpg';
import { LayoutDashboard, Building2, Users } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.brandGroup}>
          <img src={logo} alt="The JobSync" className={styles.logoImage} />
          <h2 className={styles.brand}>THE JOBSYNC</h2>
        </div>
        
        <nav className={styles.navMenu}>
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
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}
