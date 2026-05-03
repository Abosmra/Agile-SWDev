import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
            <li><a href="/courses">Courses</a></li>
            <li><a href="/announcements">Announcements</a></li>
            <li><a href="/schedule">Schedule</a></li>
            <li><a href="/messaging">Messaging</a></li>
            <li><a href="/profile">Profile</a></li>
          </>
        )}
        {userRole === 'staff' && (
          <>
            <li><a href="/staff-dashboard">Dashboard</a></li>
            <li><a href="/halls">Halls</a></li>
            <li><a href="/my-bookings">My Bookings</a></li>
            <li><a href="/my-courses">Courses</a></li>
            <li><a href="/profile">Profile</a></li>
          </>
        )}
        <li><button onClick={handleLogout} className="logout-btn">Log Out</button></li>
      </ul>
    </nav>
  );
}
