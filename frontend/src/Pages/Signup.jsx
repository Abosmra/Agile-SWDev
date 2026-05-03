import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoleContext } from '../context/RoleContext';

export default function Signup({ onLogin }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [role, setRole] = useState('student');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isFormValid) {
      alert('Please fill all fields!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    console.log('Signup data:', formData, 'Role:', role);
    setUserRole(role);
    onLogin();
    navigate(role === 'staff' ? '/staff-dashboard' : '/courses');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        
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

        <h1>Create Account</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Enter your first name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Enter your last name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm password"
            />
          </div>

          <button 
            type="submit" 
            className="btn-submit"
            disabled={!isFormValid}
          >
            Create Account
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <a href="/login">Log In</a>
        </p>
      </div>
    </div>
  );
}
