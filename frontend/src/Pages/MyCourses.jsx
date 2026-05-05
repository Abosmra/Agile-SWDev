import React, { useEffect, useState } from 'react';
import { apiGet } from '../api';
import '../css/MyCourses.css';

// ── helpers ──────────────────────────────────────────────────────────────────

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

// ── Sidebar ───────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'Dashboard',   icon: '⊞', active: true },
  { label: 'All Courses', icon: '◎' },
  { label: 'Messages',    icon: '⊙' },
  { label: 'Friends',     icon: '⚇' },
  { label: 'Schedule',    icon: '▣' },
];
const NAV_BOTTOM = [
  { label: 'Settings',  icon: '⚙' },
  { label: 'Directory', icon: 'ℹ' },
];

function Sidebar() {
  return (
    <aside className="mc-sidebar">
      <nav className="mc-nav">
        {NAV_ITEMS.map(n => (
          <div key={n.label} className={`mc-nav-item ${n.active ? 'active' : ''}`}>
            <span className="mc-nav-icon">{n.icon}</span>
            <span>{n.label}</span>
          </div>
        ))}
      </nav>
      <nav className="mc-nav mc-nav-bottom">
        {NAV_BOTTOM.map(n => (
          <div key={n.label} className="mc-nav-item">
            <span className="mc-nav-icon">{n.icon}</span>
            <span>{n.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [error, setError]     = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await apiGet('/api/my-courses');
        setCourses(data.map((course, idx) => {
          const progress = statusToProgress(course.Status);
          return {
            id:               course.CourseID,
            title:            course.CourseName,
            courseCode:       course.CourseCode,
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

  // Demo description per course (fallback)
  const getDesc = (title = '') => {
    const t = title.toLowerCase();
    if (t.includes('operating'))    return 'Learn the basic operating system abstractions, mechanisms, and their implementations.';
    if (t.includes('intelligence')) return 'Intelligence demonstrated by machines, unlike the natural intelligence displayed by humans and animals.';
    if (t.includes('software'))     return 'Learn detailed of engineering to the design, development and maintenance of software.';
    return 'Explore key concepts and hands-on knowledge in this course.';
  };

  const getAuthor = (title = '') => {
    const t = title.toLowerCase();
    if (t.includes('operating'))    return 'Mark Lee';
    if (t.includes('intelligence')) return 'Jung Jaehyun';
    if (t.includes('software'))     return 'Kim Taeyeong';
    return 'Instructor';
  };

  return (
    <div className="mc-root">
      <Sidebar />

      {/* ── Main content ── */}
      <main className="mc-main">

        {/* Top bar */}
        <div className="mc-topbar">
          <h1 className="mc-page-title">My Courses</h1>
          <div className="mc-topbar-right">
            <button className="mc-icon-btn">🔍</button>
            <div className="mc-profile">

              <div className="mc-avatar mc-avatar-lg">C</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mc-filters">
          <span className="mc-filter-label">Filter by:</span>
          {['Time', 'Level', 'Language', 'Type'].map(f => (
            <button key={f} className="mc-filter-btn">{f} ▾</button>
          ))}
        </div>

        {/* Course cards */}
        {error && <p className="mc-error">{error}</p>}

        {isLoading ? (
          <p className="mc-loading">Loading your courses…</p>
        ) : courses.length === 0 ? (
          <p className="mc-empty">No courses enrolled yet.</p>
        ) : (
          <div className="mc-courses-list">
            {courses.map((course, idx) => {
              const theme = course.theme;
              return (
                <div
                  key={course.id}
                  className="mc-course-card"
                  style={{ background: theme.bg }}
                >
                  <div className="mc-card-illustration" style={{ background: theme.iconBg }}>
                    <CourseIllustration color={theme.dot1} />
                  </div>
                  <div className="mc-card-body">
                    <h3 className="mc-card-title">{course.title}</h3>
                    <p className="mc-card-desc">{getDesc(course.title)}</p>
                    <p className="mc-card-author">
                      Created by <strong>{getAuthor(course.title)}</strong>
                    </p>
                  </div>
                  <button
                    className="mc-card-arrow"
                    style={{ background: theme.arrow }}
                  >
                    ›
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Right panel ── */}
      <aside className="mc-right-panel">
        <MiniCalendar />
        <OnlineUsers />
      </aside>
    </div>
  );
}
