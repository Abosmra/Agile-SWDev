import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { RoleContext } from '../context/RoleContext';

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const { userRole, clearRole } = useContext(RoleContext);

  const handleLogout = () => {
    clearRole();
    onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h2>LMS {userRole && `(${userRole.charAt(0).toUpperCase() + userRole.slice(1)})`}</h2>
      </div>
      <ul className="nav-links">
        {userRole === 'student' && (
          <>
            <li><NavLink to="/courses" className={({ isActive }) => (isActive ? 'active-link' : '')}>Courses</NavLink></li>
            <li><NavLink to="/announcements" className={({ isActive }) => (isActive ? 'active-link' : '')}>Announcements</NavLink></li>
            <li><NavLink to="/schedule" className={({ isActive }) => (isActive ? 'active-link' : '')}>Schedule</NavLink></li>
            <li><NavLink to="/messaging" className={({ isActive }) => (isActive ? 'active-link' : '')}>Messaging</NavLink></li>
            <li><NavLink to="/profile" className={({ isActive }) => (isActive ? 'active-link' : '')}>Profile</NavLink></li>
          </>
        )}
        {userRole === 'staff' && (
          <>
            <li><NavLink to="/staff-dashboard" className={({ isActive }) => (isActive ? 'active-link' : '')}>Dashboard</NavLink></li>
            <li><NavLink to="/halls" className={({ isActive }) => (isActive ? 'active-link' : '')}>Halls</NavLink></li>
            <li><NavLink to="/my-bookings" className={({ isActive }) => (isActive ? 'active-link' : '')}>My Bookings</NavLink></li>
            <li><NavLink to="/my-courses" className={({ isActive }) => (isActive ? 'active-link' : '')}>Courses</NavLink></li>
            <li><NavLink to="/profile" className={({ isActive }) => (isActive ? 'active-link' : '')}>Profile</NavLink></li>
          </>
        )}
        <li><button onClick={handleLogout} className="logout-btn">Log Out</button></li>
      </ul>
    </nav>
  );
}
