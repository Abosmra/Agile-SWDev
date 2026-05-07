import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost, apiPut } from '../api';
import NotificationToast from '../Components/NotificationToast';
import '../css/AdminDashboard.css';

function studentName(student) {
  return `${student.GivenName || ''} ${student.FamilyName || ''}`.trim() || student.Username;
}

export default function AdminOffice() {
  const [officeData, setOfficeData] = useState({ students: [], transcripts: [], applications: [] });
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [recordForm, setRecordForm] = useState({ givenName: '', familyName: '', department: '' });
  const [transcriptForm, setTranscriptForm] = useState({ studentId: '', semester: 'Spring 2026', gpa: '' });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

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
      await apiPut(`/api/admin/admissions/${applicationId}`, { status });
      await loadOffice();
      setToast({ type: 'success', message: 'Application status updated.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Unable to update application.' });
    }
  };

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
          <div className="admin-panel-head"><h2>Admission Applications</h2></div>
          <div className="admin-office-list">
            {officeData.applications.map((application) => (
              <div key={application.ApplicationID} className="admin-office-row">
                <div>
                  <strong>{application.ApplicantName}</strong>
                  <span>{application.Program} · {application.Status}</span>
                </div>
                <select value={application.Status} onChange={(event) => handleApplicationStatus(application.ApplicationID, event.target.value)}>
                  <option>Submitted</option>
                  <option>In Review</option>
                  <option>Accepted</option>
                  <option>Rejected</option>
                </select>
              </div>
            ))}
          </div>
        </article>
      </section>

      {toast && <NotificationToast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
