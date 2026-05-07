import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoleContext } from '../context/RoleContext';
import { formatRoleLabel, normalizeRoleName } from '../roleUtils';
import '../css/StaffDashboard.css';

const cardThemes = [
  { bg: '#f0efff', art: '#e0deff', arrow: '#7c6fe0' },
  { bg: '#f5eeff', art: '#e9d9ff', arrow: '#9b6edc' },
  { bg: '#fff0f3', art: '#ffd6df', arrow: '#e07090' },
  { bg: '#eef8ff', art: '#d7efff', arrow: '#4facfe' }
];

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { userRole } = useContext(RoleContext);
  const isAdvisor = normalizeRoleName(userRole) === 'advisor';

  const dashboardOptions = [
    ...(isAdvisor ? [{
      title: 'Advisor Panel',
      description: 'Approve or cancel student enrollment requests and pending course-drop requests.',
      icon: 'AP',
      path: '/advisor-panel'
    }] : []),
    {
      title: 'Teaching Console',
      description: 'View your courses, students, grades, assignments, marks, materials, and teaching requests.',
      icon: 'TC',
      path: '/teaching'
    },
    {
      title: 'Staff Directory',
      description: 'Find professors, TAs, office hours, assigned courses, performance, and HR details.',
      icon: 'SD',
      path: '/staff'
    },
    {
      title: 'Facilities',
      description: 'Browse available halls and reserve rooms for classes, labs, meetings, or events.',
      icon: 'FH',
      path: '/halls'
    },
    {
      title: 'Profile & HR',
      description: 'Review your profile, office hours, contact information, assigned courses, and HR details.',
      icon: 'HR',
      path: '/profile'
    }
  ];

  return (
    <div className="staff-dash-root">
      <div className="staff-dash-topbar">
        <div>
          <h1 className="staff-dash-title">Staff Dashboard</h1>
          <p className="staff-dash-subtitle">A course-style workspace for teaching, staff tools, and academic operations.</p>
        </div>
        <div className="staff-dash-role">{formatRoleLabel(userRole)}</div>
      </div>

      <section className="staff-dash-hero">
        <div className="staff-dash-feature" onClick={() => navigate('/teaching')}>
          <div className="staff-dash-feature-copy">
            <span>Teaching first</span>
            <h2>Manage or request courses</h2>
            <p>Doctors and TAs can view assigned courses, manage class work, and request to teach additional courses from the course catalog.</p>
          </div>
          <div className="staff-dash-feature-art">TC</div>
        </div>
        <div className="staff-dash-mini-panel">
          <h3>Course Requests</h3>
          <p>Need access to a course? Open the Teaching Console and request to teach it.</p>
          <button onClick={() => navigate('/teaching?section=catalog')}>Browse Courses</button>
        </div>
      </section>

      <section className="staff-dash-grid">
        {dashboardOptions.map((option, index) => {
          const theme = cardThemes[index % cardThemes.length];
          return (
            <article key={option.title} className="staff-dash-card" style={{ background: theme.bg }} onClick={() => navigate(option.path)}>
              <div className="staff-dash-card-art" style={{ background: theme.art }}>{option.icon}</div>
              <div className="staff-dash-card-body">
                <h3>{option.title}</h3>
                <p>{option.description}</p>
              </div>
              <button className="staff-dash-card-arrow" style={{ background: theme.arrow }}>›</button>
            </article>
          );
        })}
      </section>
    </div>
  );
}
