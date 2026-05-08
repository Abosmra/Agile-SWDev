import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../api';

const initialForm = {
  applicantName: '',
  email: '',
  phone: '',
  nationalId: '',
  dateOfBirth: '',
  highSchool: '',
  highSchoolGPA: '',
  program: '',
  personalStatement: ''
};

const STATUS_COLORS = {
  Submitted: '#3b82f6',
  'In Review': '#f59e0b',
  Accepted: '#10b981',
  Rejected: '#ef4444'
};

export default function Applicant() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('apply');
  const [form, setForm] = useState(initialForm);
  const [documents, setDocuments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState('');

  const [trackCode, setTrackCode] = useState('');
  const [tracked, setTracked] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [trackError, setTrackError] = useState('');

  useEffect(() => {
    apiGet('/api/admissions/programs')
      .then(setPrograms)
      .catch(() => setPrograms(['Computer Engineering', 'Software Engineering', 'Computer Science']));
  }, []);

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const docs = files.slice(0, 10).map((file) => ({
      name: file.name,
      type: file.type || 'Document',
      size: file.size
    }));
    setDocuments(docs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.applicantName.trim() || !form.email.trim() || !form.program.trim()) {
      setError('Please fill in your name, email, and program.');
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailOk) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await apiPost('/api/applications', { ...form, documents });
      setSubmission(result);
      setForm(initialForm);
      setDocuments([]);
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    setTrackError('');
    setTracked(null);
    if (!trackCode.trim()) {
      setTrackError('Enter your tracking code.');
      return;
    }
    setTracking(true);
    try {
      const result = await apiGet(`/api/applications/track/${encodeURIComponent(trackCode.trim())}`);
      setTracked(result);
    } catch (err) {
      setTrackError(err.message || 'Could not find that application.');
    } finally {
      setTracking(false);
    }
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  };

  const labelStyle = { display: 'block', fontWeight: 600, marginBottom: '6px', color: '#374151', fontSize: '0.9rem' };

  if (submission) {
    const app = submission.application;
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', ...cardStyle }}>
          <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '12px' }}>✅</div>
          <h2 style={{ textAlign: 'center', color: '#111827', margin: '0 0 12px' }}>Application Submitted!</h2>
          <p style={{ textAlign: 'center', color: '#6b7280', margin: '0 0 24px' }}>{submission.message}</p>

          <div style={{ background: '#f0f7ff', border: '1px solid #c7dafb', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <p style={{ margin: '0 0 6px', color: '#6b7280', fontSize: '0.85rem' }}>Your tracking code</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold', color: '#1d4ed8', letterSpacing: '1px' }}>{app.trackingCode}</p>
            <p style={{ margin: '8px 0 0', color: '#475569', fontSize: '0.85rem' }}>Save this code to check your status later.</p>
          </div>

          <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
            <p style={{ margin: '4px 0' }}><strong>Name:</strong> {app.applicantName}</p>
            <p style={{ margin: '4px 0' }}><strong>Program:</strong> {app.program}</p>
            <p style={{ margin: '4px 0' }}><strong>Email:</strong> {app.email}</p>
            <p style={{ margin: '4px 0' }}><strong>Status:</strong> <span style={{ color: STATUS_COLORS[app.status] }}>{app.status}</span></p>
            <p style={{ margin: '4px 0' }}><strong>Documents uploaded:</strong> {app.documents.length}</p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => { setSubmission(null); setMode('apply'); }} style={{ flex: 1, padding: '12px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Submit another</button>
            <button onClick={() => navigate('/login')} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Go to Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>← Back to Login</button>
          <h1 style={{ color: 'white', margin: 0 }}>Applicant Portal</h1>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '6px', display: 'flex', gap: '6px', marginBottom: '20px' }}>
          <button
            onClick={() => setMode('apply')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              background: mode === 'apply' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
              color: mode === 'apply' ? 'white' : '#6b7280'
            }}
          >
            New Application
          </button>
          <button
            onClick={() => setMode('track')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              background: mode === 'track' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
              color: mode === 'track' ? 'white' : '#6b7280'
            }}
          >
            Track Application
          </button>
        </div>

        {mode === 'apply' ? (
          <form onSubmit={handleSubmit} style={cardStyle}>
            <h2 style={{ color: '#111827', margin: '0 0 6px' }}>Submit Online Application</h2>
            <p style={{ color: '#6b7280', margin: '0 0 24px' }}>Fill in the details below. We'll send a tracking code so you can follow your status.</p>

            {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

            <h3 style={{ color: '#374151', margin: '20px 0 12px', fontSize: '1rem' }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input style={inputStyle} value={form.applicantName} onChange={updateField('applicantName')} required />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input type="email" style={inputStyle} value={form.email} onChange={updateField('email')} required />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} value={form.phone} onChange={updateField('phone')} />
              </div>
              <div>
                <label style={labelStyle}>National ID</label>
                <input style={inputStyle} value={form.nationalId} onChange={updateField('nationalId')} />
              </div>
              <div>
                <label style={labelStyle}>Date of Birth</label>
                <input type="date" style={inputStyle} value={form.dateOfBirth} onChange={updateField('dateOfBirth')} />
              </div>
            </div>

            <h3 style={{ color: '#374151', margin: '24px 0 12px', fontSize: '1rem' }}>Academic Background</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>High School</label>
                <input style={inputStyle} value={form.highSchool} onChange={updateField('highSchool')} />
              </div>
              <div>
                <label style={labelStyle}>High School GPA / Score</label>
                <input style={inputStyle} value={form.highSchoolGPA} onChange={updateField('highSchoolGPA')} />
              </div>
            </div>

            <h3 style={{ color: '#374151', margin: '24px 0 12px', fontSize: '1rem' }}>Program Choice</h3>
            <div>
              <label style={labelStyle}>Major / Program *</label>
              <select style={inputStyle} value={form.program} onChange={updateField('program')} required>
                <option value="">Select a program...</option>
                {programs.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: '14px' }}>
              <label style={labelStyle}>Personal Statement</label>
              <textarea
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Tell us briefly why you want to join this program..."
                value={form.personalStatement}
                onChange={updateField('personalStatement')}
              />
            </div>

            <h3 style={{ color: '#374151', margin: '24px 0 12px', fontSize: '1rem' }}>Upload Documents</h3>
            <p style={{ margin: '0 0 8px', color: '#6b7280', fontSize: '0.85rem' }}>ID, certificates, transcripts (max 10 files).</p>
            <input
              type="file"
              multiple
              onChange={handleFiles}
              style={{ ...inputStyle, padding: '8px' }}
            />
            {documents.length > 0 && (
              <ul style={{ margin: '10px 0 0', padding: '12px 18px', background: '#f9fafb', borderRadius: '8px', listStyle: 'none' }}>
                {documents.map((doc, idx) => (
                  <li key={idx} style={{ padding: '4px 0', color: '#374151', fontSize: '0.9rem' }}>
                    📎 {doc.name} <span style={{ color: '#9ca3af' }}>({Math.round(doc.size / 1024)} KB)</span>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: '24px',
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: submitting ? 'wait' : 'pointer',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        ) : (
          <div style={cardStyle}>
            <h2 style={{ color: '#111827', margin: '0 0 6px' }}>Track Your Application</h2>
            <p style={{ color: '#6b7280', margin: '0 0 20px' }}>Enter the tracking code you received when you submitted.</p>

            <form onSubmit={handleTrack} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input
                placeholder="APP-XXXX-XXXX"
                value={trackCode}
                onChange={(e) => setTrackCode(e.target.value)}
                style={{ ...inputStyle, fontFamily: 'monospace' }}
              />
              <button
                type="submit"
                disabled={tracking}
                style={{ padding: '0 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                {tracking ? '...' : 'Track'}
              </button>
            </form>

            {trackError && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px' }}>{trackError}</div>}

            {tracked && (
              <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '999px', background: STATUS_COLORS[tracked.status] || '#6b7280', color: 'white', fontWeight: 600, fontSize: '0.85rem', marginBottom: '14px' }}>
                  {tracked.status}
                </div>
                <p style={{ margin: '6px 0' }}><strong>Applicant:</strong> {tracked.applicantName}</p>
                <p style={{ margin: '6px 0' }}><strong>Program:</strong> {tracked.program}</p>
                <p style={{ margin: '6px 0' }}><strong>Submitted:</strong> {new Date(tracked.submittedAt).toLocaleString()}</p>
                <p style={{ margin: '6px 0' }}><strong>Documents:</strong> {tracked.documents.length}</p>
                {tracked.statusMessage && (
                  <p style={{ margin: '12px 0 0', padding: '12px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', color: '#374151' }}>
                    {tracked.statusMessage}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
