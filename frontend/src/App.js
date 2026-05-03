import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ProfileProvider } from './context/ProfileContext';
import { RoleProvider, RoleContext } from './context/RoleContext';
import Navbar from './Components/Navbar';
import Welcome from './Pages/Welcome';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Profile from './Pages/Profile';
import EditProfile from './Pages/EditProfile';
import Courses from './Pages/Courses';
import Announcements from './Pages/Announcements';
import Staff from './Pages/Staff';
import Messaging from './Pages/Messaging';
import MyCourses from './Pages/MyCourses'; // ✅ تم التصليح هنا
import StudentSchedule from './Pages/StudentSchedule';
import StaffDashboard from './Pages/StaffDashboard';
import Halls from './Pages/Halls';
import HallDetails from './Pages/HallDetails';
import BookHall from './Pages/BookHall';
import MyBookings from './Pages/MyBookings';
import './App.css';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const { userRole } = useContext(RoleContext);
  const location = useLocation();

  
  const showNavbar = isLoggedIn && !['/login', '/signup', '/'].includes(location.pathname);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  return (
    <div className="App">
      {showNavbar && <Navbar onLogout={handleLogout} />}

      <main className="main-content">
        <Routes>

          <Route 
            path="/" 
            element={isLoggedIn ? <Navigate to="/courses" /> : <Welcome />} 
          />

          <Route 
            path="/login" 
            element={isLoggedIn ? <Navigate to="/courses" /> : <Login onLogin={handleLogin} />} 
          />

          <Route 
            path="/signup" 
            element={isLoggedIn ? <Navigate to="/courses" /> : <Signup onLogin={handleLogin} />} 
          />

          <Route 
            path="/profile" 
            element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} 
          />

          <Route 
            path="/edit-profile" 
            element={isLoggedIn ? <EditProfile /> : <Navigate to="/login" />} 
          />

          <Route 
            path="/courses" 
            element={isLoggedIn ? <Courses /> : <Navigate to="/login" />} 
          />

          {/* ✅ الصفحة الجديدة */}
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

          {/* Staff Routes */}
          <Route 
            path="/staff-dashboard" 
            element={isLoggedIn && userRole === 'staff' ? <StaffDashboard /> : <Navigate to="/login" />} 
          />

          <Route 
            path="/halls" 
            element={isLoggedIn ? <Halls /> : <Navigate to="/login" />} 
          />

          <Route 
            path="/hall-details/:hallId" 
            element={isLoggedIn ? <HallDetails /> : <Navigate to="/login" />} 
          />

          <Route 
            path="/book-hall" 
            element={isLoggedIn ? <BookHall /> : <Navigate to="/login" />} 
          />

          <Route 
            path="/my-bookings" 
            element={isLoggedIn ? <MyBookings /> : <Navigate to="/login" />} 
          />

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