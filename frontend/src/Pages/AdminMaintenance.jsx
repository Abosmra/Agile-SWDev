import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api';
import '../css/AdminDashboard.css';

export default function AdminMaintenance() {
  const [requests, setRequests] = useState([]);
  const [halls, setHalls] = useState([]);
  const [form, setForm] = useState({ roomId: '', description: '', status: 'open' });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    const [maintenanceData, hallsData] = await Promise.all([
      apiGet('/api/admin/maintenance'),
      apiGet('/api/halls')
    ]);
    setRequests(maintenanceData);
    setHalls(hallsData);
  };

  useEffect(() => {
    loadData().catch((err) => setError(err.message || 'Unable to load maintenance.'));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setNotice('');
    setError('');

    try {
      await apiPost('/api/admin/maintenance', form);
      setForm({ roomId: '', description: '', status: 'open' });
      await loadData();
      setNotice('Maintenance request added.');
    } catch (err) {
      setError(err.message || 'Unable to add maintenance request.');
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <p className="admin-kicker">Facilities Operations</p>
          <h1>Maintenance</h1>
        </div>
      </header>

      {error && <p className="admin-error">{error}</p>}
      {notice && <p className="admin-success">{notice}</p>}

      <section className="admin-panel">
        <div className="admin-panel-head">
          <h2>Add Maintenance Request</h2>
          <span>{requests.filter((request) => request.Status !== 'closed').length} open</span>
        </div>
        <form className="admin-maintenance-form admin-maintenance-form-page" onSubmit={submit}>
          <select
            value={form.roomId}
            onChange={(event) => setForm({ ...form, roomId: event.target.value })}
            required
          >
            <option value="">Room or lab</option>
            {halls.map((hall) => (
              <option key={hall.HallID} value={hall.HallID}>{hall.HallName}</option>
            ))}
          </select>
          <select
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
          >
            <option value="open">Open</option>
            <option value="in progress">In progress</option>
            <option value="closed">Closed</option>
          </select>
          <input
            type="text"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            placeholder="Maintenance issue"
            required
          />
          <button type="submit">Add</button>
        </form>
      </section>

      <section className="admin-panel admin-spaced-panel">
        <div className="admin-panel-head">
          <h2>All Maintenance Requests</h2>
          <span>{requests.length} total</span>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Issue</th>
                <th>Status</th>
                <th>Reported By</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {requests.length ? requests.map((request) => (
                <tr key={request.RequestID}>
                  <td>{request.HallName}</td>
                  <td>{request.Description}</td>
                  <td>{request.Status}</td>
                  <td>{request.ReportedBy}</td>
                  <td>{request.ReportedDate}</td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="admin-empty-cell">No maintenance requests</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
