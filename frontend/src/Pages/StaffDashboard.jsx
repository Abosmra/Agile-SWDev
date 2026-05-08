import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoleContext } from '../context/RoleContext';
import { formatRoleLabel, normalizeRoleName } from '../roleUtils';
import { apiGet, apiPost } from '../api';
import '../css/StaffDashboard.css';

const cardThemes = [
  { bg: '#f0efff', art: '#e0deff', arrow: '#7c6fe0' },
  { bg: '#f5eeff', art: '#e9d9ff', arrow: '#9b6edc' },
  { bg: '#fff0f3', art: '#ffd6df', arrow: '#e07090' },
  { bg: '#eef8ff', art: '#d7efff', arrow: '#4facfe' }
];

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { userRole } = useContext(RoleContext);
  const isAdvisor = normalizeRoleName(userRole) === 'advisor';
  
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [halls, setHalls] = useState([]);
  const [maintenanceForm, setMaintenanceForm] = useState({ roomId: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  const dashboardOptions = [
    ...(isAdvisor ? [{
      title: 'Advisor Panel',
      description: 'Approve or cancel student enrollment requests and pending course-drop requests.',
      icon: 'AP',
      path: '/advisor-panel'
    }] : []),
    {
      title: 'Teaching Console',
      description: 'View your courses, students, grades, assignments, marks, materials, and teaching requests.',
      icon: 'TC',
      path: '/teaching'
    },
    {
      title: 'Facilities',
      description: 'Browse available halls and reserve rooms for classes, labs, meetings, or events.',
      icon: 'FH',
      path: '/halls'
    },
    {
      title: 'Report Maintenance',
      description: 'Submit maintenance issues for classrooms, labs, or equipment.',
      icon: 'RM',
      path: '/reportmaintenance'
    },
    {
      title: 'Profile & HR',
      description: 'Review salary, payroll status, benefits, leave balance, and submit leave requests.',
      icon: 'HR',
      path: '/profile'
    }
  ];

  // Fetch halls when modal opens
  useEffect(() => {
    if (showMaintenanceModal && halls.length === 0) {
      const fetchHalls = async () => {
        try {
          const data = await apiGet('/api/halls');
          setHalls(data);
        } catch (err) {
          console.error('Failed to load halls:', err);
        }
      };
      fetchHalls();
    }
  }, [showMaintenanceModal, halls.length]);

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotice(null);
    
    try {
      await apiPost('/api/maintenance', {
        roomId: parseInt(maintenanceForm.roomId),
        description: maintenanceForm.description
      });
      setNotice({ type: 'success', message: 'Maintenance issue reported successfully!' });
      setMaintenanceForm({ roomId: '', description: '' });
      setTimeout(() => {
        setShowMaintenanceModal(false);
        setNotice(null);
      }, 2000);
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Failed to report maintenance issue.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="staff-dash-root">
      <div className="staff-dash-topbar">
        <div>
          <h1 className="staff-dash-title">Staff Dashboard</h1>
          <p className="staff-dash-subtitle">A course-style workspace for teaching, staff tools, and academic operations.</p>
        </div>
        <div className="staff-dash-role">{formatRoleLabel(userRole)}</div>
      </div>

      <section className="staff-dash-hero">
        <div className="staff-dash-feature" onClick={() => navigate('/teaching')}>
          <div className="staff-dash-feature-copy">
            <span>Teaching first</span>
            <h2>Manage or request courses</h2>
            <p>Doctors and TAs can view assigned courses, manage class work, and request to teach additional courses from the course catalog.</p>
          </div>
          <div className="staff-dash-feature-art">TC</div>
        </div>
        <div className="staff-dash-mini-panel">
          <h3>Course Requests</h3>
          <p>Need access to a course? Open the Teaching Console and request to teach it.</p>
          <button onClick={() => navigate('/teaching?section=catalog')}>Browse Courses</button>
        </div>
      </section>

      <section className="staff-dash-grid">
        {dashboardOptions.map((option, index) => {
          const theme = cardThemes[index % cardThemes.length];
          return (
            <article 
              key={option.title} 
              className="staff-dash-card" 
              style={{ background: theme.bg }} 
              onClick={() => navigate(option.path)}
            >
              <div className="staff-dash-card-art" style={{ background: theme.art }}>{option.icon}</div>
              <div className="staff-dash-card-body">
                <h3>{option.title}</h3>
                <p>{option.description}</p>
              </div>
              <button className="staff-dash-card-arrow" style={{ background: theme.arrow }}>›</button>
            </article>
          );
        })}
      </section>

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="staff-modal-overlay" onClick={() => setShowMaintenanceModal(false)}>
          <div className="staff-modal" onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h2>Report Maintenance Issue</h2>
              <button className="staff-modal-close" onClick={() => setShowMaintenanceModal(false)}>×</button>
            </div>
            <form onSubmit={handleMaintenanceSubmit}>
              <div className="staff-modal-body">
                {notice && (
                  <div className={`staff-notice staff-notice-${notice.type}`}>
                    {notice.message}
                  </div>
                )}
                <div className="staff-form-group">
                  <label>Room / Hall</label>
                  <select
                    value={maintenanceForm.roomId}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, roomId: e.target.value })}
                    required
                  >
                    <option value="">Select a room or lab</option>
                    {halls.map((hall) => (
                      <option key={hall.HallID} value={hall.HallID}>
                        {hall.HallName} (Capacity: {hall.Capacity})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="staff-form-group">
                  <label>Issue Description</label>
                  <textarea
                    value={maintenanceForm.description}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                    placeholder="Describe the maintenance issue (e.g., projector not working, broken chair, AC not cooling, lab equipment malfunction)..."
                    rows="5"
                    required
                  />
                </div>
              </div>
              <div className="staff-modal-footer">
                <button type="button" onClick={() => setShowMaintenanceModal(false)}>Cancel</button>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Report Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}