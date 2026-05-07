import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileContext } from '../context/ProfileContext';
import ChangePasswordModal from './ChangePasswordModal';
import EditProfile from './EditProfile';
import { isStaffRole } from '../roleUtils';

export default function Profile() {
  const { profileData } = useContext(ProfileContext);
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  if (!profileData) {
    return <p className="loading">Loading profile...</p>;
  }

  const memberSince = profileData.joinDate
    ? new Date(profileData.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'N/A';

  const initials = `${profileData.firstName?.[0] || ''}${profileData.lastName?.[0] || ''}`.toUpperCase() || '?';
  const fullName = `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim();
  const isStaffProfile = isStaffRole(profileData.role);

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-hero-info">
          <h1 className="profile-name">{fullName}</h1>
          <div className="profile-badges">
            <span className="profile-badge badge-role">{profileData.role}</span>
            <span className="profile-badge badge-dept">{profileData.department}</span>
          </div>
        </div>
        {!isStaffProfile && (
          <div className="profile-hero-actions">
            <button className="btn-outline-white" onClick={() => navigate('/schedule')}>My Schedule</button>
            <button className="btn-white" onClick={() => navigate('/my-courses')}>My Courses</button>
          </div>
        )}
      </div>

      <div className="profile-stats-row">
        {!isStaffProfile && (
          <div className="profile-stat">
            <span className="stat-num">{profileData.enrolledCourses ?? 0}</span>
            <span className="stat-lbl">Enrolled Courses</span>
          </div>
        )}
        <div className="profile-stat">
          <span className="stat-num">{memberSince}</span>
          <span className="stat-lbl">Member Since</span>
        </div>
        <div className="profile-stat">
          <span className="stat-num">{profileData.role}</span>
          <span className="stat-lbl">Account Type</span>
        </div>
      </div>

      <div className="profile-body">
        <div className="profile-card">
          <div className="card-heading">
            <h2>Personal Information</h2>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">First Name</span>
              <span className="info-value">{profileData.firstName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Name</span>
              <span className="info-value">{profileData.lastName}</span>
            </div>
            <div className="info-item info-full">
              <span className="info-label">Email</span>
              <span className="info-value">{profileData.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Department</span>
              <span className="info-value">{profileData.department}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Role</span>
              <span className="info-value">{profileData.role}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-footer-actions">
        <button className="btn-primary" onClick={() => setIsEditOpen(true)}>Edit Profile</button>
        <button className="btn-secondary" onClick={() => setIsPasswordOpen(true)}>Change Password</button>
      </div>

      {isEditOpen && <EditProfile onClose={() => setIsEditOpen(false)} />}
      {isPasswordOpen && <ChangePasswordModal onClose={() => setIsPasswordOpen(false)} />}
    </div>
  );
}
