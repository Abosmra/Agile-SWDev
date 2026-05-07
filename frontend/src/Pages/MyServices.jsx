import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiDelete, apiGet, apiPost } from '../api';
import NotificationToast from '../Components/NotificationToast';
import '../css/MyServices.css';

export default function MyServices() {
  const navigate = useNavigate();
  const { section } = useParams();
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingAllCourses, setLoadingAllCourses] = useState(true);
  const [toast, setToast] = useState(null);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const data = await apiGet('/api/my-courses');
      setCourses(data.map((course) => ({
        id: course.CourseID,
        enrollmentId: course.EnrollmentID,
        title: course.CourseName,
        courseCode: course.CourseCode,
        status: course.Status,
      })));
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Unable to load courses.' });
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadAllCourses = async () => {
    try {
      setLoadingAllCourses(true);
      const data = await apiGet('/api/courses');
      setAllCourses(data.map((course) => ({
        id: course.CourseID,
        title: course.CourseName,
        courseCode: course.CourseCode,
        credits: course.Credits || 3,
        instructor: course.Instructor || 'Instructor pending',
      })));
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Unable to load course catalog.' });
    } finally {
      setLoadingAllCourses(false);
    }
  };

  useEffect(() => {
    if (section === 'advisor') {
      navigate('/my-advisor', { replace: true });
      return;
    }

    loadCourses();
    loadAllCourses();
  }, [navigate, section]);

  const enrolledCourseIds = new Set(courses.map((course) => course.id));
  const availableCourses = allCourses.filter((course) => !enrolledCourseIds.has(course.id));

  const handleDrop = async (course) => {
    try {
      await apiDelete(`/api/my-courses/${course.enrollmentId}`);
      setCourses((currentCourses) => currentCourses.map((item) => (
        item.id === course.id ? { ...item, status: 'Drop Pending' } : item
      )));
      setToast({ type: 'success', message: `Drop request for "${course.title}" was sent to your advisor.` });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Unable to send drop request.' });
    }
  };

  const handleEnroll = async (course) => {
    try {
      await apiPost('/api/enrollments', { courseId: course.id });
      setCourses((currentCourses) => [
        ...currentCourses,
        {
          id: course.id,
          enrollmentId: `pending-${course.id}`,
          title: course.title,
          courseCode: course.courseCode,
          status: 'Pending',
        }
      ]);
      setToast({ type: 'success', message: `Enrollment request for "${course.title}" was sent to your advisor.` });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Unable to send enrollment request.' });
    }
  };

  return (
    <div className="services-page">
      <header className="services-header">
        <h1>Course Services</h1>
        <p>Request new course enrollments or send drop-course requests to your advisor.</p>
      </header>

      <div className="services-grid">
        <section className="service-panel">
          <div className="service-panel-header">
            <div>
              <span className="service-kicker">Course Service</span>
              <h2>Enroll Course</h2>
            </div>
          </div>

          {loadingAllCourses ? (
            <p className="service-muted">Loading course catalog...</p>
          ) : availableCourses.length === 0 ? (
            <p className="service-empty">No available courses to request.</p>
          ) : (
            <div className="service-course-list">
              {availableCourses.map((course) => (
                <div key={course.id} className="service-course-item">
                  <div>
                    <h3>{course.title}</h3>
                    <p>{course.courseCode} - {course.credits} credits - {course.instructor}</p>
                  </div>
                  <button className="service-primary-btn" onClick={() => handleEnroll(course)}>
                    Enroll
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="service-panel">
          <div className="service-panel-header">
            <div>
              <span className="service-kicker">Course Service</span>
              <h2>Drop Course</h2>
            </div>
          </div>

          {loadingCourses ? (
            <p className="service-muted">Loading your enrolled courses...</p>
          ) : courses.length === 0 ? (
            <p className="service-empty">No active courses available to drop.</p>
          ) : (
            <div className="service-course-list">
              {courses.map((course) => (
                <div key={course.enrollmentId} className="service-course-item">
                  <div>
                    <h3>{course.title}</h3>
                    <p>{course.courseCode} - {course.status}</p>
                  </div>
                  <button
                    className="service-danger-btn"
                    onClick={() => handleDrop(course)}
                    disabled={course.status === 'Drop Pending' || course.status === 'Pending'}
                  >
                    {course.status === 'Drop Pending' ? 'Pending' : 'Drop'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {toast && (
        <NotificationToast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
