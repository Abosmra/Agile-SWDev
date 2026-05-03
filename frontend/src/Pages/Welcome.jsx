import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-page">
      <div className="welcome-container">
        <h1>Welcome to LMS</h1>
        <p className="welcome-subtitle">Learning Management System</p>
        
        <div className="welcome-buttons">
          <button 
            className="btn-primary"
            onClick={() => navigate('/login')}
          >
            Log In
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/signup')}
          >
            Create Account
          </button>
        </div>

        <div className="welcome-info">
          <p>Access your courses, announcements, and connect with instructors.</p>
        </div>
      </div>
    </div>
  );
}
