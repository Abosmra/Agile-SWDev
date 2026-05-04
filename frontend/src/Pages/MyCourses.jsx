import React, { useEffect, useState } from 'react';
import { apiGet } from '../api';

function statusToProgress(status) {
  switch (status) {
    case 'Completed':
      return 100;
    case 'Pending':
      return 15;
    default:
      return 60;
  }
}

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await apiGet('/api/my-courses');
        setCourses(data.map((course) => {
          const progress = statusToProgress(course.Status);
          return {
            id: course.CourseID,
            title: course.CourseName,
            courseCode: course.CourseCode,
            progress,
            status: course.Status,
            enrolled: '2026-05-04',
            lessons: 20,
            completedLessons: Math.round((20 * progress) / 100)
          };
        }));
      } catch (err) {
        setError(err.message || 'Unable to load your courses.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#4CAF50';
    if (progress >= 50) return '#667eea';
    if (progress >= 25) return '#ff9800';
    return '#f44336';
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'In Progress':
      case 'Enrolled':
        return '#667eea';
      case 'Completed':
        return '#4CAF50';
      case 'Pending':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>My Courses</h1>
        <p style={{ color: '#7f8c8d' }}>Track your enrolled courses and progress</p>
        {error && <p style={{ color: '#c0392b' }}>{error}</p>}
      </div>

      {isLoading ? (
        <p style={{ color: '#7f8c8d' }}>Loading your courses...</p>
      ) : courses.length === 0 ? (
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
                border: '1px solid #e0e0e0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '1.3rem' }}>{course.title}</h3>
                  <p style={{ margin: '0', color: '#7f8c8d', fontSize: '0.95rem' }}>
                    Course Code: <strong>{course.courseCode}</strong>
                  </p>
                </div>
                <span style={{ background: getStatusBadgeColor(course.status), color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  {course.status}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '0.9rem', color: '#7f8c8d' }}>
                <div>Enrolled: {new Date(course.enrolled).toLocaleDateString()}</div>
                <div>Lessons: {course.completedLessons}/{course.lessons}</div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                  <label style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '0.9rem' }}>Overall Progress</label>
                  <span style={{ fontWeight: 'bold', color: getProgressColor(course.progress), fontSize: '1.1rem' }}>
                    {course.progress}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
