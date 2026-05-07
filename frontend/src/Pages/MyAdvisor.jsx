import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api';
import NotificationToast from '../Components/NotificationToast';
import '../css/MyServices.css';

export default function MyAdvisor() {
  const [advisor, setAdvisor] = useState(null);
  const [message, setMessage] = useState('');
  const [loadingAdvisor, setLoadingAdvisor] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadAdvisor = async () => {
      try {
        setLoadingAdvisor(true);
        const data = await apiGet('/api/my-advisor');
        setAdvisor(data);
      } catch (err) {
        setToast({ type: 'error', message: err.message || 'Unable to load advisor.' });
      } finally {
        setLoadingAdvisor(false);
      }
    };

    loadAdvisor();
  }, []);

  const handleSendAdvisorMessage = async (event) => {
    event.preventDefault();
    if (!advisor || !message.trim()) return;

    try {
      await apiPost('/api/messages', { toStaffId: advisor.id, body: message.trim() });
      setMessage('');
      setToast({ type: 'success', message: `Message sent to ${advisor.name}.` });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Unable to send message.' });
    }
  };

  return (
    <div className="services-page">
      <header className="services-header">
        <h1>My Advisor</h1>
        <p>View your assigned academic advisor and send a direct message.</p>
      </header>

      <div className="advisor-page-grid">
        <section className="service-panel">
          <div className="service-panel-header">
            <div>
              <span className="service-kicker">Academic Support</span>
              <h2>Advisor Profile</h2>
            </div>
          </div>

          {loadingAdvisor ? (
            <p className="service-muted">Loading your advisor...</p>
          ) : advisor ? (
            <>
              <div className="advisor-card advisor-card-large">
                <div className="advisor-avatar">{advisor.name.charAt(0)}</div>
                <div>
                  <h3>{advisor.name}</h3>
                  <p>{advisor.department}</p>
                  <span>{advisor.currentStudents}/{advisor.maxStudents} students assigned</span>
                </div>
              </div>

              <form className="advisor-message-form" onSubmit={handleSendAdvisorMessage}>
                <label htmlFor="advisor-message">Message assigned advisor</label>
                <textarea
                  id="advisor-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write your question..."
                  rows="7"
                />
                <button className="service-primary-btn" type="submit" disabled={!message.trim()}>
                  Send Message
                </button>
              </form>
            </>
          ) : (
            <p className="service-empty">No advisor is currently assigned.</p>
          )}
        </section>
      </div>

      {toast && (
        <NotificationToast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
