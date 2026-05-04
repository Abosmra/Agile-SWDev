import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileContext } from '../context/ProfileContext';
import { apiPut } from '../api';

export default function EditProfile() {
  const { profileData, updateProfile } = useContext(ProfileContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: profileData.firstName,
    lastName: profileData.lastName,
    email: profileData.email,
    department: profileData.department
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || 
        !formData.email.trim() || !formData.department.trim()) {
      setError('All fields are required!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address!');
      return;
    }

    try {
      const updatedUser = await apiPut('/api/me', formData);
      updateProfile({
        userId: updatedUser.UserID,
        firstName: updatedUser.GivenName,
        lastName: updatedUser.FamilyName,
        email: updatedUser.Username,
        role: updatedUser.Role,
        department: updatedUser.Department,
        joinDate: updatedUser.JoinDate,
        enrolledCourses: updatedUser.EnrolledCourses
      });
      alert('Profile updated successfully!');
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Unable to update profile.');
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '600px' }}>
        <h1>Edit Profile</h1>
        {error && <div className="error-message">{error}</div>}
        
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
            <label htmlFor="department">Department</label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              placeholder="Enter your department"
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-submit">
              Save Changes
            </button>
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
