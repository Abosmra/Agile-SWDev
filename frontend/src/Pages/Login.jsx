import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RoleContext } from '../context/RoleContext';
import { ProfileContext } from '../context/ProfileContext';
import { apiPost } from '../api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setRole: setUserRole } = useContext(RoleContext);
  const { updateProfile } = useContext(ProfileContext);

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Please fill all fields!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address!');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters!');
      return;
    }

    try {
      const user = await apiPost('/api/login', {
        username: email,
        password
      });

      const normalizedRole = user.Role ? user.Role.toLowerCase() : 'student';
      setUserRole(normalizedRole);
      updateProfile({ email: user.Username, role: user.Role });
      onLogin();
      navigate(normalizedRole === 'staff' ? '/staff-dashboard' : '/courses');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Log In</h1>
        
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
          Don't have an account? <Link to="/signup">Create Account</Link>
        </p>
      </div>
    </div>
  );
}
