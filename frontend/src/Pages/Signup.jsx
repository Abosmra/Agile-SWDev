import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RoleContext } from '../context/RoleContext';
import { apiPost } from '../api';

export default function Signup({ onLogin }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setRole: setUserRole } = useContext(RoleContext);

  const isFormValid = 
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.password.trim() !== '' &&
    formData.confirmPassword.trim() !== '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setError('Please fill all fields to create an account.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      await apiPost('/api/signup', {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role
      });
      setUserRole(role);
      onLogin();
      navigate(role === 'staff' ? '/staff-dashboard' : '/courses');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container auth-container-signup">

        <div className="signup-wrapper">
          {/* Left: Role Selection */}
          <div className="signup-left">
            <h1>Create Account</h1>
            <div className="role-selection-vertical">
              <label>Select your role:</label>
              <button
                type="button"
                className={`role-btn-vertical ${role === 'student' ? 'active' : ''}`}
                onClick={() => setRole('student')}
              >
                <span className="role-icon">👨‍🎓</span>
                <span>Student</span>
              </button>
              <button
                type="button"
                className={`role-btn-vertical ${role === 'staff' ? 'active' : ''}`}
                onClick={() => setRole('staff')}
              >
                <span className="role-icon">👨‍💼</span>
                <span>Staff</span>
              </button>
            </div>
          </div>

          {/* Right: Form */}
          <form onSubmit={handleSubmit} className="auth-form signup-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="given-name">First Name</label>
                <input
                  type="text"
                  id="given-name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="First name"
                  autoComplete="given-name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="family-name">Last Name</label>
                <input
                  type="text"
                  id="family-name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Last name"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="new-password">Password</label>
                <input
                  type="password"
                  id="new-password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Password"
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm</label>
                <input
                  type="password"
                  id="confirm-password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm"
                  autoComplete="new-password"
                />
              </div>
            </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={!isFormValid}
          >
            Create Account
          </button>
          {error && <div className="error-message">{error}</div>}
        </form>
        </div>

        <div className="signup-footer">
          <p>Already have an account? <Link to="/login">Log In</Link></p>
        </div>
      </div>
    </div>
  );
}
