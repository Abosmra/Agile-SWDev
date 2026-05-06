import React, { useEffect, useState } from 'react';
import { apiGet, apiDelete } from '../api';
import NotificationToast from '../Components/NotificationToast';

function statusToProgress(status) {
  switch (status) {
    case 'Completed': return 100;
    case 'Pending':   return 15;
    default:          return 60;
  }
}

/** Maps a course index → card accent theme */
const CARD_THEMES = [
  { bg: '#f0efff', iconBg: '#e0deff', dot1: '#a09ce8', dot2: '#c9c5f5', arrow: '#7c6fe0' },
  { bg: '#f5eeff', iconBg: '#e9d9ff', dot1: '#b898e8', dot2: '#d8c0f8', arrow: '#9b6edc' },
  { bg: '#fff0f3', iconBg: '#ffd6df', dot1: '#f09ab0', dot2: '#f5c0ce', arrow: '#e07090' },
];

/** Tiny SVG illustration placeholder (laptop + devices) – colour-matched per theme */
function CourseIllustration({ color }) {
  return (
    <svg width="110" height="90" viewBox="0 0 110 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* monitor */}
      <rect x="10" y="10" width="65" height="44" rx="4" fill={color} opacity="0.6"/>
      <rect x="14" y="14" width="57" height="36" rx="2" fill="white" opacity="0.7"/>
      <rect x="30" y="54" width="26" height="5" rx="2" fill={color} opacity="0.5"/>
      <rect x="20" y="59" width="45" height="3" rx="1.5" fill={color} opacity="0.4"/>
      {/* tablet */}
      <rect x="62" y="28" width="30" height="40" rx="3" fill={color} opacity="0.5"/>
      <rect x="65" y="31" width="24" height="32" rx="1" fill="white" opacity="0.6"/>
      {/* phone */}
      <rect x="75" y="50" width="18" height="28" rx="3" fill={color} opacity="0.7"/>
      <rect x="77" y="53" width="14" height="20" rx="1" fill="white" opacity="0.5"/>
      {/* decorative dots */}
      <circle cx="8"  cy="30" r="4" fill={color} opacity="0.5"/>
      <circle cx="6"  cy="55" r="2.5" fill={color} opacity="0.35"/>
      <rect x="2" y="40" width="5" height="5" rx="1" fill={color} opacity="0.3" transform="rotate(15 2 40)"/>
    </svg>
  );
}

// ── calendar helpers ──────────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_NAMES   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function buildCalendarDays(year, month) {
  // month: 0-indexed
  const first = new Date(year, month, 1).getDay(); // 0=Sun
  const offset = (first === 0 ? 6 : first - 1);    // shift so Mon=0
  const days = [];
  for (let i = 0; i < offset; i++) days.push(null);
  const total = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= total; d++) days.push(d);
  return days;
}

function MiniCalendar() {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const days    = buildCalendarDays(viewYear, viewMonth);
  const todayD  = today.getDate();
  const isToday = (d) =>
    d === todayD &&
    viewMonth === today.getMonth() &&
    viewYear  === today.getFullYear();

  const prev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const next = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className="mc-calendar">
      <div className="mc-cal-header">
        <span className="mc-cal-title">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <div className="mc-cal-nav">
          <button onClick={prev}>&#8249;</button>
          <button onClick={next}>&#8250;</button>
        </div>
      </div>
      <div className="mc-cal-grid">
        {DAY_NAMES.map(d => <span key={d} className="mc-cal-dayname">{d}</span>)}
        {days.map((d, i) => (
          <span
            key={i}
            className={`mc-cal-day ${!d ? 'mc-cal-empty' : ''} ${isToday(d) ? 'mc-cal-today' : ''}`}
          >
            {d || ''}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Online Users (static demo) ────────────────────────────────────────────────

const ONLINE_USERS = [
  { name: 'Maren Maureen',   id: '1094882001', online: true },
  { name: 'Jenniffer Jane',  id: '1094672000', online: true },
  { name: 'Ryan Herwinds',   id: '1094342003', online: false },
  { name: 'Kierra Culhane',  id: '1094662002', online: true },
];

function OnlineUsers() {
  return (
    <div className="mc-online">
      <div className="mc-online-header">
        <span className="mc-online-title">Online Users</span>
        <button className="mc-see-all">See all</button>
      </div>
      <ul className="mc-online-list">
        {ONLINE_USERS.map(u => (
          <li key={u.id} className="mc-online-item">
            <div className="mc-avatar">{u.name[0]}</div>
            <div className="mc-user-info">
              <span className="mc-user-name">{u.name}</span>
              <span className="mc-user-id">{u.id}</span>
            </div>
            <span className={`mc-status-dot ${u.online ? 'online' : 'offline'}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}


// ── Main Component ────────────────────────────────────────────────────────────

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [error, setError]     = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await apiGet('/api/my-courses');
        setCourses(data.map((course, idx) => {
          const progress = statusToProgress(course.Status);
          return {
            id: course.CourseID,
            enrollmentId: course.EnrollmentID,
            title: course.CourseName,
            courseCode: course.CourseCode,
            progress,
            status:           course.Status,
            lessons:          20,
            completedLessons: Math.round((20 * progress) / 100),
            theme:            CARD_THEMES[idx % CARD_THEMES.length],
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

  const handleDrop = async (enrollmentId, courseId, courseTitle) => {
    try {
      await apiDelete(`/api/my-courses/${enrollmentId}`);
      setCourses(prev => prev.filter(c => c.id !== courseId));
      setToast({ type: 'warning', message: `"${courseTitle}" has been dropped.` });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Unable to drop course.' });
    }
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ background: getStatusBadgeColor(course.status), color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {course.status}
                  </span>
                  <button
                    onClick={() => handleDrop(course.enrollmentId, course.id, course.title)}
                    style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Drop
                  </button>
                </div>
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
