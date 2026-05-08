import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ProfileProvider, ProfileContext } from './context/ProfileContext';
import { RoleProvider, RoleContext } from './context/RoleContext';
import Welcome from './Pages/Welcome';
import Login from './Pages/Login';
import Profile from './Pages/Profile';
import Courses from './Pages/Courses';
import Announcements from './Pages/Announcements';
import Staff from './Pages/Staff';
import Students from './Pages/Students';
import Messaging from './Pages/Messaging';
import MyCourses from './Pages/MyCourses';
import StudentDashboard from './Pages/StudentDashboard';
import MyServices from './Pages/MyServices';
import MyAdvisor from './Pages/MyAdvisor';
import AdvisorPanel from './Pages/AdvisorPanel';
import StudentCourseDetail from './Pages/StudentCourseDetail';
import StudentSchedule from './Pages/StudentSchedule';
import StaffDashboard from './Pages/StaffDashboard';
import AdminDashboard from './Pages/AdminDashboard';
import AdminProgress from './Pages/AdminProgress';
import AdminMaintenance from './Pages/AdminMaintenance';
import AdminOffice from './Pages/AdminOffice';
import AdminPerformance from './Pages/AdminPerformance';
import Teaching from './Pages/Teaching';
import Halls from './Pages/Halls';
import HallDetails from './Pages/HallDetails';
import BookHall from './Pages/BookHall';
import MyBookings from './Pages/MyBookings';
import Applicant from './Pages/Applicant';
import OfficeHours from './Pages/OfficeHours';
import Sidebar from './Components/Sidebar';

import './App.css';
import { apiGet, apiPost, clearAuthToken, getAuthToken, setAuthToken } from './api';
import { getDefaultRouteForRole, normalizeRoleName } from './roleUtils';

function mapUserToProfile(user) {
  return {
    userId: user.UserID,
    firstName: user.GivenName || '',
    lastName: user.FamilyName || '',
    email: user.Username,
    role: user.Role,
    enrolledCourses: user.EnrolledCourses || 0,
    gpa: user.GPA,
    completedCredits: user.CompletedCredits || 0,
    joinDate: user.JoinDate || '',
    department: user.Department || 'General',
    staffId: user.StaffID,
    contactInfo: user.ContactInfo,
    officeHours: user.OfficeHours,
    assignedCourses: user.AssignedCourses,
    payrollStatus: user.PayrollStatus,
    benefitsSummary: user.BenefitsSummary,
    leaveBalance: user.LeaveBalance,
    salaryAmount: user.SalaryAmount
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
        setRole(normalizeRoleName(user.Role));
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

  const isFullScreenPage = ['/', '/login', '/apply'].includes(location.pathname);
  
  const defaultRoute = getDefaultRouteForRole(userRole);

  const handleAuthenticated = ({ token, user }) => {
    setAuthToken(token);
    setRole(normalizeRoleName(user.Role));
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
      <div style={{ padding: '40px', textAlign: 'center' }}>
        Loading your workspace...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {isLoggedIn && !isFullScreenPage && (
        <Sidebar onLogout={handleLogout} />
      )}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login onLogin={handleAuthenticated} />} />
          <Route path="/apply" element={<Applicant />} />


          {isLoggedIn ? (
            <>
              <Route path="/courses"        element={<Courses />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/my-courses"     element={<MyCourses />} />
              <Route path="/my-services"    element={<MyServices />} />
              <Route path="/my-services/:section" element={<MyServices />} />
              <Route path="/my-advisor"      element={<MyAdvisor />} />
              <Route path="/my-courses/:courseId" element={<StudentCourseDetail />} />
              <Route path="/announcements"  element={<Announcements />} />
              <Route path="/schedule"       element={<StudentSchedule />} />
              <Route path="/messaging"      element={<Messaging />} />
              <Route path="/profile"        element={<Profile />} />
              <Route path="/staff"          element={<Staff />} />
              <Route path="/students"       element={<Students />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin-progress" element={<AdminProgress />} />
              <Route path="/admin-office" element={<AdminOffice />} />
              <Route path="/admin-maintenance" element={<AdminMaintenance />} />
              <Route path="/admin-performance" element={<AdminPerformance />} />
              <Route path="/staff-dashboard" element={<StaffDashboard />} />
              <Route path="/advisor-panel" element={<AdvisorPanel />} />
              <Route path="/teaching"       element={<Teaching />} />
              <Route path="/halls"          element={<Halls />} />
              <Route path="/halls/:id"      element={<HallDetails />} />
              <Route path="/book-hall"      element={<BookHall />} />
              <Route path="/book-hall/:id"  element={<BookHall />} />
              <Route path="/my-bookings"    element={<MyBookings />} />
              <Route path="/office-hours"   element={<OfficeHours />} />
              <Route path="*" element={<Navigate to={defaultRoute} replace />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
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
