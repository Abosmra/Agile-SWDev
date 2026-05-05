import React, { useEffect, useState, useMemo } from 'react';
import { apiGet, apiPost } from '../api';
import '../css/MyCourses.css';
import searchIcon from '../assets/search.png';

// ── helpers ──────────────────────────────────────────────────────────────────

function statusToProgress(status) {
  switch (status) {
    case 'Completed': return 100;
    case 'Pending':   return 15;
    default:          return 60;
  }
}

const CARD_THEMES = [
  { bg: '#f0efff', iconBg: '#e0deff', dot1: '#a09ce8', dot2: '#c9c5f5', arrow: '#7c6fe0' },
  { bg: '#f5eeff', iconBg: '#e9d9ff', dot1: '#b898e8', dot2: '#d8c0f8', arrow: '#9b6edc' },
  { bg: '#fff0f3', iconBg: '#ffd6df', dot1: '#f09ab0', dot2: '#f5c0ce', arrow: '#e07090' },
];

const getCourseMetadata = (title, idx) => {
  const t = title.toLowerCase();
  if (t.includes('operating')) return { level: 'Advanced', language: 'English', type: 'Video', time: 'Self-paced' };
  if (t.includes('intelligence')) return { level: 'Intermediate', language: 'English', type: 'Interactive', time: '8 weeks' };
  if (t.includes('software')) return { level: 'Beginner', language: 'English', type: 'Project-based', time: '6 weeks' };
  return {
    level: ['Beginner', 'Intermediate', 'Advanced'][idx % 3],
    language: 'English',
    type: ['Video', 'Interactive', 'Project-based'][idx % 3],
    time: ['Self-paced', '6 weeks', '8 weeks'][idx % 3],
  };
};

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
      <circle cx="8"  cy="30" r="4" fill={color} opacity="0.5"/>
      <circle cx="6"  cy="55" r="2.5" fill={color} opacity="0.35"/>
      <rect x="2" y="40" width="5" height="5" rx="1" fill={color} opacity="0.3" transform="rotate(15 2 40)"/>
    </svg>
  );
}

// ── calendar ──────────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_NAMES   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function buildCalendarDays(year, month) {
  const first = new Date(year, month, 1).getDay();
  const offset = (first === 0 ? 6 : first - 1);
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
  const todayD = today.getDate();
  const isToday = (d) =>
    d === todayD && viewMonth === today.getMonth() && viewYear === today.getFullYear();

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
          <span key={i} className={`mc-cal-day ${!d ? 'mc-cal-empty' : ''} ${isToday(d) ? 'mc-cal-today' : ''}`}>
            {d || ''}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Online Users (dynamic) ────────────────────────────────────────────

function OnlineUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seeAll, setSeeAll] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await apiGet('/api/online-users');
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Failed to load online users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000); // refresh every 30 seconds
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
        {displayedUsers.map(u => (
          <li key={u.id} className="mc-online-item">
            <div className="mc-avatar">{u.name.charAt(0)}</div>
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

// ── Sidebar ────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'Dashboard',   icon: '⊞', view: 'dashboard' },
  { label: 'All Courses', icon: '◎', view: 'courses' },
];

function Sidebar({ activeView, onNavigate }) {
  return (
    <aside className="mc-sidebar">
      <nav className="mc-nav">
        {NAV_ITEMS.map(n => (
          <div
            key={n.label}
            className={`mc-nav-item ${activeView === n.view ? 'active' : ''}`}
            onClick={() => onNavigate(n.view)}
          >
            <span className="mc-nav-icon">{n.icon}</span>
            <span>{n.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}

// ── Course Details Modal ───────────────────────────────────────────────

function CourseDetailsModal({ course, isEnrolled, onClose, onEnroll }) {
  if (!course) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content course-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{course.title}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="details-section">
            <h3>Course Overview</h3>
            <p className="full-description">{course.fullDescription || course.description}</p>
          </div>

          <div className="details-grid">
            <div className="detail-item"><span className="detail-label">Course Code:</span><span className="detail-value">{course.courseCode}</span></div>
            <div className="detail-item"><span className="detail-label">Credits:</span><span className="detail-value">{course.credits}</span></div>
            <div className="detail-item"><span className="detail-label">Level:</span><span className="detail-value">{course.level}</span></div>
            <div className="detail-item"><span className="detail-label">Semester:</span><span className="detail-value">{course.semester}</span></div>
          </div>

          <div className="details-section">
            <h3>Instructor Information</h3>
            <div className="instructor-info">
              <div className="instructor-detail"><strong>Name:</strong> {course.instructor}</div>
              <div className="instructor-detail"><strong>Email:</strong> {course.instructorEmail}</div>
              <div className="instructor-detail"><strong>Office Hours:</strong> {course.officeHours}</div>
            </div>
          </div>

          <div className="details-section">
            <h3>Assessment Methods</h3>
            <div className="assessment-grid">
              <div className="assessment-item"><span>Assignments:</span><strong>{course.assignments}%</strong></div>
              <div className="assessment-item"><span>Midterm Exam:</span><strong>{course.midterm}%</strong></div>
              <div className="assessment-item"><span>Final Exam:</span><strong>{course.final}%</strong></div>
              <div className="assessment-item"><span>Participation:</span><strong>{course.participation}%</strong></div>
            </div>
          </div>

          <div className="details-section">
            <h3>Prerequisites</h3>
            <div className="assessment-item"><span>Course:</span><strong>{course.prerequisites || 'None'}</strong></div>
          </div>

          <div className="modal-buttons">
            {!isEnrolled && (
              <button className="btn-primary" onClick={() => { onEnroll(course.id); onClose(); }}>
                Request Enrollment
              </button>
            )}
            <button className="btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────

export default function MyCourses() {
  const [courses, setCourses] = useState([]);       // enrolled
  const [allCourses, setAllCourses] = useState([]); // all courses
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Modal state
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalCourseDetails, setModalCourseDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Load both datasets
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true);
        const [allData, myData] = await Promise.all([
          apiGet('/api/courses'),
          apiGet('/api/my-courses')
        ]);

        setAllCourses(allData.map((c, idx) => ({
          id: c.CourseID,
          title: c.CourseName,
          courseCode: c.CourseCode,
          theme: CARD_THEMES[idx % CARD_THEMES.length],
          ...getCourseMetadata(c.CourseName, idx),
        })));

        setCourses(myData.map((c, idx) => {
          const progress = statusToProgress(c.Status);
          const metadata = getCourseMetadata(c.CourseName, idx);
          return {
            id: c.CourseID,
            title: c.CourseName,
            courseCode: c.CourseCode,
            progress,
            status: c.Status,
            lessons: 20,
            completedLessons: Math.round((20 * progress) / 100),
            theme: CARD_THEMES[idx % CARD_THEMES.length],
            level: metadata.level,
            language: metadata.language,
            type: metadata.type,
            time: metadata.time,
          };
        }));
      } catch (err) {
        setError(err.message || 'Failed to load courses.');
      } finally {
        setIsLoading(false);
      }
    };
    loadCourses();
  }, []);

  // Filter helpers – only by search query
  const filterCourses = (data) => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(c => c.title.toLowerCase().includes(q));
  };

  const filteredEnrolledCourses = useMemo(() => filterCourses(courses), [courses, searchQuery]);
  const filteredAllCourses = useMemo(() => filterCourses(allCourses), [allCourses, searchQuery]);

  const getDesc = (title) => {
    const t = title.toLowerCase();
    if (t.includes('operating')) return 'Learn the basic operating system abstractions, mechanisms, and their implementations.';
    if (t.includes('intelligence')) return 'Intelligence demonstrated by machines, unlike the natural intelligence displayed by humans and animals.';
    if (t.includes('software')) return 'Learn detailed of engineering to the design, development and maintenance of software.';
    return 'Explore key concepts and hands-on knowledge in this course.';
  };

  const getAuthor = (title) => {
    const t = title.toLowerCase();
    if (t.includes('operating')) return 'Mark Lee';
    if (t.includes('intelligence')) return 'Jung Jaehyun';
    if (t.includes('software')) return 'Kim Taeyeong';
    return 'Instructor';
  };

  // Open modal and fetch full details
  const openCourseDetails = async (course, isEnrolled) => {
    setSelectedCourse({ ...course, isEnrolled });
    setLoadingDetails(true);
    try {
      const details = await apiGet(`/api/courses/${course.id}`);
      setModalCourseDetails({
        ...course,
        ...details,
        fullDescription: details.fullDescription || details.description,
      });
    } catch (err) {
      // Fallback mock data
      setModalCourseDetails({
        ...course,
        description: getDesc(course.title),
        fullDescription: getDesc(course.title),
        instructor: getAuthor(course.title),
        instructorEmail: `${getAuthor(course.title).toLowerCase().replace(' ', '.')}@university.com`,
        officeHours: 'Wed 2-4 PM',
        credits: 3,
        semester: 'Fall 2025',
        assignments: 30,
        midterm: 30,
        final: 30,
        participation: 10,
        prerequisites: 'None',
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setSelectedCourse(null);
    setModalCourseDetails(null);
  };

  const handleEnroll = async (courseId) => {
    try {
      await apiPost('/api/enroll', { courseId });
      alert('Enrollment request sent!');
    } catch (err) {
      alert('Enrollment failed: ' + err.message);
    }
  };

  // Render course card list
  const renderCourseCards = (coursesList, showProgress) => (
    <div className="mc-courses-list">
      {coursesList.map(course => {
        const theme = course.theme;
        const isEnrolled = showProgress;
        return (
          <div key={course.id} className="mc-course-card" style={{ background: theme.bg }}>
            <div className="mc-card-illustration" style={{ background: theme.iconBg }}>
              <CourseIllustration color={theme.dot1} />
            </div>
            <div className="mc-card-body">
              <h3 className="mc-card-title">{course.title}</h3>
              <p className="mc-card-desc">{getDesc(course.title)}</p>
              <p className="mc-card-author">Created by <strong>{getAuthor(course.title)}</strong></p>
              {showProgress && (
                <div className="mc-progress">
                  <div className="mc-progress-bar" style={{ width: `${course.progress}%` }}></div>
                  <span>{course.progress}% complete</span>
                </div>
              )}
            </div>
            <button
              className="mc-card-arrow"
              style={{ background: theme.arrow }}
              onClick={() => openCourseDetails(course, isEnrolled)}
            >
              ›
            </button>
          </div>
        );
      })}
    </div>
  );

  const renderMainContent = () => {
    if (activeView === 'dashboard') {
      return (
        <>
          {error && <p className="mc-error">{error}</p>}
          {isLoading ? <p className="mc-loading">Loading all courses…</p>
            : filteredAllCourses.length === 0 ? <p className="mc-empty">No courses match your search.</p>
            : renderCourseCards(filteredAllCourses, false)}
        </>
      );
    } else {
      return (
        <>
          {error && <p className="mc-error">{error}</p>}
          {isLoading ? <p className="mc-loading">Loading your courses…</p>
            : filteredEnrolledCourses.length === 0 ? <p className="mc-empty">No enrolled courses match your search.</p>
            : renderCourseCards(filteredEnrolledCourses, true)}
        </>
      );
    }
  };

  return (
    <div className="mc-root">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="mc-main">
        <div className="mc-topbar">
          <h1 className="mc-page-title">{activeView === 'dashboard' ? 'All Courses' : 'My Courses'}</h1>
          <div className="mc-topbar-right">
            <div className="mc-search-container">
              {showSearch && (
                <input type="text" placeholder="Search courses..." className="mc-search-input"
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
              )}
              <button className="mc-icon-btn" onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearchQuery(''); }}>
                <img src={searchIcon} alt="search" className="mc-icon-img" />
              </button>
            </div>
          </div>
        </div>
        {renderMainContent()}
      </main>
      <aside className="mc-right-panel">
        <MiniCalendar />
        <OnlineUsers />
      </aside>

      {/* Course Details Modal */}
      {selectedCourse && (
        <CourseDetailsModal
          course={modalCourseDetails || selectedCourse}
          isEnrolled={selectedCourse.isEnrolled}
          onClose={closeModal}
          onEnroll={handleEnroll}
        />
      )}
      {loadingDetails && <div className="modal-overlay"><div className="loading-spinner">Loading details...</div></div>}
    </div>
  );
}