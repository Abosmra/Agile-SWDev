import React, { useContext, useState } from 'react';
import { ProfileContext } from '../context/ProfileContext';
import { apiPut } from '../api';

export default function EditProfile({ onClose }) {
  const { profileData, updateProfile } = useContext(ProfileContext);

  const [formData, setFormData] = useState({
    firstName: profileData.firstName,
    lastName: profileData.lastName,
    email: profileData.email,
    department: profileData.department
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName.trim() || !formData.lastName.trim() ||
        !formData.email.trim() || !formData.department.trim()) {
      setError('All fields are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      const updatedUser = await apiPut('/api/me', {
        GivenName: formData.firstName,
        FamilyName: formData.lastName,
        Department: formData.department
      });
      updateProfile({
        userId: updatedUser.UserID,
        firstName: updatedUser.GivenName,
        lastName: updatedUser.FamilyName,
        email: updatedUser.Username,
        role: updatedUser.Role,
        department: updatedUser.Department,
        joinDate: updatedUser.JoinDate,
        enrolledCourses: updatedUser.EnrolledCourses,
        gpa: updatedUser.GPA,
        completedCredits: updatedUser.CompletedCredits,
        staffId: updatedUser.StaffID,
        contactInfo: updatedUser.ContactInfo,
        officeHours: updatedUser.OfficeHours,
        assignedCourses: updatedUser.AssignedCourses,
        payrollStatus: updatedUser.PayrollStatus,
        benefitsSummary: updatedUser.BenefitsSummary,
        leaveBalance: updatedUser.LeaveBalance,
        salaryAmount: updatedUser.SalaryAmount
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to update profile.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="cp-card">
        <div className="cp-header">
          <h2>Edit Profile</h2>
          <button className="cp-close" onClick={onClose} type="button">✕</button>
        </div>

        {error && <div className="error-message cp-error">{error}</div>}

        <form onSubmit={handleSubmit} className="cp-form">
          <div className="cp-row">
            <div className="cp-field">
              <label>First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" required />
            </div>
            <div className="cp-field">
              <label>Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" required />
            </div>
          </div>
          <div className="cp-field">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email address" required />
          </div>
          <div className="cp-field">
            <label>Department</label>
            <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="Department" required />
          </div>

          <div className="cp-actions">
            <button type="submit" className="btn-primary">Save Changes</button>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
