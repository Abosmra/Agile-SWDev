import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../api';
import '../css/Halls.css'; // Reusing existing Halls.css styles

export default function ReportMaintenance() {
  const navigate = useNavigate();
  const [halls, setHalls] = useState([]);
  const [maintenanceForm, setMaintenanceForm] = useState({ roomId: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const data = await apiGet('/api/halls');
        setHalls(data);
      } catch (err) {
        console.error('Failed to load halls:', err);
        setNotice({ type: 'error', message: 'Failed to load rooms and labs.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchHalls();
  }, []);

  const handleSubmit = async (e) => {
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
        navigate('/staff-dashboard');
      }, 2000);
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Failed to report maintenance issue.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="halls-page">
      <header className="halls-hero">
        <div>
          <p className="halls-kicker">Facilities Management</p>
          <h1>Report Maintenance Issue</h1>
          <p>Submit maintenance requests for classrooms, labs, or equipment.</p>
        </div>
        <button type="button" onClick={() => navigate('/staff-dashboard')}>
          ← Back to Dashboard
        </button>
      </header>

      {isLoading ? (
        <p className="halls-muted">Loading rooms and labs...</p>
      ) : (
        <section className="maintenance-panel">
          <form onSubmit={handleSubmit}>
            {notice && (
              <div className={`notice ${notice.type === 'success' ? 'admin-success' : 'admin-error'}`} style={{ marginBottom: '20px' }}>
                {notice.message}
              </div>
            )}
            
            <label>
              <span>Room / Hall *</span>
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
            </label>

            <label>
              <span>Issue Description *</span>
              <textarea
                value={maintenanceForm.description}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                placeholder="Describe the maintenance issue in detail...
Examples:
- Projector not displaying image in Hall A
- Broken chair in Room 203 (row 3, seat 2)
- AC not cooling in Lab B
- Computer #5 won't turn on
- Whiteboard needs replacement"
                rows="6"
                required
              />
            </label>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button type="button" onClick={() => navigate('/staff-dashboard')} style={{ background: '#eef2ff', color: '#4b3fa0' }}>
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Report Issue'}
              </button>
            </div>
          </form>

          <div>
            <h2>What can I report?</h2>
            <p>Use this form to report any maintenance issues you notice around campus:</p>
            <div className="booking-usage-row">
              <strong>Equipment Issues</strong>
              <span>Projectors, computers, printers, lab devices</span>
            </div>
            <div className="booking-usage-row">
              <strong>Furniture Problems</strong>
              <span>Broken chairs, damaged desks, whiteboard issues</span>
            </div>
            <div className="booking-usage-row">
              <strong>Environmental</strong>
              <span>AC not cooling, heating issues, poor lighting</span>
            </div>
            <div className="booking-usage-row">
              <strong>Other</strong>
              <span>Plumbing, electrical, cleanliness, or general repairs</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}