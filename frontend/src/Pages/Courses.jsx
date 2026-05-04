import React, { useState, useEffect } from 'react';
import CourseCard from '../Components/CourseCard';
import { apiGet, apiPost } from '../api';
import NotificationToast from '../Components/NotificationToast';

export default function Courses() {
  const [courseList, setCourseList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const [courses, myCourses] = await Promise.all([
          apiGet('/api/courses'),
          apiGet('/api/my-courses')
        ]);
        setCourseList(courses.map((course) => ({
          id: course.CourseID,
          title: course.CourseName,
          description: course.Description,
          courseCode: course.CourseCode,
          instructor: course.Instructor || 'Staff',
          credits: course.Credits || '3',
          fullDescription: course.Description,
          level: 'Undergraduate',
          semester: 'Current Semester',
          instructorEmail: 'staff@university.edu',
          officeHours: 'Sun-Tue 10:00-12:00',
          assignments: 20,
          midterm: 30,
          final: 40,
          participation: 10
        })));
        setEnrolledCourses(myCourses.map((course) => course.CourseID));
      } catch (err) {
        setError(err.message || 'Unable to load courses.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  const filteredCourses = courseList.filter((course) => {
    const searchText = searchTerm.toLowerCase();
    return (
      (course.title || '').toLowerCase().includes(searchText) ||
      (course.description || '').toLowerCase().includes(searchText) ||
      (course.instructor || '').toLowerCase().includes(searchText)
    );
  });

  const handleEnroll = async (courseId) => {
    if (enrolledCourses.includes(courseId)) {
      setNotification({
        type: 'warning',
        message: 'You are already enrolled in this course!'
      });
      return;
    }

    try {
      await apiPost('/api/enrollments', { courseId });
      setEnrolledCourses([...enrolledCourses, courseId]);
      setNotification({
        type: 'success',
        message: 'Successfully enrolled in course!'
      });
    } catch (err) {
      setNotification({
        type: 'warning',
        message: err.message || 'Unable to enroll right now.'
      });
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>Browse Courses</h1>
        <p style={{ color: '#7f8c8d' }}>Explore and enroll in available courses to advance your skills</p>
        {error && (
          <div style={{ color: '#c0392b', marginTop: '10px' }}>
            {error}
          </div>
        )}
      </div>

      {/* Enrolled Courses Summary */}
      {enrolledCourses.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '25px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
            ✓ You are enrolled in {enrolledCourses.length} course{enrolledCourses.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Search Container */}
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e0e0e0'
      }}>
        <label style={{
          display: 'block',
          fontWeight: 'bold',
          marginBottom: '12px',
          color: '#2c3e50'
        }}>
          🔍 Search Courses
        </label>
        <input
          type="text"
          placeholder="Search by course title, description, or instructor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 15px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '1rem',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
        <p style={{ margin: '12px 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
          Found <strong>{filteredCourses.length}</strong> course{filteredCourses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div style={{
          background: 'white',
          padding: '60px 20px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '15px' }}>⏳</div>
          <p style={{ color: '#7f8c8d', fontSize: '1.1rem', marginBottom: '10px' }}>
            Loading courses...
          </p>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {filteredCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course}
              isEnrolled={enrolledCourses.includes(course.id)}
              onEnroll={handleEnroll}
            />
          ))}
        </div>
      ) : (
        <div style={{
          background: 'white',
          padding: '60px 20px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📚</div>
          <p style={{ color: '#7f8c8d', fontSize: '1.1rem', marginBottom: '10px' }}>
            No courses found matching your search
          </p>
          <p style={{ color: '#7f8c8d', fontSize: '0.95rem' }}>
            Try adjusting your search terms or browse all available courses
          </p>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <NotificationToast
          type={notification.type}
          message={notification.message}
          duration={4000}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
