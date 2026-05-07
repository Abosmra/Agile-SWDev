import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoleContext } from '../context/RoleContext';
import { formatRoleLabel } from '../roleUtils';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { userRole } = useContext(RoleContext);

  const dashboardOptions = [
    {
      id: 1,
      title: 'Staff Directory',
      description: 'Manage professors, TAs, office hours, assigned courses, and contact details',
      icon: '👥',
      path: '/staff',
      color: '#0f766e'
    },
    {
      id: 2,
      title: 'Performance & Research',
      description: 'Track faculty performance, research output, and development activities',
      icon: '📈',
      path: '/staff',
      color: '#ea580c'
    },
    {
      id: 3,
      title: 'Payroll & HR',
      description: 'Review payroll status, leave balances, benefits, and HR information',
      icon: '💼',
      path: '/staff',
      color: '#2563eb'
    },
    {
      id: 4,
      title: 'View Available Halls',
      description: 'Browse and view all available halls with their details',
      icon: '🏛️',
      path: '/halls',
      color: '#667eea'
    },
    {
      id: 5,
      title: 'Book a Hall',
      description: 'Reserve a hall for your event or class',
      icon: '📅',
      path: '/book-hall',
      color: '#764ba2'
    },
    {
      id: 6,
      title: 'My Bookings',
      description: 'Track and manage your hall reservations',
      icon: '📋',
      path: '/my-bookings',
      color: '#f093fb'
    },
    {
      id: 7,
      title: 'My Courses',
      description: 'View and manage your enrolled courses',
      icon: '📚',
      path: '/my-courses',
      color: '#4facfe'
    },
    {
      id: 8,
      title: 'Profile',
      description: 'View and edit your profile information',
      icon: '👤',
      path: '/profile',
      color: '#43e97b'
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.5rem' }}>Staff Dashboard</h1>
          <p style={{ color: '#7f8c8d', marginTop: '8px' }}>Welcome back! Manage staff tools, courses, halls, and HR tasks</p>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '10px',
          fontWeight: 'bold'
        }}>
          {formatRoleLabel(userRole)}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginTop: '20px'
      }}>
        {dashboardOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => navigate(option.path)}
            style={{
              background: 'white',
              border: `2px solid ${option.color}`,
              borderRadius: '12px',
              padding: '25px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              ':hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }}
          >
            <div style={{
              fontSize: '3rem',
              marginBottom: '15px'
            }}>
              {option.icon}
            </div>
            <h3 style={{
              color: option.color,
              marginTop: 0,
              marginBottom: '10px',
              fontSize: '1.3rem'
            }}>
              {option.title}
            </h3>
            <p style={{
              color: '#7f8c8d',
              margin: '10px 0 0 0',
              fontSize: '0.95rem',
              lineHeight: '1.5'
            }}>
              {option.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
