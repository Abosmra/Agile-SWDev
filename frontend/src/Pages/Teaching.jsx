import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiGet, apiPost, apiPut } from '../api';
import '../css/Teaching.css';

function getStudentName(student) {
  const fullName = `${student.GivenName || ''} ${student.FamilyName || ''}`.trim();
  return fullName || student.StudentName || student.Username || `Student ${student.UserID || student.EnrollmentID}`;
}

export default function Teaching() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialSection = new URLSearchParams(location.search).get('section') === 'catalog' ? 'catalog' : 'manage';
  const [courses, setCourses] = useState([]);
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [activeSection, setActiveSection] = useState(initialSection);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courseDetail, setCourseDetail] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({ title: '', dueDate: '', maxScore: 100 });
  const [gradeForm, setGradeForm] = useState({ studentId: '', assignmentId: '', score: '', feedback: '' });
  const [materialForm, setMaterialForm] = useState({ title: '', type: 'Link', url: '', notes: '' });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [requestMessage, setRequestMessage] = useState('');

  const selectedCourse = useMemo(
    () => courses.find((course) => Number(course.CourseID) === Number(selectedCourseId)),
    [courses, selectedCourseId]
  );

  useEffect(() => {
    const section = new URLSearchParams(location.search).get('section');
    setActiveSection(section === 'catalog' ? 'catalog' : 'manage');
  }, [location.search]);

  const switchSection = (section) => {
    setActiveSection(section);
    navigate(section === 'catalog' ? '/teaching?section=catalog' : '/teaching');
  };

  const loadCourses = useCallback(async () => {
    const [data, allCourses, requestCatalog] = await Promise.all([
      apiGet('/api/teaching/courses'),
      apiGet('/api/courses'),
      apiGet('/api/teaching/catalog')
    ]);

    const requestStatusByCourse = new Map(
      requestCatalog.map((course) => [
        Number(course.CourseID),
        {
          RequestID: course.RequestID,
          RequestStatus: course.RequestStatus,
          RequestedAt: course.RequestedAt
        }
      ])
    );

    setCourses(data);
    setCatalogCourses(allCourses.map((course) => ({
      ...course,
      ...(requestStatusByCourse.get(Number(course.CourseID)) || {})
    })));
    if (!selectedCourseId && data.length) {
      setSelectedCourseId(data[0].CourseID);
    }
  }, [selectedCourseId]);

  const loadCourseDetail = async (courseId) => {
    if (!courseId) return;
    const data = await apiGet(`/api/teaching/courses/${courseId}`);
    setCourseDetail(data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await loadCourses();
      } catch (err) {
        setError(err.message || 'Unable to load teaching workspace.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loadCourses]);

  useEffect(() => {
    loadCourseDetail(selectedCourseId).catch((err) => setError(err.message || 'Unable to load course details.'));
  }, [selectedCourseId]);

  const refreshDetail = async () => {
    await loadCourseDetail(selectedCourseId);
  };

  const handleAssignmentSubmit = async (event) => {
    event.preventDefault();
    setNotice('');
    setError('');
    try {
      await apiPost(`/api/teaching/courses/${selectedCourseId}/assignments`, assignmentForm);
      setAssignmentForm({ title: '', dueDate: '', maxScore: 100 });
      setNotice('Assignment created.');
      await refreshDetail();
    } catch (err) {
      setError(err.message || 'Could not create assignment.');
    }
  };

  const handleGradeSubmit = async (event) => {
    event.preventDefault();
    setNotice('');
    setError('');
    try {
      await apiPut(`/api/teaching/courses/${selectedCourseId}/grades`, gradeForm);
      setGradeForm({ studentId: '', assignmentId: '', score: '', feedback: '' });
      setNotice('Marks uploaded.');
      await refreshDetail();
    } catch (err) {
      setError(err.message || 'Could not upload marks.');
    }
  };

  const handleMaterialSubmit = async (event) => {
    event.preventDefault();
    setNotice('');
    setError('');
    try {
      await apiPost(`/api/teaching/courses/${selectedCourseId}/materials`, materialForm);
      setMaterialForm({ title: '', type: 'Link', url: '', notes: '' });
      setNotice('Material uploaded.');
      await refreshDetail();
    } catch (err) {
      setError(err.message || 'Could not upload material.');
    }
  };

  const handleRequestToTeach = async (courseId) => {
    setNotice('');
    setError('');
    try {
      await apiPost('/api/teaching/requests', {
        courseId,
        message: requestMessage || 'I would like to teach or support this course.'
      });
      setRequestMessage('');
      setNotice('Teaching request sent for review.');
      const [allCourses, requestCatalog] = await Promise.all([
        apiGet('/api/courses'),
        apiGet('/api/teaching/catalog')
      ]);
      const requestStatusByCourse = new Map(
        requestCatalog.map((course) => [
          Number(course.CourseID),
          {
            RequestID: course.RequestID,
            RequestStatus: course.RequestStatus,
            RequestedAt: course.RequestedAt
          }
        ])
      );
      setCatalogCourses(allCourses.map((course) => ({
        ...course,
        ...(requestStatusByCourse.get(Number(course.CourseID)) || {})
      })));
    } catch (err) {
      setError(err.message || 'Could not send teaching request.');
    }
  };

  const gradesByStudent = useMemo(() => {
    const map = new Map();
    (courseDetail?.grades || []).forEach((grade) => {
      const existing = map.get(grade.StudentID) || [];
      existing.push(grade);
      map.set(grade.StudentID, existing);
    });
    return map;
  }, [courseDetail]);

  if (loading) {
    return <div className="teaching-page"><p>Loading teaching workspace...</p></div>;
  }

  return (
    <div className="teaching-page">
      <header className="teaching-hero">
        <div>
          <p className="teaching-kicker">Academic Staff Workspace</p>
          <h1>Teaching Console</h1>
          <p>Manage taught courses, students, assignments, grades, marks, and course materials.</p>
        </div>
        <div className="teaching-hero-actions">
          <button
            type="button"
            className={activeSection === 'manage' ? 'active' : ''}
            onClick={() => switchSection('manage')}
          >
            My Teaching
          </button>
          <button
            type="button"
            className={activeSection === 'catalog' ? 'active' : ''}
            onClick={() => switchSection('catalog')}
          >
            Browse Courses
          </button>
          {activeSection === 'manage' && (
            <select value={selectedCourseId || ''} onChange={(event) => setSelectedCourseId(event.target.value)}>
              {courses.map((course) => (
                <option key={course.CourseID} value={course.CourseID}>{course.CourseCode} - {course.CourseName}</option>
              ))}
            </select>
          )}
        </div>
      </header>

      {notice && <div className="teaching-notice">{notice}</div>}
      {error && <div className="teaching-error">{error}</div>}

      {activeSection === 'manage' && (!courses.length ? (
        <section className="teaching-card">
          <h2>No assigned courses yet</h2>
          <p>Your courses appear here when your name is listed as an instructor or in staff assigned courses.</p>
          <button className="teaching-inline-action" type="button" onClick={() => switchSection('catalog')}>
            Browse all courses
          </button>
        </section>
      ) : (
        <>
          <section className="teaching-summary-grid">
            <div className="teaching-stat"><span>Course</span><strong>{selectedCourse?.CourseCode}</strong><p>{selectedCourse?.CourseName}</p></div>
            <div className="teaching-stat"><span>Students</span><strong>{courseDetail?.students?.length || 0}</strong><p>Active enrollments</p></div>
            <div className="teaching-stat"><span>Assignments</span><strong>{courseDetail?.assignments?.length || 0}</strong><p>Course assessments</p></div>
            <div className="teaching-stat"><span>Materials</span><strong>{courseDetail?.materials?.length || 0}</strong><p>Uploaded resources</p></div>
          </section>

          <section className="teaching-layout">
            <div className="teaching-card teaching-wide">
              <h2>Students & Grades</h2>
              <div className="teaching-table-wrap">
                <table className="teaching-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Grades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(courseDetail?.students || []).map((student) => {
                      const grades = gradesByStudent.get(student.UserID) || [];
                      return (
                        <tr key={student.EnrollmentID}>
                          <td>{getStudentName(student)}</td>
                          <td>{student.Username || 'Not linked'}</td>
                          <td>{student.Status}</td>
                          <td>{grades.length ? grades.map((grade) => `${grade.Score}`).join(', ') : 'No marks yet'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="teaching-card">
              <h2>Create Assignment</h2>
              <form onSubmit={handleAssignmentSubmit} className="teaching-form">
                <input value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })} placeholder="Assignment title" required />
                <input type="date" value={assignmentForm.dueDate} onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })} />
                <input type="number" min="1" value={assignmentForm.maxScore} onChange={(e) => setAssignmentForm({ ...assignmentForm, maxScore: e.target.value })} placeholder="Max score" />
                <button type="submit">Add Assignment</button>
              </form>
            </div>

            <div className="teaching-card">
              <h2>Upload Marks</h2>
              <form onSubmit={handleGradeSubmit} className="teaching-form">
                <select value={gradeForm.studentId} onChange={(e) => setGradeForm({ ...gradeForm, studentId: e.target.value })} required>
                  <option value="">Select student</option>
                  {(courseDetail?.students || []).filter((student) => student.UserID).map((student) => (
                    <option key={student.EnrollmentID} value={student.UserID}>{getStudentName(student)}</option>
                  ))}
                </select>
                <select value={gradeForm.assignmentId} onChange={(e) => setGradeForm({ ...gradeForm, assignmentId: e.target.value })} required>
                  <option value="">Select assignment</option>
                  {(courseDetail?.assignments || []).map((assignment) => (
                    <option key={assignment.AssignmentID} value={assignment.AssignmentID}>{assignment.Title}</option>
                  ))}
                </select>
                <input type="number" min="0" value={gradeForm.score} onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })} placeholder="Score" required />
                <textarea value={gradeForm.feedback} onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })} placeholder="Feedback" rows="3" />
                <button type="submit">Save Marks</button>
              </form>
            </div>

            <div className="teaching-card">
              <h2>Assignments</h2>
              <div className="teaching-list">
                {(courseDetail?.assignments || []).map((assignment) => (
                  <div key={assignment.AssignmentID} className="teaching-list-item">
                    <strong>{assignment.Title}</strong>
                    <span>Due {assignment.DueDate || 'TBD'} · {assignment.MaxScore} marks</span>
                  </div>
                ))}
                {!courseDetail?.assignments?.length && <p>No assignments yet.</p>}
              </div>
            </div>

            <div className="teaching-card teaching-wide">
              <h2>Upload Course Materials</h2>
              <form onSubmit={handleMaterialSubmit} className="teaching-form teaching-material-form">
                <input value={materialForm.title} onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })} placeholder="Material title" required />
                <select value={materialForm.type} onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })}>
                  <option>Link</option>
                  <option>Slides</option>
                  <option>Document</option>
                  <option>Video</option>
                  <option>Lab</option>
                </select>
                <input value={materialForm.url} onChange={(e) => setMaterialForm({ ...materialForm, url: e.target.value })} placeholder="URL or file path" />
                <textarea value={materialForm.notes} onChange={(e) => setMaterialForm({ ...materialForm, notes: e.target.value })} placeholder="Notes for students" rows="3" />
                <button type="submit">Upload Material</button>
              </form>
              <div className="teaching-list material-list">
                {(courseDetail?.materials || []).map((material) => (
                  <div key={material.MaterialID} className="teaching-list-item">
                    <strong>{material.Title}</strong>
                    <span>{material.Type} · {material.Url || 'No link'} · {material.Notes || 'No notes'}</span>
                  </div>
                ))}
                {!courseDetail?.materials?.length && <p>No materials uploaded yet.</p>}
              </div>
            </div>
          </section>
        </>
      ))}

      {activeSection === 'catalog' && <section className="teaching-card teaching-wide teaching-catalog">
        <div className="teaching-section-head">
          <div>
            <p className="teaching-kicker dark">Course Catalog</p>
            <h2>Request to Teach a Course</h2>
            <p className="teaching-section-copy">These courses are loaded from the backend course catalog.</p>
          </div>
          <input
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            placeholder="Optional request note"
          />
        </div>
        <div className="teaching-course-list">
          {catalogCourses.length === 0 && <p className="teaching-empty">No courses were returned from the backend.</p>}
          {catalogCourses.map((course, index) => {
            const alreadyTeaching = courses.some((item) => Number(item.CourseID) === Number(course.CourseID));
            const status = course.RequestStatus || (alreadyTeaching ? 'Teaching' : '');
            return (
              <article key={course.CourseID} className={`teaching-course-card theme-${index % 3}`}>
                <div className="teaching-course-art">{course.CourseCode}</div>
                <div className="teaching-course-body">
                  <h3>{course.CourseName}</h3>
                  <p>{course.Description || 'Course details are available for academic staff review.'}</p>
                  <span>Instructor: {course.Instructor || 'Not assigned'} · {course.Credits || 3} credits</span>
                </div>
                <button
                  type="button"
                  disabled={alreadyTeaching || Boolean(course.RequestStatus)}
                  onClick={() => handleRequestToTeach(course.CourseID)}
                >
                  {status || 'Request'}
                </button>
              </article>
            );
          })}
        </div>
      </section>}
    </div>
  );
}
