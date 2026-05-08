import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../api';
import '../css/AdminDashboard.css';

const emptyOverview = {
  facilities: {},
  curriculum: {},
  staff: {},
  community: {}
};

function Metric({ label, value, tone = 'neutral' }) {
  return (
    <div className={`admin-metric admin-metric-${tone}`}>
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </div>
  );
}

function MiniTable({ columns, rows, emptyText }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows?.length ? rows.map((row, index) => (
            <tr key={row.id || row.CourseID || row.StaffID || row.BookingID || row.RequestID || row.ResourceID || row.MessageID || row.ApplicationID || index}>
              {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}
            </tr>
          )) : (
            <tr><td colSpan={columns.length} className="admin-empty-cell">{emptyText}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(emptyOverview);
  const [studentRecords, setStudentRecords] = useState([]);
  const [halls, setHalls] = useState([]);
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({ roomId: '', description: '', status: 'open' });
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAdminData = async () => {
    const [dashboardData, recordsData, hallsData] = await Promise.all([
      apiGet('/api/admin/dashboard'),
      apiGet('/api/admin/student-records'),
      apiGet('/api/halls')
    ]);
    setOverview(dashboardData);
    setStudentRecords(recordsData);
    setHalls(hallsData);
  };

  useEffect(() => {
    loadAdminData()
      .catch((err) => setError(err.message || 'Unable to load admin dashboard.'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleMaintenanceSubmit = async (event) => {
    event.preventDefault();
    setNotice('');

    try {
      await apiPost('/api/admin/maintenance', maintenanceForm);
      setMaintenanceForm({ roomId: '', description: '', status: 'open' });
      await loadAdminData();
      setNotice('Maintenance request added.');
    } catch (err) {
      setNotice(err.message || 'Unable to add maintenance request.');
    }
  };

  const modules = useMemo(() => ([
    {
      key: 'facilities',
      title: 'Facilities',
      accent: 'green',
      path: '/admin-maintenance',
      metrics: [
        ['Classrooms', overview.facilities.classrooms],
        ['Labs', overview.facilities.labs],
        ['Bookings', overview.facilities.totalBookings],
        ['Open maintenance', overview.facilities.openMaintenance]
      ]
    },
    {
      key: 'curriculum',
      title: 'Curriculum',
      accent: 'blue',
      path: '/admin-progress',
      metrics: [
        ['Courses', overview.curriculum.totalCourses],
        ['Enrollments', overview.curriculum.totalEnrollments],
        ['Assignments', overview.curriculum.totalAssignments],
        ['Transcripts', overview.curriculum.transcriptCount]
      ]
    },
    {
      key: 'staff',
      title: 'Staff',
      accent: 'amber',
      path: '/admin-progress',
      metrics: [
        ['Staff accounts', overview.staff.totalStaff],
        ['Avg performance', `${overview.staff.averagePerformance || 0}%`],
        ['Parent links', overview.community.parentLinks]
      ]
    },
    {
      key: 'students',
      title: 'Students',
      accent: 'green',
      path: '/students',
      metrics: [
        ['Total students', overview.community.totalStudents],
        ['Active enrollments', overview.curriculum.totalEnrollments],
        ['Avg GPA', '3.5'], // placeholder
        ['Transcripts', overview.curriculum.transcriptCount]
      ]
    },
    {
      key: 'performance',
      title: 'Performance',
      accent: 'rose',
      path: '/admin-performance',
      metrics: [
        ['Staff tracked', overview.staff.totalStaff],
        ['Research published', 0], // placeholder
        ['Professional dev', 0] // placeholder
      ]
    }
  ]), [overview]);

  if (isLoading) {
    return <div className="admin-dashboard"><p className="admin-loading">Loading admin dashboard...</p></div>;
  }

  if (error) {
    return <div className="admin-dashboard"><p className="admin-error">{error}</p></div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <p className="admin-kicker">University Operations</p>
          <h1>Admin Dashboard</h1>
        </div>
        <div className="admin-actions">
          <button onClick={() => navigate('/admin-progress')}>Progress</button>
          <button onClick={() => navigate('/admin-office')}>Office Tools</button>
          <button onClick={() => navigate('/admin-maintenance')}>Maintenance</button>
          <button onClick={() => navigate('/admin-performance')}>Performance</button>
        </div>
      </header>

      <section className="admin-module-grid">
        {modules.map((module) => (
          <article key={module.key} className={`admin-module admin-module-${module.accent}`} onClick={() => navigate(module.path)}>
            <div className="admin-module-top">
              <h2>{module.title}</h2>
              <span>{module.metrics.length}</span>
            </div>
            <div className="admin-module-metrics">
              {module.metrics.map(([label, value]) => (
                <Metric key={label} label={label} value={value} tone={module.accent} />
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="admin-two-column">
        <article className="admin-panel">
          <div className="admin-panel-head">
            <h2>Room And Lab Usage</h2>
            <button onClick={() => navigate('/admin-maintenance')}>Open maintenance</button>
          </div>
          <MiniTable
            columns={[
              { key: 'HallName', label: 'Space' },
              { key: 'Date', label: 'Date' },
              { key: 'Purpose', label: 'Purpose' },
              { key: 'Status', label: 'Status' }
            ]}
            rows={overview.facilities.recentBookings}
            emptyText="No active bookings"
          />
        </article>

        <article className="admin-panel" id="maintenance">
          <div className="admin-panel-head">
            <h2>Maintenance</h2>
          </div>
          <form className="admin-maintenance-form" onSubmit={handleMaintenanceSubmit}>
            <select
              value={maintenanceForm.roomId}
              onChange={(event) => setMaintenanceForm({ ...maintenanceForm, roomId: event.target.value })}
              required
            >
              <option value="">Room or lab</option>
              {halls.map((hall) => (
                <option key={hall.HallID} value={hall.HallID}>{hall.HallName}</option>
              ))}
            </select>
            <select
              value={maintenanceForm.status}
              onChange={(event) => setMaintenanceForm({ ...maintenanceForm, status: event.target.value })}
            >
              <option value="open">Open</option>
              <option value="in progress">In progress</option>
              <option value="closed">Closed</option>
            </select>
            <input
              type="text"
              value={maintenanceForm.description}
              onChange={(event) => setMaintenanceForm({ ...maintenanceForm, description: event.target.value })}
              placeholder="Maintenance issue"
              required
            />
            <button type="submit">Add</button>
          </form>
          {notice && <p className="admin-notice">{notice}</p>}
          <MiniTable
            columns={[
              { key: 'HallName', label: 'Room' },
              { key: 'Description', label: 'Issue' },
              { key: 'Status', label: 'Status' }
            ]}
            rows={overview.facilities.maintenance}
            emptyText="No maintenance requests"
          />
        </article>
      </section>

      <section className="admin-two-column">
        <article className="admin-panel">
          <div className="admin-panel-head">
            <h2>Course Catalog Load</h2>
            <button onClick={() => navigate('/admin-progress')}>Track progress</button>
          </div>
          <MiniTable
            columns={[
              { key: 'CourseCode', label: 'Code' },
              { key: 'CourseName', label: 'Course' },
              { key: 'EnrollmentCount', label: 'Students' }
            ]}
            rows={overview.curriculum.courseLoad}
            emptyText="No courses"
          />
        </article>

        <article className="admin-panel" id="student-records">
          <div className="admin-panel-head">
            <h2>Student Records</h2>
            <button onClick={() => setShowAllStudents((current) => !current)}>
              {showAllStudents ? 'Show less' : 'View all'}
            </button>
          </div>
          <MiniTable
            columns={[
              { key: 'name', label: 'Student', render: (row) => `${row.GivenName || ''} ${row.FamilyName || ''}`.trim() || row.Username },
              { key: 'EnrolledCourses', label: 'Courses' },
              { key: 'LatestGPA', label: 'GPA', render: (row) => row.LatestGPA || 'N/A' }
            ]}
            rows={showAllStudents ? studentRecords : studentRecords.slice(0, 6)}
            emptyText="No student records"
          />
        </article>
      </section>

      <section className="admin-two-column">
        <article className="admin-panel" id="resources">
          <div className="admin-panel-head">
            <h2>Resources</h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span>{overview.facilities.activeAllocations || 0} active allocations</span>
              <button onClick={() => navigate('/admin/equipment')}>Track equipment</button>
            </div>
          </div>
          <MiniTable
            columns={[
              { key: 'ResourceName', label: 'Resource' },
              { key: 'ResourceType', label: 'Type' },
              { key: 'AvailableQuantity', label: 'Available' },
              { key: 'AllocatedQuantity', label: 'Allocated' }
            ]}
            rows={overview.facilities.resources}
            emptyText="No resources"
          />
        </article>

        <article className="admin-panel">
          <div className="admin-panel-head">
            <h2>Staff Performance</h2>
            <button onClick={() => navigate('/admin-progress')}>Track progress</button>
          </div>
          <MiniTable
            columns={[
              { key: 'Name', label: 'Staff' },
              { key: 'Role', label: 'Role' },
              { key: 'PerformanceScore', label: 'Score', render: (row) => `${row.PerformanceScore}%` },
              { key: 'LeaveBalance', label: 'Leave' }
            ]}
            rows={overview.staff.staffPerformance}
            emptyText="No staff profiles"
          />
        </article>
      </section>

      <section className="admin-two-column">
        <article className="admin-panel">
          <div className="admin-panel-head">
            <h2>Administrative Office Automation</h2>
            <button onClick={() => navigate('/admin-office')}>Open tools</button>
          </div>
          <div className="admin-office-summary">
            <div><strong>{studentRecords.length}</strong><span>student records ready</span></div>
            <div><strong>{overview.curriculum.transcriptCount || 0}</strong><span>generated transcripts</span></div>
            <div><strong>{overview.curriculum.admissionApplications || 0}</strong><span>active applications</span></div>
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-head">
            <h2>Admissions</h2>
            <span>{overview.curriculum.admissionApplications || 0} active</span>
          </div>
          <MiniTable
            columns={[
              { key: 'ApplicantName', label: 'Applicant' },
              { key: 'Program', label: 'Program' },
              { key: 'Status', label: 'Status' }
            ]}
            rows={overview.community.applications}
            emptyText="No applications"
          />
        </article>
      </section>
    </div>
  );
}
