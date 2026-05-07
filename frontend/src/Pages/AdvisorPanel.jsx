import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../api';
import NotificationToast from '../Components/NotificationToast';
import '../css/MyServices.css';

function requestLabel(type) {
  return type === 'DropCourse' ? 'Drop Course' : 'Enrollment';
}

export default function AdvisorPanel() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const loadRequests = async () => {
    try {
      const data = await apiGet('/api/advisor/requests');
      setRequests(data);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Unable to load advisor requests.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const pendingRequests = useMemo(
    () => requests.filter((request) => request.Status === 'Pending'),
    [requests]
  );

  const reviewedRequests = useMemo(
    () => requests.filter((request) => request.Status !== 'Pending').slice(0, 8),
    [requests]
  );

  const reviewRequest = async (request, decision) => {
    try {
      await apiPost(`/api/advisor/requests/${request.RequestID}/${decision}`, {});
      setToast({
        type: decision === 'approve' ? 'success' : 'warning',
        message: `${requestLabel(request.RequestType)} request ${decision === 'approve' ? 'approved' : 'cancelled'}.`
      });
      await loadRequests();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Unable to update request.' });
    }
  };

  return (
    <div className="services-page">
      <header className="services-header">
        <h1>Advisor Panel</h1>
        <p>Review enrollment and drop-course requests assigned to you.</p>
      </header>

      <section className="service-panel">
        <div className="service-panel-header">
          <div>
            <span className="service-kicker">Pending Review</span>
            <h2>Academic Requests</h2>
          </div>
          <span className="service-count">{pendingRequests.length} pending</span>
        </div>

        {isLoading ? (
          <p className="service-muted">Loading advisor requests...</p>
        ) : pendingRequests.length === 0 ? (
          <p className="service-empty">No pending requests.</p>
        ) : (
          <div className="service-course-list">
            {pendingRequests.map((request) => (
              <article key={request.RequestID} className="service-course-item advisor-request-item">
                <div>
                  <span className="service-kicker">{requestLabel(request.RequestType)}</span>
                  <h3>{request.CourseName}</h3>
                  <p>{request.CourseCode} - {request.StudentName || request.StudentEmail}</p>
                </div>
                <div className="advisor-request-actions">
                  <button className="service-primary-btn" onClick={() => reviewRequest(request, 'approve')}>
                    Approve
                  </button>
                  <button className="service-danger-btn" onClick={() => reviewRequest(request, 'cancel')}>
                    Cancel
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="service-panel advisor-history-panel">
        <div className="service-panel-header">
          <div>
            <span className="service-kicker">Recent Decisions</span>
            <h2>Reviewed Requests</h2>
          </div>
        </div>

        {reviewedRequests.length === 0 ? (
          <p className="service-empty">No reviewed requests yet.</p>
        ) : (
          <div className="service-course-list">
            {reviewedRequests.map((request) => (
              <article key={request.RequestID} className="service-course-item">
                <div>
                  <h3>{request.CourseName}</h3>
                  <p>{requestLabel(request.RequestType)} - {request.StudentName || request.StudentEmail}</p>
                </div>
                <span className={`advisor-status advisor-status-${request.Status.toLowerCase()}`}>
                  {request.Status}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>

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
