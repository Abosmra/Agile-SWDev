import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet, apiPost } from '../api';
import '../css/StudentCourseDetail.css';

const SECTION_TYPES = [
  'Lecture',
  'Tutorial',
  'Lab',
  'Quiz',
  'Assignment',
  'Project',
  'Link'
];

const SECTION_LABELS = {
  Lecture: 'Lectures',
  Tutorial: 'Tutorials',
  Lab: 'Labs',
  Quiz: 'Quizzes',
  Assignment: 'Assignments',
  Project: 'Project',
  Link: 'Links'
};

function normalizeType(value) {
  const type = String(value || '').toLowerCase();
  if (type.includes('lecture') || type.includes('slide')) return 'Lecture';
  if (type.includes('tutorial')) return 'Tutorial';
  if (type.includes('lab')) return 'Lab';
  if (type.includes('quiz')) return 'Quiz';
  if (type.includes('project')) return 'Project';
  if (type.includes('assignment')) return 'Assignment';
  return 'Link';
}

export default function StudentCourseDetail() {
  const { courseId } = useParams();
  const [detail, setDetail] = useState(null);
  const [activeSection, setActiveSection] = useState('Lecture');
  const [submissionForms, setSubmissionForms] = useState({});
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadDetail = useCallback(async () => {
    const data = await apiGet(`/api/my-courses/${courseId}/details`);
    setDetail(data);
  }, [courseId]);

  useEffect(() => {
    loadDetail().catch((err) => setError(err.message || 'Unable to load course.'));
  }, [loadDetail]);

  const submissionsByAssignment = useMemo(() => {
    const map = new Map();
    (detail?.submissions || []).forEach((submission) => {
      map.set(Number(submission.AssignmentID), submission);
    });
    return map;
  }, [detail]);

  const gradesByAssignment = useMemo(() => {
    const map = new Map();
    (detail?.grades || []).forEach((grade) => {
      map.set(Number(grade.AssignmentID), grade);
    });
    return map;
  }, [detail]);

  const materialBySection = useMemo(() => {
    const grouped = new Map(SECTION_TYPES.map((type) => [type, []]));
    (detail?.materials || []).forEach((material) => {
      grouped.get(normalizeType(material.Type)).push(material);
    });
    return grouped;
  }, [detail]);

  const workBySection = useMemo(() => {
    const grouped = new Map(SECTION_TYPES.map((type) => [type, []]));
    (detail?.assignments || []).forEach((assignment) => {
      grouped.get(normalizeType(assignment.Category)).push(assignment);
    });
    return grouped;
  }, [detail]);

  const handleFormChange = (assignmentId, field, value) => {
    setSubmissionForms((current) => ({
      ...current,
      [assignmentId]: {
        ...(current[assignmentId] || {}),
        [field]: value
      }
    }));
  };

  const submitWork = async (event, assignment) => {
    event.preventDefault();
    setNotice('');
    setError('');

    try {
      await apiPost(`/api/my-courses/${courseId}/submissions`, {
        assignmentId: assignment.AssignmentID,
        ...(submissionForms[assignment.AssignmentID] || {})
      });
      setNotice(`${assignment.Title} submitted.`);
      await loadDetail();
    } catch (err) {
      setError(err.message || 'Unable to submit work.');
    }
  };

  if (error && !detail) {
    return <div className="student-course-page"><p className="student-course-error">{error}</p></div>;
  }

  if (!detail) {
    return <div className="student-course-page"><p>Loading course...</p></div>;
  }

  const materials = materialBySection.get(activeSection) || [];
  const workItems = workBySection.get(activeSection) || [];

  return (
    <div className="student-course-page">
      <header className="student-course-header">
        <div>
          <p>{detail.course.CourseCode}</p>
          <h1>{detail.course.CourseName}</h1>
          <span>{detail.course.Instructor || 'Instructor pending'} · {detail.course.Credits || 3} credits</span>
        </div>
      </header>

      {notice && <div className="student-course-notice">{notice}</div>}
      {error && <div className="student-course-error">{error}</div>}

      <nav className="student-course-tabs">
        {SECTION_TYPES.map((section) => (
          <button
            key={section}
            type="button"
            className={activeSection === section ? 'active' : ''}
            onClick={() => setActiveSection(section)}
          >
            {SECTION_LABELS[section]}
          </button>
        ))}
        <button type="button" className={activeSection === 'Grades' ? 'active' : ''} onClick={() => setActiveSection('Grades')}>
          Grades
        </button>
      </nav>

      {activeSection === 'Grades' ? (
        <section className="student-course-panel">
          <h2>Grades & Feedback</h2>
          <div className="student-work-list">
            {(detail.assignments || []).map((assignment) => {
              const grade = gradesByAssignment.get(Number(assignment.AssignmentID));
              return (
                <article key={assignment.AssignmentID} className="student-work-card">
                  <div>
                    <strong>{assignment.Title}</strong>
                    <span>{assignment.Category || 'Assignment'} · {assignment.MaxScore} marks</span>
                  </div>
                  <div className="student-grade">
                    {grade ? `${grade.Score}/${assignment.MaxScore}` : 'Not graded'}
                    {grade?.Feedback && <small>{grade.Feedback}</small>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="student-course-grid">
          <div className="student-course-panel">
            <h2>{activeSection} Materials</h2>
            <div className="student-material-list">
              {materials.map((material) => (
                <article key={material.MaterialID} className="student-material-card">
                  <strong>{material.Title}</strong>
                  <span>{material.Notes || 'No notes'}</span>
                  {material.Url && <a href={material.Url} target="_blank" rel="noreferrer">Open resource</a>}
                </article>
              ))}
              {!materials.length && <p className="student-empty">No {activeSection.toLowerCase()} materials yet.</p>}
            </div>
          </div>

          <div className="student-course-panel">
            <h2>{activeSection} Work</h2>
            <div className="student-work-list">
              {workItems.map((assignment) => {
                const submission = submissionsByAssignment.get(Number(assignment.AssignmentID));
                const grade = gradesByAssignment.get(Number(assignment.AssignmentID));
                const form = submissionForms[assignment.AssignmentID] || {};
                return (
                  <article key={assignment.AssignmentID} className="student-work-card">
                    <div className="student-work-head">
                      <div>
                        <strong>{assignment.Title}</strong>
                        <span>Due {assignment.DueDate || 'TBD'} · {assignment.MaxScore} marks</span>
                      </div>
                      <span className="student-status">{submission ? 'Submitted' : 'Open'}</span>
                    </div>
                    {submission && (
                      <p className="student-submission-meta">
                        Last submitted {submission.SubmittedAt} {grade ? `· Grade ${grade.Score}/${assignment.MaxScore}` : '· Not graded'}
                      </p>
                    )}
                    <form className="student-submit-form" onSubmit={(event) => submitWork(event, assignment)}>
                      <textarea
                        value={form.content ?? submission?.Content ?? ''}
                        onChange={(event) => handleFormChange(assignment.AssignmentID, 'content', event.target.value)}
                        placeholder="Write your answer or submission notes"
                        rows="3"
                      />
                      <div className="student-submit-row">
                        <input
                          value={form.fileName ?? submission?.FileName ?? ''}
                          onChange={(event) => handleFormChange(assignment.AssignmentID, 'fileName', event.target.value)}
                          placeholder="Uploaded file name"
                        />
                        <input
                          value={form.fileUrl ?? submission?.FileUrl ?? ''}
                          onChange={(event) => handleFormChange(assignment.AssignmentID, 'fileUrl', event.target.value)}
                          placeholder="File link"
                        />
                      </div>
                      <button type="submit">{submission ? 'Update Submission' : 'Submit Work'}</button>
                    </form>
                  </article>
                );
              })}
              {!workItems.length && <p className="student-empty">No {activeSection.toLowerCase()} work yet.</p>}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
