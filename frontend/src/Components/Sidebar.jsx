import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { RoleContext } from '../context/RoleContext';
import { ProfileContext } from '../context/ProfileContext';
import { isAdminRole, isStaffRole, normalizeRoleName } from '../roleUtils';
import '../css/Sidebar.css';

// ── SVG Icons ────────────────────────────────────────────────────────────────

const Icons = {
  courses: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  myCourses: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  announcements: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  schedule: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  messaging: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  services: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  profile: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  halls: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  bookings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Sidebar({ onLogout }) {
  const { userRole } = useContext(RoleContext);
  const { profileData } = useContext(ProfileContext);
  const navigate = useNavigate();

  const studentLinks = [
    { label: 'Dashboard',     icon: Icons.dashboard,     to: '/student-dashboard' },
    { label: 'Courses',       icon: Icons.courses,       to: '/courses' },
    { label: 'My Courses',    icon: Icons.myCourses,     to: '/my-courses' },
    { label: 'Announcements', icon: Icons.announcements, to: '/announcements' },
    { label: 'Schedule',      icon: Icons.schedule,      to: '/schedule' },
    { label: 'Messaging',     icon: Icons.messaging,     to: '/messaging' },
    { label: 'Profile',       icon: Icons.profile,       to: '/profile' },
  ];

  const studentServiceLinks = [
    { label: 'Drop Course', icon: Icons.services, to: '/my-services/drop' },
    { label: 'My Advisor',  icon: Icons.profile,  to: '/my-advisor' },
  ];

  const isAdvisor = normalizeRoleName(userRole) === 'advisor';

  const staffLinks = [
    { label: 'Staff Home',       icon: Icons.dashboard, to: '/staff-dashboard' },
    ...(isAdvisor ? [{ label: 'Advisor Panel', icon: Icons.services, to: '/advisor-panel' }] : []),
    { label: 'Messages',         icon: Icons.messaging, to: '/messaging' },
    { label: 'Students',         icon: Icons.profile,   to: '/students' },
    { label: 'Teaching',         icon: Icons.courses,   to: '/teaching' },
    { label: 'Staff Directory',  icon: Icons.profile,   to: '/staff' },
    { label: 'Facilities',       icon: Icons.halls,     to: '/halls' },
    { label: 'My Reservations',  icon: Icons.bookings,  to: '/my-bookings' },
    { label: 'Profile & HR',     icon: Icons.profile,   to: '/profile' },
  ];

  const adminLinks = [
    { label: 'Dashboard',      icon: Icons.dashboard, to: '/admin-dashboard' },
    { label: 'Progress',       icon: Icons.myCourses, to: '/admin-progress' },
    { label: 'Students',       icon: Icons.profile,   to: '/students' },
    { label: 'Maintenance',    icon: Icons.halls,     to: '/admin-maintenance' },
    { label: 'Admin Messages', icon: Icons.messaging, to: '/admin-messages' },
  ];

  const links = isAdminRole(userRole) ? adminLinks : isStaffRole(userRole) ? staffLinks : studentLinks;
  const showStudentServices = !isAdminRole(userRole) && !isStaffRole(userRole);

  const displayName = profileData
    ? `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || profileData.email || 'User'
    : 'User';

  const initials = profileData
    ? `${profileData.firstName?.[0] ?? ''}${profileData.lastName?.[0] ?? ''}`.toUpperCase() || displayName[0]?.toUpperCase() || '?'
    : '?';

  const handleLogout = async () => {
    await onLogout();
    navigate('/');
  };

  return (
    <aside className={`sidebar${isStaffRole(userRole) ? ' sidebar-staff' : ' sidebar-student'}`}>
      <div className="sidebar-brand">
        {isAdminRole(userRole) ? 'Admin Portal' : isStaffRole(userRole) ? 'Staff Portal' : 'Student Portal'}<span className="sidebar-brand-dot">.</span>
      </div>
      <div className="sidebar-profile" onClick={() => navigate('/profile')}>
        <div className="sidebar-avatar">{initials}</div>
        <div className="sidebar-profile-info">
          <span className="sidebar-profile-name">{displayName}</span>
          <span className="sidebar-profile-id">{profileData?.userId ?? ''}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ label, icon, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}

        {showStudentServices && (
          <>
            <div className="sidebar-section-title">My Service</div>
            {studentServiceLinks.map(({ label, icon, to }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
              >
                <span className="sidebar-nav-icon">{icon}</span>
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        <span className="sidebar-nav-icon">{Icons.logout}</span> Log Out
      </button>
    </aside>
  );
}
