import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileContext } from '../context/ProfileContext';
import '../css/StudentDashboard.css';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { profileData } = useContext(ProfileContext);

  const fullName = profileData
    ? `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || profileData.email
    : 'Student';

  const options = [
    { label: 'My Courses', value: profileData?.enrolledCourses ?? 0, detail: 'Active courses', path: '/my-courses' },
    { label: 'All Courses', value: 'Open', detail: 'Browse catalog', path: '/courses' },
    { label: 'Enroll Course', value: '+', detail: 'Advisor approval', path: '/my-services/enroll' },
    { label: 'Drop Course', value: '-', detail: 'Request review', path: '/my-services/drop' },
    { label: 'My Advisor', value: 'AD', detail: 'Message support', path: '/my-services/advisor' },
    { label: 'Schedule', value: 'SC', detail: 'Classes and time', path: '/schedule' },
    { label: 'Messages', value: 'MS', detail: 'Chats', path: '/messaging' },
    { label: 'Announcements', value: 'AN', detail: 'Campus updates', path: '/announcements' },
    { label: 'Profile', value: 'ME', detail: 'Account details', path: '/profile' },
  ];

  return (
    <div className="student-dash">
      <header className="student-dash-header">
        <div>
          <p className="student-dash-kicker">Student Dashboard</p>
          <h1>{fullName}</h1>
        </div>
        <button onClick={() => navigate('/my-services')}>My Service</button>
      </header>

      <section className="student-stat-grid">
        <article className="student-stat-card">
          <span>GPA</span>
          <strong>{profileData?.gpa ?? 'N/A'}</strong>
          <p>Latest transcript GPA</p>
        </article>
        <article className="student-stat-card">
          <span>Credit Hours Completed</span>
          <strong>{profileData?.completedCredits ?? 0}</strong>
          <p>Completed courses only</p>
        </article>
        <article className="student-stat-card">
          <span>Active Courses</span>
          <strong>{profileData?.enrolledCourses ?? 0}</strong>
          <p>Includes pending requests</p>
        </article>
      </section>

      <section className="student-option-grid">
        {options.map((option) => (
          <button key={option.label} className="student-option-square" onClick={() => navigate(option.path)}>
            <strong>{option.value}</strong>
            <span>{option.label}</span>
            <small>{option.detail}</small>
          </button>
        ))}
      </section>
    </div>
  );
}
