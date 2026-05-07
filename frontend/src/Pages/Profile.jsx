import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileContext } from '../context/ProfileContext';
import ChangePasswordModal from './ChangePasswordModal';
import EditProfile from './EditProfile';
import { isStaffRole } from '../roleUtils';
import { apiGet, apiPost } from '../api';
import NotificationToast from '../Components/NotificationToast';

export default function Profile() {
  const { profileData } = useContext(ProfileContext);
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [hrData, setHrData] = useState(null);
  const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [toast, setToast] = useState(null);
  const isStaffProfile = isStaffRole(profileData?.role);

  useEffect(() => {
    if (!isStaffProfile) return;

    apiGet('/api/staff/hr')
      .then(setHrData)
      .catch((err) => setToast({ type: 'error', message: err.message || 'Unable to load HR information.' }));
  }, [isStaffProfile]);

  const handleLeaveChange = (event) => {
    const { name, value } = event.target;
    setLeaveForm((current) => ({ ...current, [name]: value }));
  };

  const handleLeaveSubmit = async (event) => {
    event.preventDefault();
    try {
      const request = await apiPost('/api/staff/leave-requests', leaveForm);
      setHrData((current) => ({
        ...(current || {}),
        leaveRequests: [request, ...(current?.leaveRequests || [])]
      }));
      setLeaveForm({ startDate: '', endDate: '', reason: '' });
      setToast({ type: 'success', message: 'Leave request submitted.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Unable to submit leave request.' });
    }
  };

  if (!profileData) {
    return <p className="loading">Loading profile...</p>;
  }

  const memberSince = profileData.joinDate
    ? new Date(profileData.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'N/A';

  const initials = `${profileData.firstName?.[0] || ''}${profileData.lastName?.[0] || ''}`.toUpperCase() || '?';
  const fullName = `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim();
  const salaryAmount = hrData?.salaryAmount ?? profileData.salaryAmount ?? 18000;
  const leaveRequests = hrData?.leaveRequests || [];

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
        {isStaffProfile && (
          <div className="profile-stat">
            <span className="stat-num">{salaryAmount.toLocaleString()} EGP</span>
            <span className="stat-lbl">Monthly Salary</span>
          </div>
        )}
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

        {isStaffProfile && (
          <div className="profile-card">
            <div className="card-heading">
              <h2>Academic Staff Details</h2>
            </div>
            <div className="info-grid">
              <div className="info-item info-full">
                <span className="info-label">Contact Information</span>
                <span className="info-value">{profileData.contactInfo || profileData.email}</span>
              </div>
              <div className="info-item info-full">
                <span className="info-label">Office Hours</span>
                <span className="info-value">{profileData.officeHours || 'By appointment'}</span>
              </div>
              <div className="info-item info-full">
                <span className="info-label">Assigned Courses</span>
                <span className="info-value">{profileData.assignedCourses || 'Not assigned'}</span>
              </div>
            </div>
          </div>
        )}

        {isStaffProfile && (
          <div className="profile-card">
            <div className="card-heading">
              <h2>Payroll & Human Resources</h2>
            </div>
            <div className="profile-hr-grid">
              <div className="profile-hr-item">
                <span className="info-label">Salary</span>
                <span className="info-value">{salaryAmount.toLocaleString()} EGP / month</span>
              </div>
              <div className="profile-hr-item">
                <span className="info-label">Payroll Status</span>
                <span className="info-value">{hrData?.payrollStatus || profileData.payrollStatus || 'Active'}</span>
              </div>
              <div className="profile-hr-item">
                <span className="info-label">Leave Balance</span>
                <span className="info-value">{hrData?.leaveBalance ?? profileData.leaveBalance ?? 21} days</span>
              </div>
              <div className="profile-hr-item profile-hr-full">
                <span className="info-label">Benefits</span>
                <span className="info-value">{hrData?.benefitsSummary || profileData.benefitsSummary || 'Standard university benefits'}</span>
              </div>
            </div>

            <form className="leave-request-form" onSubmit={handleLeaveSubmit}>
              <div className="cp-row">
                <div className="cp-field">
                  <label>Start Date</label>
                  <input type="date" name="startDate" value={leaveForm.startDate} onChange={handleLeaveChange} required />
                </div>
                <div className="cp-field">
                  <label>End Date</label>
                  <input type="date" name="endDate" value={leaveForm.endDate} onChange={handleLeaveChange} required />
                </div>
              </div>
              <div className="cp-field">
                <label>Reason</label>
                <textarea name="reason" value={leaveForm.reason} onChange={handleLeaveChange} placeholder="Optional note for HR" rows="3" />
              </div>
              <button type="submit" className="btn-primary">Request Leave</button>
            </form>

            <div className="leave-request-list">
              <h3>Leave Requests</h3>
              {leaveRequests.length === 0 ? (
                <p>No leave requests yet.</p>
              ) : (
                leaveRequests.map((request) => (
                  <div key={request.RequestID} className="leave-request-row">
                    <div>
                      <strong>{request.StartDate} to {request.EndDate}</strong>
                      <span>{request.Reason || 'No reason provided'}</span>
                    </div>
                    <em>{request.Status}</em>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="profile-footer-actions">
        <button className="btn-primary" onClick={() => setIsEditOpen(true)}>Edit Profile</button>
        <button className="btn-secondary" onClick={() => setIsPasswordOpen(true)}>Change Password</button>
      </div>

      {isEditOpen && <EditProfile onClose={() => setIsEditOpen(false)} />}
      {isPasswordOpen && <ChangePasswordModal onClose={() => setIsPasswordOpen(false)} />}
      {toast && (
        <NotificationToast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
