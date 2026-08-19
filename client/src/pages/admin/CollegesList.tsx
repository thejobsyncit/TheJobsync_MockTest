import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Search, Building2, UserCircle, FileText, CheckCircle, Clock, Trash2, Edit2 } from 'lucide-react';
import styles from './Admin.module.css';

const API_URL = 'http://localhost:5000/api';

export default function CollegesList() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    college_name: '',
    college_code: '',
    location: '',
    contact_person: '',
    contact_email: '',
    contact_phone: ''
  });

  const [editFormData, setEditFormData] = useState({
    college_id: '',
    college_name: '',
    college_code: '',
    location: '',
    contact_person: '',
    contact_email: '',
    contact_phone: ''
  });

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/colleges`);
      setColleges(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/colleges`, formData);
      setShowAddModal(false);
      setFormData({
        college_name: '',
        college_code: '',
        location: '',
        contact_person: '',
        contact_email: '',
        contact_phone: ''
      });
      fetchColleges();
    } catch (err) {
      console.error(err);
      alert('Failed to create college');
    }
  };

  const handleDelete = async (collegeId: string) => {
    if (window.confirm('Are you sure you want to delete this college? This will permanently delete all associated candidates, assessments, and responses.')) {
      try {
        await axios.delete(`${API_URL}/colleges/${collegeId}`);
        fetchColleges();
      } catch (err) {
        console.error(err);
        alert('Failed to delete college');
      }
    }
  };

  const openEditModal = (college: any) => {
    setEditFormData({
      college_id: college.college_id,
      college_name: college.college_name || '',
      college_code: college.college_code || '',
      location: college.location || '',
      contact_person: college.contact_person || '',
      contact_email: college.contact_email || '',
      contact_phone: college.contact_phone || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/colleges/${editFormData.college_id}`, editFormData);
      setShowEditModal(false);
      fetchColleges();
    } catch (err) {
      console.error(err);
      alert('Failed to update college');
    }
  };

  const filtered = colleges.filter(c => 
    c.college_name.toLowerCase().includes(search.toLowerCase()) || 
    (c.college_code && c.college_code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Colleges Management</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          <Plus size={18} /> Add College
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            type="text" 
            placeholder="Search colleges by name or code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading colleges...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(college => (
            <div key={college.college_id} className={styles.statCard} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(79, 70, 229, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, letterSpacing: '-0.01em' }}>{college.college_name}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: {college.college_id} {college.college_code ? `| Code: ${college.college_code}` : ''}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserCircle size={16} color="var(--primary)" />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Candidates: <strong style={{color: 'var(--text-main)'}}>{college.candidatesCount}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={16} color="var(--primary)" />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tests: <strong style={{color: 'var(--text-main)'}}>{college.completed + college.pending}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" />
                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Completed: <strong style={{color: '#0f172a'}}>{college.completed}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="var(--warning)" />
                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Pending: <strong style={{color: '#0f172a'}}>{college.pending}</strong></span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link 
                  to={`/admin/colleges/${college.college_id}`}
                  style={{ flex: 1, textAlign: 'center', background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}
                >
                  View Details
                </Link>
                <button 
                  onClick={() => openEditModal(college)}
                  style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}
                  title="Edit College"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(college.college_id)}
                  style={{ background: 'var(--error-light)', color: 'var(--error)', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}
                  title="Delete College"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <h2>Add New College</h2>
              <button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>College Name *</label>
                  <input required type="text" value={formData.college_name} onChange={e => setFormData({...formData, college_name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>College Code</label>
                  <input type="text" value={formData.college_code} onChange={e => setFormData({...formData, college_code: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Location</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Contact Name</label>
                    <input type="text" value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Contact Phone</label>
                    <input type="text" value={formData.contact_phone} onChange={e => setFormData({...formData, contact_phone: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Create College</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <h2>Edit College Details</h2>
              <button className={styles.closeBtn} onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>College Name *</label>
                  <input required type="text" value={editFormData.college_name} onChange={e => setEditFormData({...editFormData, college_name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>College Code</label>
                  <input type="text" value={editFormData.college_code} onChange={e => setEditFormData({...editFormData, college_code: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Location</label>
                  <input type="text" value={editFormData.location} onChange={e => setEditFormData({...editFormData, location: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Contact Name</label>
                    <input type="text" value={editFormData.contact_person} onChange={e => setEditFormData({...editFormData, contact_person: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Contact Phone</label>
                    <input type="text" value={editFormData.contact_phone} onChange={e => setEditFormData({...editFormData, contact_phone: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" onClick={() => setShowEditModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
