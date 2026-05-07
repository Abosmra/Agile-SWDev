import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../api';
import '../css/MyCourses.css';
import searchIcon from '../assets/search.png';

const CARD_THEMES = [
  { bg: '#f0efff', iconBg: '#e0deff', dot1: '#a09ce8', dot2: '#c9c5f5', arrow: '#7c6fe0' },
  { bg: '#f5eeff', iconBg: '#e9d9ff', dot1: '#b898e8', dot2: '#d8c0f8', arrow: '#9b6edc' },
  { bg: '#fff0f3', iconBg: '#ffd6df', dot1: '#f09ab0', dot2: '#f5c0ce', arrow: '#e07090' },
];

function CourseIllustration({ color }) {
  return (
    <svg width="110" height="90" viewBox="0 0 110 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="65" height="44" rx="4" fill={color} opacity="0.6"/>
      <rect x="14" y="14" width="57" height="36" rx="2" fill="white" opacity="0.7"/>
      <rect x="30" y="54" width="26" height="5" rx="2" fill={color} opacity="0.5"/>
      <rect x="20" y="59" width="45" height="3" rx="1.5" fill={color} opacity="0.4"/>
      <rect x="62" y="28" width="30" height="40" rx="3" fill={color} opacity="0.5"/>
      <rect x="65" y="31" width="24" height="32" rx="1" fill="white" opacity="0.6"/>
      <rect x="75" y="50" width="18" height="28" rx="3" fill={color} opacity="0.7"/>
      <rect x="77" y="53" width="14" height="20" rx="1" fill="white" opacity="0.5"/>
      <circle cx="8" cy="30" r="4" fill={color} opacity="0.5"/>
      <circle cx="6" cy="55" r="2.5" fill={color} opacity="0.35"/>
      <rect x="2" y="40" width="5" height="5" rx="1" fill={color} opacity="0.3" transform="rotate(15 2 40)"/>
    </svg>
  );
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_NAMES = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function buildCalendarDays(year, month) {
  const first = new Date(year, month, 1).getDay();
  const offset = first === 0 ? 6 : first - 1;
  const days = [];
  for (let i = 0; i < offset; i++) days.push(null);
  const total = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= total; d++) days.push(d);
  return days;
}

function MiniCalendar() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const days = buildCalendarDays(viewYear, viewMonth);

  const isToday = (day) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const prev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year) => year - 1);
      return;
    }
    setViewMonth((month) => month - 1);
  };

  const next = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year) => year + 1);
      return;
    }
    setViewMonth((month) => month + 1);
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
        {DAY_NAMES.map((day) => <span key={day} className="mc-cal-dayname">{day}</span>)}
        {days.map((day, index) => (
          <span key={index} className={`mc-cal-day ${!day ? 'mc-cal-empty' : ''} ${isToday(day) ? 'mc-cal-today' : ''}`}>
            {day || ''}
          </span>
        ))}
      </div>
    </div>
  );
}

function OnlineUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seeAll, setSeeAll] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiGet('/api/online-users');
        setUsers(data);
        setError('');
      } catch {
        setError('Failed to load online users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const displayedUsers = seeAll ? users : users.slice(0, 3);

  if (loading) return <div className="mc-online-loading">Loading users...</div>;
  if (error) return <div className="mc-online-error">{error}</div>;

  return (
    <div className="mc-online">
      <div className="mc-online-header">
        <span className="mc-online-title">Online Users</span>
        <button className="mc-see-all" onClick={() => setSeeAll(!seeAll)}>
          {seeAll ? 'Show less' : 'See all'}
        </button>
      </div>
      <ul className="mc-online-list">
        {displayedUsers.map((user) => (
          <li key={user.id} className="mc-online-item">
            <div className="mc-avatar">{user.name.charAt(0)}</div>
            <div className="mc-user-info">
              <span className="mc-user-name">{user.name}</span>
              <span className="mc-user-id">{user.id}</span>
            </div>
            <span className={`mc-status-dot ${user.online ? 'online' : 'offline'}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}

const getDesc = (title) => {
  const normalizedTitle = title.toLowerCase();
  if (normalizedTitle.includes('operating')) return 'Learn the basic operating system abstractions, mechanisms, and their implementations.';
  if (normalizedTitle.includes('intelligence')) return 'Intelligence demonstrated by machines, unlike the natural intelligence displayed by humans and animals.';
  if (normalizedTitle.includes('software')) return 'Learn detailed of engineering to the design, development and maintenance of software.';
  return 'Explore key concepts and hands-on knowledge in this course.';
};

export default function MyCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await apiGet('/api/my-courses');
        setCourses(data.map((course, index) => ({
          id: course.CourseID,
          enrollmentId: course.EnrollmentID,
          title: course.CourseName,
          courseCode: course.CourseCode,
          status: course.Status,
          instructor: course.Instructor || 'Instructor',
          credits: course.Credits || 3,
          theme: CARD_THEMES[index % CARD_THEMES.length],
        })));
      } catch (err) {
        setError(err.message || 'Unable to load your courses.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const query = searchQuery.toLowerCase();
    return courses.filter((course) =>
      course.title.toLowerCase().includes(query) ||
      course.courseCode.toLowerCase().includes(query)
    );
  }, [courses, searchQuery]);

  return (
    <div className="mc-root">
      <main className="mc-main">
        <div className="mc-topbar">
          <h1 className="mc-page-title">My Courses</h1>
          <div className="mc-topbar-right">
            <div className="mc-search-container">
              {showSearch && (
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="mc-search-input"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  autoFocus
                />
              )}
              <button className="mc-icon-btn" onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearchQuery(''); }}>
                <img src={searchIcon} alt="search" className="mc-icon-img" />
              </button>
            </div>
          </div>
        </div>

        {error && <p className="mc-error">{error}</p>}
        {isLoading ? (
          <p className="mc-loading">Loading your courses...</p>
        ) : filteredCourses.length === 0 ? (
          <p className="mc-empty">No enrolled courses match your search.</p>
        ) : (
          <div className="mc-courses-list">
            {filteredCourses.map((course) => (
              <div key={course.id} className="mc-course-card" style={{ background: course.theme.bg }}>
                <div className="mc-card-illustration" style={{ background: course.theme.iconBg }}>
                  <CourseIllustration color={course.theme.dot1} />
                </div>
                <div className="mc-card-body">
                  <h3 className="mc-card-title">{course.title}</h3>
                  <p className="mc-card-desc">{getDesc(course.title)}</p>
                  <p className="mc-card-author">Created by <strong>{course.instructor}</strong></p>
                  <div className="mc-card-meta">
                    <span className="mc-card-tag">{course.courseCode}</span>
                    <span className="mc-card-tag">{course.status}</span>
                    <span className="mc-card-tag">{course.credits} credits</span>
                  </div>
                </div>
                <button
                  className="mc-card-arrow"
                  style={{ background: course.theme.arrow }}
                  onClick={() => navigate(`/my-courses/${course.id}`)}
                  aria-label={`Open ${course.title}`}
                >
                  &#8250;
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <aside className="mc-right-panel">
        <MiniCalendar />
        <OnlineUsers />
      </aside>
    </div>
  );
}
