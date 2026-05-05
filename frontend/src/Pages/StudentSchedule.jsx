import React, { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../api';
import '../css/StudentSchedule.css';

const STORAGE_KEY = 'selectedScheduleGroup';

function groupColumns(columns) {
  const grouped = [];
  columns.forEach((column) => {
    const last = grouped[grouped.length - 1];
    if (last && last.day === column.day) {
      last.columns.push(column);
    } else {
      grouped.push({
        day: column.day,
        columns: [column]
      });
    }
  });
  return grouped;
}

export default function StudentSchedule() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(
    () => localStorage.getItem(STORAGE_KEY) || ''
  );
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  /* ================= LOAD GROUPS ================= */
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const availableGroups = await apiGet('/api/schedules/groups');
        setGroups(availableGroups);

        const savedGroup = localStorage.getItem(STORAGE_KEY) || '';
        const initialGroup =
          availableGroups.includes(savedGroup)
            ? savedGroup
            : availableGroups[0];

        setSelectedGroup(initialGroup);
      } catch (err) {
        setError(err.message || 'Unable to load schedule groups.');
        setIsLoading(false);
      }
    };

    loadGroups();
  }, []);

  /* ================= LOAD SCHEDULE ================= */
  useEffect(() => {
    if (!selectedGroup) return;

    localStorage.setItem(STORAGE_KEY, selectedGroup);

    const loadSchedule = async () => {
      setIsLoading(true);
      setError('');

      try {
        const data = await apiGet(
          `/api/schedules?group=${encodeURIComponent(selectedGroup)}`
        );

        setSchedule(data.schedule);
        setGroups(data.groups);
      } catch (err) {
        setError(err.message || 'Unable to load the selected schedule.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSchedule();
  }, [selectedGroup]);

  const dayGroups = useMemo(
    () => groupColumns(schedule?.columns || []),
    [schedule]
  );

  /* ================= RENDER ================= */
  return (
    <div className="schedule-page">
      <div className="schedule-container">

        {/* ================= HEADER ================= */}
        <div className="schedule-header">

          <div className="schedule-title">
            <h2>My Schedule</h2>
            <p>Live schedule from the shared Google Sheet for all groups.</p>
          </div>

          <div className="group-selector">
            <label>Select your group</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* ================= ERROR ================= */}
        {error && <div className="error-text">{error}</div>}

        {/* ================= LOADING ================= */}
        {isLoading ? (
          <div className="loading-text">Loading schedule...</div>
        ) : schedule ? (
          <div className="schedule-card">

            {/* TITLE */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>
                {schedule.title || selectedGroup}
              </h3>
              <p style={{ margin: 0, color: '#7f8c8d' }}>
                {selectedGroup}
              </p>
            </div>

            {/* TABLE */}
            <table className="schedule-table">

              {/* HEADER ROW 1 */}
              <thead>
                <tr>
                  <th>Slot</th>
                  <th>Time</th>

                  {dayGroups.map((dayGroup) => (
                    <th
                      key={dayGroup.day}
                      colSpan={dayGroup.columns.length}
                    >
                      {dayGroup.day}
                    </th>
                  ))}
                </tr>

                {/* HEADER ROW 2 */}
                <tr>
                  <th />
                  <th />

                  {schedule.columns.map((column) => (
                    <th key={column.key}>
                      {column.session}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* BODY */}
              <tbody>
                {schedule.sessions.map((row, index) => (
                  <tr
                    key={`${row.slot}-${index}`}
                    className={row.isBreak ? 'break-row' : ''}
                  >

                    <td className="slot-cell">{row.slot}</td>

                    <td>{row.time}</td>

                    {row.entries.map((entry) => (
                      <td
                        key={`${row.slot}-${entry.key}`}
                        className={!entry.value ? 'empty-cell' : ''}
                      >
                        {entry.value || '-'}
                      </td>
                    ))}

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        ) : null}

      </div>
    </div>
  );
}