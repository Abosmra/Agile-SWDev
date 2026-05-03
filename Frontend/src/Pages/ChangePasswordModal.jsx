import React, { useState } from 'react';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New passwords do not match!");
      return;
    }
    // Handle password update logic here
    alert("Password updated successfully!");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="auth-container modal-content">
        <h2>Change Password</h2>
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Current Password</label>
            <input 
              type="password" 
              name="oldPassword" 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input 
              type="password" 
              name="newPassword" 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input 
              type="password" 
              name="confirmPassword" 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-submit">Update</button>
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}