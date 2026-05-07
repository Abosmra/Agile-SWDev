import React, { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../api';
import '../css/StudentDashboard.css';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet('/api/students')
      .then(setStudents)
      .catch((err) => setError(err.message || 'Unable to load students.'))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredStudents = useMemo(() => {
    if (!query.trim()) return students;
    const normalized = query.toLowerCase();
    return students.filter((student) => (
      student.name.toLowerCase().includes(normalized) ||
      student.email.toLowerCase().includes(normalized) ||
      String(student.id).includes(normalized)
    ));
  }, [students, query]);

  return (
    <div className="student-dash">
      <header className="student-dash-header">
        <div>
          <p className="student-dash-kicker">Student Records</p>
          <h1>All Students</h1>
        </div>
        <input
          className="student-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search students..."
        />
      </header>

      {error && <p className="student-error">{error}</p>}
      {isLoading ? (
        <p className="student-muted">Loading students...</p>
      ) : (
        <section className="student-record-grid">
          {filteredStudents.map((student) => (
            <article key={student.id} className="student-record-card">
              <div className="student-record-avatar">{student.name.charAt(0)}</div>
              <div>
                <h3>{student.name}</h3>
                <p>{student.email}</p>
              </div>
              <div className="student-record-meta">
                <span>ID {student.id}</span>
                <span>{student.enrolledCourses || 0} courses</span>
                <span>GPA {student.gpa || 'N/A'}</span>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
