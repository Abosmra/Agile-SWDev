import React, { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../api';
import '../css/AdminDashboard.css';

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value || 0)));
}

function ProgressRow({ label, value, detail }) {
  const percent = clamp(value);
  return (
    <div className="admin-progress-row">
      <div className="admin-progress-copy">
        <strong>{label}</strong>
        <span>{detail}</span>
      </div>
      <div className="admin-progress-track">
        <div className="admin-progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="admin-progress-value">{percent}%</span>
    </div>
  );
}

export default function AdminProgress() {
  const [overview, setOverview] = useState(null);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      apiGet('/api/admin/dashboard'),
      apiGet('/api/admin/student-records')
    ])
      .then(([dashboardData, recordsData]) => {
        setOverview(dashboardData);
        setStudents(recordsData);
      })
      .catch((err) => setError(err.message || 'Unable to load progress tracking.'));
  }, []);

  const progress = useMemo(() => {
    if (!overview) return [];

    const facilities = overview.facilities || {};
    const curriculum = overview.curriculum || {};
    const staff = overview.staff || {};
    const community = overview.community || {};

    const resolvedMaintenance = Math.max((facilities.totalHalls || 0) - (facilities.openMaintenance || 0), 0);
    const totalMaintenanceBasis = resolvedMaintenance + (facilities.openMaintenance || 0);
    const avgGpaCount = students.filter((student) => student.LatestGPA).length;

    return [
      {
        label: 'Facilities readiness',
        value: totalMaintenanceBasis ? (resolvedMaintenance / totalMaintenanceBasis) * 100 : 100,
        detail: `${facilities.openMaintenance || 0} open maintenance items across ${facilities.totalHalls || 0} rooms and labs`
      },
      {
        label: 'Resource allocation coverage',
        value: facilities.totalResources ? (facilities.activeAllocations / facilities.totalResources) * 100 : 0,
        detail: `${facilities.activeAllocations || 0} active allocations from ${facilities.totalResources || 0} tracked resources`
      },
      {
        label: 'Curriculum assessment activity',
        value: curriculum.totalCourses ? (curriculum.totalAssignments / curriculum.totalCourses) * 100 : 0,
        detail: `${curriculum.totalAssignments || 0} assignments across ${curriculum.totalCourses || 0} courses`
      },
      {
        label: 'Transcript coverage',
        value: community.totalStudents ? (curriculum.transcriptCount / community.totalStudents) * 100 : 0,
        detail: `${curriculum.transcriptCount || 0} transcripts for ${community.totalStudents || 0} students`
      },
      {
        label: 'Student GPA visibility',
        value: students.length ? (avgGpaCount / students.length) * 100 : 0,
        detail: `${avgGpaCount} of ${students.length} student records include a GPA`
      },
      {
        label: 'Staff performance health',
        value: staff.averagePerformance || 0,
        detail: `${staff.totalStaff || 0} staff accounts with ${staff.averagePerformance || 0}% average score`
      },
      {
        label: 'Community communication',
        value: community.totalUsers ? (community.totalMessages / community.totalUsers) * 100 : 0,
        detail: `${community.totalMessages || 0} messages across ${community.totalUsers || 0} users`
      }
    ];
  }, [overview, students]);

  if (error) {
    return <div className="admin-dashboard"><p className="admin-error">{error}</p></div>;
  }

  if (!overview) {
    return <div className="admin-dashboard"><p className="admin-loading">Loading progress...</p></div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <p className="admin-kicker">Admin Tracking</p>
          <h1>Progress Dashboard</h1>
        </div>
      </header>

      <section className="admin-panel admin-progress-panel">
        {progress.map((item) => (
          <ProgressRow key={item.label} {...item} />
        ))}
      </section>
    </div>
  );
}
