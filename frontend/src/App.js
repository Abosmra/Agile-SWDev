import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ProfileProvider, ProfileContext } from './context/ProfileContext';
import { RoleProvider, RoleContext } from './context/RoleContext';
import Navbar from './Components/Navbar';
import Welcome from './Pages/Welcome';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Profile from './Pages/Profile';
import Courses from './Pages/Courses';
import Announcements from './Pages/Announcements';
import Staff from './Pages/Staff';
import Messaging from './Pages/Messaging';
import MyCourses from './Pages/MyCourses';
import StudentSchedule from './Pages/StudentSchedule';
import StaffDashboard from './Pages/StaffDashboard';
import Halls from './Pages/Halls';
import HallDetails from './Pages/HallDetails';
import BookHall from './Pages/BookHall';
import MyBookings from './Pages/MyBookings';
import './App.css';
import { apiGet, apiPost, clearAuthToken, getAuthToken, setAuthToken } from './api';

function mapUserToProfile(user) {
  return {
    userId: user.UserID,
    firstName: user.GivenName || '',
    lastName: user.FamilyName || '',
    email: user.Username,
    role: user.Role,
    enrolledCourses: user.EnrolledCourses || 0,
    joinDate: user.JoinDate || '',
    department: user.Department || 'General'
  };
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const { userRole, setRole, clearRole } = useContext(RoleContext);
  const { setProfile, clearProfile } = useContext(ProfileContext);
  const location = useLocation();

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        setIsAuthReady(true);
        return;
      }

      try {
        const user = await apiGet('/api/me');
        setRole(user.Role.toLowerCase());
        setProfile(mapUserToProfile(user));
        setIsLoggedIn(true);
      } catch {
        clearAuthToken();
        clearRole();
        clearProfile();
        setIsLoggedIn(false);
      } finally {
        setIsAuthReady(true);
      }
    };

    bootstrapAuth();
  }, [setRole, clearRole, setProfile, clearProfile]);

  const isFullScreenPage = ['/', '/login', '/signup'].includes(location.pathname);
  const showNavbar = isLoggedIn && !isFullScreenPage;
  
  const privilegedRole = userRole === 'staff' || userRole === 'admin';
  const defaultRoute = privilegedRole ? '/staff-dashboard' : '/courses';

  const handleAuthenticated = ({ token, user }) => {
    setAuthToken(token);
    setRole(user.Role.toLowerCase());
    setProfile(mapUserToProfile(user));
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await apiPost('/api/logout', {});
    } catch {
      // Ignore logout failures and clear the client state anyway.
    } finally {
      clearAuthToken();
      clearRole();
      clearProfile();
      setIsLoggedIn(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="App">
        <main className="main-content">
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading your workspace...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      {showNavbar && <Navbar onLogout={handleLogout} />}

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={isLoggedIn ? <Navigate to={defaultRoute} /> : <Welcome />}
          />

          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to={defaultRoute} /> : <Login onLogin={handleAuthenticated} />}
          />

          <Route
            path="/signup"
            element={isLoggedIn ? <Navigate to={defaultRoute} /> : <Signup onLogin={handleAuthenticated} />}
          />

          <Route
            path="/profile"
            element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
          />

          <Route
            path="/courses"
            element={isLoggedIn ? <Courses /> : <Navigate to="/login" />}
          />

          <Route
            path="/my-courses"
            element={isLoggedIn ? <MyCourses /> : <Navigate to="/login" />}
          />

          <Route
            path="/schedule"
            element={isLoggedIn ? <StudentSchedule /> : <Navigate to="/login" />}
          />

          <Route
            path="/announcements"
            element={isLoggedIn ? <Announcements /> : <Navigate to="/login" />}
          />

          <Route
            path="/staff"
            element={isLoggedIn ? <Staff /> : <Navigate to="/login" />}
          />

          <Route
            path="/messaging"
            element={isLoggedIn ? <Messaging /> : <Navigate to="/login" />}
          />

          <Route
            path="/staff-dashboard"
            element={isLoggedIn && privilegedRole ? <StaffDashboard /> : <Navigate to={isLoggedIn ? defaultRoute : '/login'} />}
          />

          <Route
            path="/halls"
            element={isLoggedIn && privilegedRole ? <Halls /> : <Navigate to={isLoggedIn ? defaultRoute : '/login'} />}
          />

          <Route
            path="/hall-details/:hallId"
            element={isLoggedIn && privilegedRole ? <HallDetails /> : <Navigate to={isLoggedIn ? defaultRoute : '/login'} />}
          />

          <Route
            path="/book-hall"
            element={isLoggedIn && privilegedRole ? <BookHall /> : <Navigate to={isLoggedIn ? defaultRoute : '/login'} />}
          />

          <Route
            path="/my-bookings"
            element={isLoggedIn && privilegedRole ? <MyBookings /> : <Navigate to={isLoggedIn ? defaultRoute : '/login'} />}
          />

          <Route path="*" element={<Navigate to={isLoggedIn ? defaultRoute : '/login'} />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <RoleProvider>
      <ProfileProvider>
        <Router>
          <AppContent />
        </Router>
      </ProfileProvider>
    </RoleProvider>
  );
}

export default App;
