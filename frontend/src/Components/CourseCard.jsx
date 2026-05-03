import React, { useState } from 'react';

export default function CourseCard({ course, isEnrolled, onEnroll }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div className="course-card">
        <h3>{course.title}</h3>
        <p className="course-description">{course.description}</p>
        <p className="course-instructor">👨‍🏫 Instructor: {course.instructor}</p>
        <p className="course-credits">🎓 Credits: {course.credits}</p>
        
        <div className="course-buttons">
          <button 
            className="details-btn"
            onClick={() => setShowDetails(true)}
          >
            View Details
          </button>
          
          {isEnrolled ? (
            <button className="enroll-btn enrolled-btn" disabled>
              ✓ Enrolled
            </button>
          ) : (
            <button 
              className="enroll-btn"
              onClick={() => onEnroll(course.id)}
            >
              Request Enrollment
            </button>
          )}
        </div>
      </div>

      {/* Course Details Modal */}
      {showDetails && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content course-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{course.title}</h2>
              <button className="modal-close" onClick={() => setShowDetails(false)}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="details-section">
                <h3>Course Overview</h3>
                <p className="full-description">{course.fullDescription || course.description}</p>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Course Code:</span>
                  <span className="detail-value">{course.courseCode}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Credits:</span>
                  <span className="detail-value">{course.credits} </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Level:</span>
                  <span className="detail-value">{course.level}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Semester:</span>
                  <span className="detail-value">{course.semester}</span>
                </div>
              </div>

              <div className="details-section">
                <h3>Instructor Information</h3>
                <div className="instructor-info">
                  <div className="instructor-detail">
                    <strong>Name:</strong> {course.instructor}
                  </div>
                  <div className="instructor-detail">
                    <strong>Email:</strong> {course.instructorEmail}
                  </div>
                  <div className="instructor-detail">
                    <strong>Office Hours:</strong> {course.officeHours}
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Assessment Methods</h3>
                <div className="assessment-grid">
                  <div className="assessment-item">
                    <span>Assignments:</span>
                    <strong>{course.assignments}%</strong>
                  </div>
                  <div className="assessment-item">
                    <span>Midterm Exam:</span>
                    <strong>{course.midterm}%</strong>
                  </div>
                  <div className="assessment-item">
                    <span>Final Exam:</span>
                    <strong>{course.final}%</strong>
                  </div>
                  <div className="assessment-item">
                    <span>Class Participation:</span>
                    <strong>{course.participation}%</strong>
                  </div>
                </div>
              </div>

              

              <div className="details-section">
                <h3>Prerequisites</h3>
                  <div className="assessment-item">
                   <span>Course:</span>
                    <strong>{course.midterm}</strong>
                    </div>

              </div>


              <div className="modal-buttons">
                {!isEnrolled && (
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      onEnroll(course.id);
                      setShowDetails(false);
                    }}
                  >
                    Request Enrollment
                  </button>
                )}
                <button 
                  className="btn-secondary"
                  onClick={() => setShowDetails(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}