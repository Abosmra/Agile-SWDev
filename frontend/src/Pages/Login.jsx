import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoleContext } from '../context/RoleContext';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setRole: setUserRole } = useContext(RoleContext);

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Please fill all fields!');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address!');
      return;
    }

    // Password validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters!');
      return;
    }

    console.log('Login attempt:', { email, password, role });
    setUserRole(role);
    onLogin();
    navigate(role === 'staff' ? '/staff-dashboard' : '/courses');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Log In</h1>
        
        {/* Role Selection */}
        <div className="role-selection">
          <label>Select Role:</label>
          <div className="role-buttons">
            <button
              type="button"
              className={`role-btn ${role === 'student' ? 'active' : ''}`}
              onClick={() => setRole('student')}
            >
              👨‍🎓 Student
            </button>
            <button
              type="button"
              className={`role-btn ${role === 'staff' ? 'active' : ''}`}
              onClick={() => setRole('staff')}
            >
              👨‍💼 Staff
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-submit"
            disabled={!isFormValid}
          >
            Log In
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <a href="/signup">Create Account</a>
        </p>
      </div>
    </div>
  );
}
