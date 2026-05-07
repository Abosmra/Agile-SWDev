import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../api';
import '../css/AdminDashboard.css';

export default function AdminPerformance() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    apiGet('/api/admin/staff-performance')
      .then(data => {
        setStaff(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const updateStaff = async (staffId, updates) => {
    try {
      await apiPost('/api/admin/update-staff-performance', { staffId, ...updates });
      setStaff(prev => prev.map(s => s.StaffID === staffId ? { ...s, ...updates } : s));
      setNotice('Staff updated successfully');
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      console.error(err);
      setNotice('Failed to update staff');
      setTimeout(() => setNotice(''), 3000);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-performance-page">
      <div className="admin-header">
        <p className="admin-kicker">Staff Management</p>
        <h1>Performance Tracking</h1>
      </div>
      {notice && <div className="notice">{notice}</div>}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Performance Score</th>
              <th>Research</th>
              <th>Professional Development</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.StaffID}>
                <td>{member.Name}</td>
                <td>{member.Role}</td>
                <td>{member.Department}</td>
                <td>
                  <input
                    type="number"
                    value={member.PerformanceScore || 0}
                    onChange={(e) => setStaff(prev => prev.map(s => s.StaffID === member.StaffID ? { ...s, PerformanceScore: Number(e.target.value) } : s))}
                  />
                </td>
                <td>
                  <textarea
                    value={member.Research || ''}
                    onChange={(e) => setStaff(prev => prev.map(s => s.StaffID === member.StaffID ? { ...s, Research: e.target.value } : s))}
                    rows="2"
                  />
                </td>
                <td>
                  <textarea
                    value={member.ProfessionalDevelopment || ''}
                    onChange={(e) => setStaff(prev => prev.map(s => s.StaffID === member.StaffID ? { ...s, ProfessionalDevelopment: e.target.value } : s))}
                    rows="2"
                  />
                </td>
                <td>
                  <button onClick={() => updateStaff(member.StaffID, {
                    PerformanceScore: member.PerformanceScore,
                    Research: member.Research,
                    ProfessionalDevelopment: member.ProfessionalDevelopment
                  })}>
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}