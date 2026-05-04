import React from 'react';

export default function MyCourses() {
  const courses = [
    {
      id: 1,
      title: "React Basics",
      instructor: "John Doe",
      progress: 70,
      status: 'In Progress',
      enrolled: '2026-01-15',
      lessons: 21,
      completedLessons: 15
    },
    {
      id: 2,
      title: "JavaScript Advanced",
      instructor: "Jane Smith",
      progress: 40,
      status: 'In Progress',
      enrolled: '2026-02-20',
      lessons: 18,
      completedLessons: 7
    },
  ];

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#4CAF50';
    if (progress >= 50) return '#667eea';
    if (progress >= 25) return '#ff9800';
    return '#f44336';
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'In Progress': return '#667eea';
      case 'Completed': return '#4CAF50';
      case 'Not Started': return '#9E9E9E';
      default: return '#757575';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>My Courses</h1>
        <p style={{ color: '#7f8c8d' }}>Track your learning progress and course details</p>
      </div>

      {courses.length === 0 ? (
        <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '40px' }}>No courses enrolled yet</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {courses.map((course) => (
            <div 
              key={course.id} 
              style={{
                background: 'white',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e0e0e0',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Header with Title and Status Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '1.3rem' }}>
                    {course.title}
                  </h3>
                  <p style={{ margin: '0', color: '#7f8c8d', fontSize: '0.95rem' }}>
                    Instructor: <strong>{course.instructor}</strong>
                  </p>
                </div>
                <span style={{
                  background: getStatusBadgeColor(course.status),
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold'
                }}>
                  {course.status}
                </span>
              </div>

              {/* Enrollment Info */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '0.9rem', color: '#7f8c8d' }}>
                <div>📅 Enrolled: {new Date(course.enrolled).toLocaleDateString()}</div>
                <div>📚 Lessons: {course.completedLessons}/{course.lessons}</div>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                  <label style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '0.9rem' }}>
                    Overall Progress
                  </label>
                  <span style={{ fontWeight: 'bold', color: getProgressColor(course.progress), fontSize: '1.1rem' }}>
                    {course.progress}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '10px',
                  background: '#e0e0e0',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  <div 
                    style={{
                      width: `${course.progress}%`,
                      height: '100%',
                      background: getProgressColor(course.progress),
                      borderRadius: '10px',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Quick Action Button */}
              <button style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#5568d3'}
              onMouseLeave={(e) => e.target.style.background = '#667eea'}
              >
                Continue Learning →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}