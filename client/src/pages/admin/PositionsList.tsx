import { useState, useEffect, type FormEvent } from 'react';
import axios from 'axios';
import styles from './Admin.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function PositionsList() {
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null as number | null,
    position_name: '',
    department_type: 'IT',
    status: 'INACTIVE',
    pass_mark: 15
  });

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/positions`);
      setPositions(response.data);
    } catch (err) {
      console.error('Error fetching positions:', err);
      setError('Failed to fetch positions');
    } finally {
      setLoading(false);
    }
  };

  const isSuperAdmin = sessionStorage.getItem('adminAuth') === 'thejobsyncit@gmail.com';
  const addEnabled = localStorage.getItem('addEnabled') !== 'false';

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        // Update
        await axios.put(`${API_URL}/admin/positions/${formData.id}`, formData);
      } else {
        // Create
        await axios.post(`${API_URL}/admin/positions`, formData);
      }
      setIsModalOpen(false);
      fetchPositions();
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  const handleEdit = (pos: any) => {
    setFormData({
      id: pos.id,
      position_name: pos.position_name,
      department_type: pos.department_type,
      status: pos.status,
      pass_mark: pos.pass_mark || 15
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this position?')) return;
    try {
      await axios.delete(`${API_URL}/admin/positions/${id}`);
      fetchPositions();
    } catch (err) {
      console.error('Error deleting position:', err);
      alert('Failed to delete position');
    }
  };

  const openNewModal = () => {
    setFormData({
      id: null,
      position_name: '',
      department_type: 'IT',
      status: 'INACTIVE',
      pass_mark: 15
    });
    setIsModalOpen(true);
  };

  if (loading) return <div className={styles.loading}>Loading positions...</div>;

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.pageTitle}>Positions Management</h1>
          <p className={styles.pageSubtitle}>Add, edit, or remove roles for candidates</p>
        </div>
        {isSuperAdmin && addEnabled && (
          <button className={styles.primaryButton} onClick={openNewModal}>
            + Add New Position
          </button>
        )}
      </header>

      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Position Name</th>
              <th>Department Type</th>
              <th>Pass Mark</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.length > 0 ? (
              positions.map(pos => (
                <tr key={pos.id}>
                  <td className={styles.primaryCell}>{pos.position_name}</td>
                  <td>
                    <span className={styles.badge} style={{ backgroundColor: pos.department_type === 'IT' ? '#e0f2fe' : '#fef3c7', color: pos.department_type === 'IT' ? '#0369a1' : '#b45309' }}>
                      {pos.department_type}
                    </span>
                  </td>
                  <td>{pos.pass_mark || 15}</td>
                  <td>
                    <span className={styles.badge} style={{ backgroundColor: pos.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2', color: pos.status === 'ACTIVE' ? '#166534' : '#991b1b' }}>
                      {pos.status}
                    </span>
                  </td>
                  <td>
                    <button className={styles.actionButton} onClick={() => handleEdit(pos)}>Edit</button>
                    <button className={`${styles.actionButton} ${styles.dangerButton}`} onClick={() => handleDelete(pos.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No positions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>{formData.id ? 'Edit Position' : 'Add New Position'}</h2>
            <form onSubmit={handleSubmit} className={styles.formGroup}>
              <div className={styles.inputGroup}>
                <label>Position Name</label>
                <input 
                  type="text" 
                  value={formData.position_name} 
                  onChange={e => setFormData({ ...formData, position_name: e.target.value })}
                  required
                  placeholder="e.g. Software Engineer"
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Department Type</label>
                <select 
                  value={formData.department_type}
                  onChange={e => setFormData({ ...formData, department_type: e.target.value })}
                  className={styles.input}
                >
                  <option value="IT">IT</option>
                  <option value="Non-IT">Non-IT</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className={styles.input}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Pass Mark</label>
                <input 
                  type="number" 
                  value={formData.pass_mark} 
                  onChange={e => setFormData({ ...formData, pass_mark: Number(e.target.value) })}
                  required
                  min="0"
                  className={styles.input}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryButton}>{formData.id ? 'Save Changes' : 'Add Position'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
