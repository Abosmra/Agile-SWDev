import React, { useState } from 'react';
import { apiPost } from '../api';

export default function ChangePasswordModal({ onClose }) {
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (passwords.newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      await apiPost('/api/me/password', {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });
      alert('Password updated successfully!');
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to update password.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="cp-card">
        <div className="cp-header">
          <h2>Change Password</h2>
          <button className="cp-close" onClick={onClose} type="button">✕</button>
        </div>

        {error && <div className="error-message cp-error">{error}</div>}

        <form onSubmit={handleSubmit} className="cp-form">
          <div className="cp-field">
            <label>Current Password</label>
            <input type="password" name="oldPassword" onChange={handleChange} required placeholder="Enter current password" />
          </div>
          <div className="cp-field">
            <label>New Password</label>
            <input type="password" name="newPassword" onChange={handleChange} required placeholder="Enter new password" />
          </div>
          <div className="cp-field">
            <label>Confirm New Password</label>
            <input type="password" name="confirmPassword" onChange={handleChange} required placeholder="Confirm new password" />
          </div>

          <div className="cp-actions">
            <button type="submit" className="btn-primary">Update Password</button>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
