import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost, apiPut } from '../api';
import NotificationToast from '../Components/NotificationToast';
import '../css/AdminDashboard.css';

function studentName(student) {
  return `${student.GivenName || ''} ${student.FamilyName || ''}`.trim() || student.Username;
}

const STATUS_COLORS = {
  Submitted: '#3b82f6',
  'In Review': '#f59e0b',
  Accepted: '#10b981',
  Rejected: '#ef4444'
};

function parseDocuments(raw) {
  if (Array.isArray(raw)) return raw;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AdminOffice() {
  const [officeData, setOfficeData] = useState({ students: [], transcripts: [], applications: [] });
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [recordForm, setRecordForm] = useState({ givenName: '', familyName: '', department: '' });
  const [transcriptForm, setTranscriptForm] = useState({ studentId: '', semester: 'Spring 2026', gpa: '' });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewApp, setReviewApp] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const selectedStudent = useMemo(
    () => officeData.students.find((student) => Number(student.UserID) === Number(selectedStudentId)),
    [officeData.students, selectedStudentId]
  );

  const loadOffice = useCallback(async () => {
    const data = await apiGet('/api/admin/office');
    setOfficeData(data);
    if (!selectedStudentId && data.students.length) {
      setSelectedStudentId(data.students[0].UserID);
      setTranscriptForm((current) => ({ ...current, studentId: data.students[0].UserID }));
      setRecordForm({
        givenName: data.students[0].GivenName || '',
        familyName: data.students[0].FamilyName || '',
        department: data.students[0].Department || ''
      });
    }
  }, [selectedStudentId]);

  useEffect(() => {
    loadOffice()
      .catch((err) => setToast({ type: 'error', message: err.message || 'Unable to load office tools.' }))
      .finally(() => setLoading(false));
  }, [loadOffice]);

  useEffect(() => {
    if (!selectedStudent) return;
    setRecordForm({
      givenName: selectedStudent.GivenName || '',
      familyName: selectedStudent.FamilyName || '',
      department: selectedStudent.Department || ''
    });
    setTranscriptForm((current) => ({ ...current, studentId: selectedStudent.UserID }));
  }, [selectedStudent]);

  const handleRecordSubmit = async (event) => {
    event.preventDefault();
    try {
      await apiPut(`/api/admin/students/${selectedStudentId}`, recordForm);
      await loadOffice();
      setToast({ type: 'success', message: 'Student record updated.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Unable to update student record.' });
    }
  };

  const handleTranscriptSubmit = async (event) => {
    event.preventDefault();
    try {
      await apiPost('/api/admin/transcripts', transcriptForm);
      await loadOffice();
      setToast({ type: 'success', message: 'Transcript generated.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Unable to generate transcript.' });
    }
  };

  const handleApplicationStatus = async (applicationId, status) => {
    try {
      const updated = await apiPut(`/api/admin/admissions/${applicationId}`, { status });
      await loadOffice();
      setReviewApp((current) => (current && current.ApplicationID === applicationId ? { ...current, ...updated, Status: status } : current));
      setToast({
        type: 'success',
        message: status === 'Accepted'
          ? `✓ Application accepted.`
          : status === 'Rejected'
            ? `Application rejected.`
            : 'Application status updated.'
      });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Unable to update application.' });
    }
  };

  const filteredApplications = useMemo(() => {
    if (statusFilter === 'All') return officeData.applications;
    return officeData.applications.filter((app) => app.Status === statusFilter);
  }, [officeData.applications, statusFilter]);

  if (loading) {
    return <div className="admin-dashboard"><p className="admin-loading">Loading office automation...</p></div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <p className="admin-kicker">Administrative Office Automation</p>
          <h1>Office Tools</h1>
        </div>
      </header>

      <section className="admin-module-grid admin-office-grid">
        <article className="admin-module admin-module-blue">
          <div className="admin-module-top"><h2>Student Records</h2><span>{officeData.students.length}</span></div>
          <p className="admin-office-copy">Update student identity and department records without paper forms.</p>
        </article>
        <article className="admin-module admin-module-green">
          <div className="admin-module-top"><h2>Transcripts</h2><span>{officeData.transcripts.length}</span></div>
          <p className="admin-office-copy">Generate transcript records with semester and GPA metadata.</p>
        </article>
        <article className="admin-module admin-module-rose">
          <div className="admin-module-top"><h2>Admissions</h2><span>{officeData.applications.length}</span></div>
          <p className="admin-office-copy">Move admission applications through review, acceptance, or rejection.</p>
        </article>
      </section>

      <section className="admin-two-column">
        <article className="admin-panel">
          <div className="admin-panel-head">
            <h2>Manage Student Record</h2>
          </div>
          <form className="admin-office-form" onSubmit={handleRecordSubmit}>
            <select value={selectedStudentId} onChange={(event) => setSelectedStudentId(event.target.value)} required>
              {officeData.students.map((student) => (
                <option key={student.UserID} value={student.UserID}>{studentName(student)}</option>
              ))}
            </select>
            <input value={recordForm.givenName} onChange={(event) => setRecordForm({ ...recordForm, givenName: event.target.value })} placeholder="Given name" required />
            <input value={recordForm.familyName} onChange={(event) => setRecordForm({ ...recordForm, familyName: event.target.value })} placeholder="Family name" required />
            <input value={recordForm.department} onChange={(event) => setRecordForm({ ...recordForm, department: event.target.value })} placeholder="Department" />
            <button type="submit">Update Record</button>
          </form>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-head">
            <h2>Generate Transcript</h2>
          </div>
          <form className="admin-office-form" onSubmit={handleTranscriptSubmit}>
            <select value={transcriptForm.studentId} onChange={(event) => setTranscriptForm({ ...transcriptForm, studentId: event.target.value })} required>
              {officeData.students.map((student) => (
                <option key={student.UserID} value={student.UserID}>{studentName(student)}</option>
              ))}
            </select>
            <input value={transcriptForm.semester} onChange={(event) => setTranscriptForm({ ...transcriptForm, semester: event.target.value })} placeholder="Semester" required />
            <input type="number" min="0" max="4" step="0.01" value={transcriptForm.gpa} onChange={(event) => setTranscriptForm({ ...transcriptForm, gpa: event.target.value })} placeholder="GPA" />
            <button type="submit">Generate Transcript</button>
          </form>
        </article>
      </section>

      <section className="admin-two-column">
        <article className="admin-panel">
          <div className="admin-panel-head"><h2>Recent Transcripts</h2></div>
          <div className="admin-office-list">
            {officeData.transcripts.slice(0, 8).map((transcript) => (
              <div key={transcript.TranscriptID} className="admin-office-row">
                <div>
                  <strong>{transcript.StudentName}</strong>
                  <span>{transcript.Semester} · GPA {transcript.GPA ?? 'N/A'}</span>
                </div>
                <em>{transcript.PDFPath}</em>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2>Admission Applications</h2>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
              <option>All</option>
              <option>Submitted</option>
              <option>In Review</option>
              <option>Accepted</option>
              <option>Rejected</option>
            </select>
          </div>
          <div className="admin-office-list">
            {filteredApplications.length === 0 && (
              <div className="admin-office-row"><em>No applications match this filter.</em></div>
            )}
            {filteredApplications.map((application) => (
              <div
                key={application.ApplicationID}
                className="admin-office-row"
                onClick={() => setReviewApp(application)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <strong>{application.ApplicantName}</strong>
                  <span>{application.Program} · {application.Email || 'no email'}</span>
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: STATUS_COLORS[application.Status] || '#6b7280',
                  color: 'white',
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}>
                  {application.Status}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>

      {reviewApp && (
        <div
          onClick={() => setReviewApp(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: '14px', padding: '28px',
              maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Review Application</p>
                <h2 style={{ margin: '4px 0 6px', color: '#111827' }}>{reviewApp.ApplicantName}</h2>
                <span style={{
                  display: 'inline-block', padding: '4px 12px', borderRadius: '999px',
                  background: STATUS_COLORS[reviewApp.Status] || '#6b7280', color: 'white',
                  fontWeight: 600, fontSize: '0.78rem'
                }}>{reviewApp.Status}</span>
              </div>
              <button
                onClick={() => setReviewApp(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.6rem', cursor: 'pointer', color: '#6b7280', lineHeight: 1 }}
              >×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 18px', background: '#f9fafb', padding: '16px', borderRadius: '10px', fontSize: '0.92rem' }}>
              <div><strong style={{ color: '#374151' }}>Email:</strong><div style={{ color: '#111827' }}>{reviewApp.Email || '—'}</div></div>
              <div><strong style={{ color: '#374151' }}>Phone:</strong><div style={{ color: '#111827' }}>{reviewApp.Phone || '—'}</div></div>
              <div><strong style={{ color: '#374151' }}>National ID:</strong><div style={{ color: '#111827' }}>{reviewApp.NationalID || '—'}</div></div>
              <div><strong style={{ color: '#374151' }}>Date of Birth:</strong><div style={{ color: '#111827' }}>{reviewApp.DateOfBirth || '—'}</div></div>
              <div><strong style={{ color: '#374151' }}>Program:</strong><div style={{ color: '#111827' }}>{reviewApp.Program}</div></div>
              <div><strong style={{ color: '#374151' }}>Submitted:</strong><div style={{ color: '#111827' }}>{reviewApp.SubmittedAt ? new Date(reviewApp.SubmittedAt).toLocaleString() : '—'}</div></div>
              <div><strong style={{ color: '#374151' }}>High School:</strong><div style={{ color: '#111827' }}>{reviewApp.HighSchool || '—'}</div></div>
              <div><strong style={{ color: '#374151' }}>GPA / Score:</strong><div style={{ color: '#111827' }}>{reviewApp.HighSchoolGPA || '—'}</div></div>
              <div style={{ gridColumn: '1 / span 2' }}>
                <strong style={{ color: '#374151' }}>Tracking Code:</strong>
                <div style={{ color: '#111827', fontFamily: 'monospace' }}>{reviewApp.TrackingCode || '—'}</div>
              </div>
            </div>

            {reviewApp.PersonalStatement && (
              <div style={{ marginTop: '14px' }}>
                <strong style={{ color: '#374151' }}>Personal Statement</strong>
                <p style={{ margin: '6px 0 0', padding: '12px 14px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', whiteSpace: 'pre-wrap', color: '#1f2937', fontSize: '0.92rem' }}>
                  {reviewApp.PersonalStatement}
                </p>
              </div>
            )}

            <div style={{ marginTop: '14px' }}>
              <strong style={{ color: '#374151' }}>Documents ({parseDocuments(reviewApp.Documents).length})</strong>
              {parseDocuments(reviewApp.Documents).length === 0 ? (
                <p style={{ margin: '6px 0 0', color: '#9ca3af', fontStyle: 'italic' }}>No documents uploaded.</p>
              ) : (
                <ul style={{ margin: '6px 0 0', padding: '12px 18px', background: '#f9fafb', borderRadius: '8px', listStyle: 'none' }}>
                  {parseDocuments(reviewApp.Documents).map((doc, idx) => (
                    <li key={idx} style={{ padding: '4px 0', color: '#374151', fontSize: '0.9rem' }}>
                      📎 {doc.name} <span style={{ color: '#9ca3af' }}>({Math.round((doc.size || 0) / 1024)} KB)</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => handleApplicationStatus(reviewApp.ApplicationID, 'In Review')}
                style={{
                  padding: '12px 16px', flex: '0 0 auto', background: '#f3f4f6',
                  border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer',
                  fontWeight: 600, color: '#374151'
                }}
              >
                Mark In Review
              </button>
              <button
                onClick={() => handleApplicationStatus(reviewApp.ApplicationID, 'Rejected')}
                style={{
                  padding: '12px', flex: 1, background: '#ef4444', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700,
                  fontSize: '0.95rem'
                }}
              >
                ✗ Reject
              </button>
              <button
                onClick={() => handleApplicationStatus(reviewApp.ApplicationID, 'Accepted')}
                style={{
                  padding: '12px', flex: 1, background: '#10b981', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700,
                  fontSize: '0.95rem'
                }}
              >
                ✓ Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <NotificationToast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
