import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileContext } from '../context/ProfileContext';
import ChangePasswordModal from './ChangePasswordModal'; // Ensure this file is created

export default function Profile() {
  const { profileData } = useContext(ProfileContext);
  const navigate = useNavigate();
  
  // State to manage the visibility of the password modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!profileData) {
    return <p className="loading">Loading profile...</p>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <h1>My Profile</h1>
          <p className="profile-subtitle">Manage your account, courses, and schedule from one place.</p>
        </div>
        <div className="profile-top-actions">
          <button className="btn-primary" onClick={() => navigate('/schedule')}>My Schedule</button>
          <button className="btn-secondary" onClick={() => navigate('/my-courses')}>My Courses</button>
        </div>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <h2>Personal Information</h2>
          <div className="profile-info">
            <div className="info-group">
              <label>First Name:</label>
              <p>{profileData.firstName}</p>
            </div>
            <div className="info-group">
              <label>Last Name:</label>
              <p>{profileData.lastName}</p>
            </div>
            <div className="info-group">
              <label>Email:</label>
              <p>{profileData.email}</p>
            </div>
            <div className="info-group">
              <label>Role:</label>
              <p>{profileData.role}</p>
            </div>
            <div className="info-group">
              <label>Department:</label>
              <p>{profileData.department}</p>
            </div>
            <div className="info-group">
              <label>Enrolled Courses:</label>
              <p>{profileData.enrolledCourses}</p>
            </div>
            <div className="info-group">
              <label>Member Since:</label>
              <p>{profileData.joinDate}</p>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h2>Account Settings</h2>
          <div className="profile-actions">
            <button 
              className="btn-primary" 
              onClick={() => navigate('/edit-profile')}
            >
              Edit Profile
            </button>
            <button 
              className="btn-primary" 
              onClick={() => setIsModalOpen(true)}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Pop-up Form for Changing Password */}
      {isModalOpen && (
        <ChangePasswordModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
