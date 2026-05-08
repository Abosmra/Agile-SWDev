import React, { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../api';

export default function OfficeHours() {
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet('/api/staff')
      .then((data) => {
        setStaff(
          data.map((m) => ({
            id: m.id,
            name: m.name,
            role: m.role || 'Staff',
            email: m.contact || '',
            department: m.department || 'General',
            officeHours: m.officeHours || 'By appointment',
            assignedCourses: m.assignedCourses || ''
          }))
        );
      })
      .catch((err) => setError(err.message || 'Unable to load office hours.'))
      .finally(() => setLoading(false));
  }, []);

  const roles = useMemo(() => {
    const set = new Set(staff.map((s) => s.role));
    return ['All', ...Array.from(set)];
  }, [staff]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return staff.filter(
      (s) =>
        (roleFilter === 'All' || s.role === roleFilter) &&
        (!term ||
          s.name.toLowerCase().includes(term) ||
          (s.assignedCourses || '').toLowerCase().includes(term) ||
          (s.department || '').toLowerCase().includes(term))
    );
  }, [staff, search, roleFilter]);

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#2c3e50', margin: '0 0 6px' }}>Professor Office Hours</h1>
        <p style={{ color: '#7f8c8d', margin: 0 }}>
          See when your professors and advisors are available so you can schedule meetings.
        </p>
      </div>

      <div style={{
        background: 'white',
        padding: '18px',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid #e0e0e0',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="🔍 Search by name, course, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: '1 1 260px',
            padding: '10px 14px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '0.95rem'
          }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: '10px 14px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '0.95rem',
            background: 'white'
          }}
        >
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {loading && <p style={{ color: '#7f8c8d' }}>⏳ Loading office hours...</p>}
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
          <p style={{ color: '#7f8c8d' }}>No professors match your search.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {filtered.map((member) => (
          <div
            key={member.id}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #e0e0e0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}>
                {member.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.05rem' }}>{member.name}</h3>
                <p style={{ margin: '2px 0 0', color: '#667eea', fontSize: '0.85rem', fontWeight: 600 }}>
                  {member.role} · {member.department}
                </p>
              </div>
            </div>

            <div style={{
              background: '#f0f7ff',
              border: '1px solid #d6e4fa',
              padding: '12px 14px',
              borderRadius: '8px',
              marginBottom: '10px'
            }}>
              <p style={{ margin: '0 0 4px', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🕐 Office Hours
              </p>
              <p style={{ margin: 0, color: '#1e3a8a', fontWeight: 600 }}>{member.officeHours}</p>
            </div>

            {member.assignedCourses && (
              <p style={{ margin: '8px 0 4px', color: '#475569', fontSize: '0.85rem' }}>
                <strong>Courses:</strong> {member.assignedCourses}
              </p>
            )}

            {member.email && (
              <button
                onClick={() => { window.location.href = `mailto:${member.email}?subject=Office%20Hours%20Meeting%20Request`; }}
                style={{
                  marginTop: '10px',
                  width: '100%',
                  padding: '10px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ✉️ Schedule a Meeting
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
