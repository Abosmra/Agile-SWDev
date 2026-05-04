import React, { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../api';

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
  const [selectedGroup, setSelectedGroup] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const availableGroups = await apiGet('/api/schedules/groups');
        setGroups(availableGroups);
        const savedGroup = localStorage.getItem(STORAGE_KEY) || '';
        const initialGroup = availableGroups.includes(savedGroup) ? savedGroup : availableGroups[0];
        setSelectedGroup(initialGroup);
      } catch (err) {
        setError(err.message || 'Unable to load schedule groups.');
        setIsLoading(false);
      }
    };

    loadGroups();
  }, []);

  useEffect(() => {
    if (!selectedGroup) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, selectedGroup);

    const loadSchedule = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await apiGet(`/api/schedules?group=${encodeURIComponent(selectedGroup)}`);
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

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'end', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ marginBottom: '8px' }}>My Schedule</h2>
          <p style={{ color: '#7f8c8d', margin: 0 }}>
            Live schedule from the shared Google Sheet for all groups.
          </p>
        </div>

        <div style={{ minWidth: '260px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
            Select your group
          </label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #d0d7de',
              fontSize: '0.95rem',
              background: 'white'
            }}
          >
            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: '20px', color: '#c0392b' }}>{error}</div>
      )}

      {isLoading ? (
        <div style={{ marginTop: '20px', color: '#7f8c8d' }}>Loading schedule...</div>
      ) : schedule ? (
        <div style={{ overflowX: 'auto', marginTop: '20px', background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 6px 0', color: '#2c3e50' }}>{schedule.title || selectedGroup}</h3>
            <p style={{ margin: 0, color: '#7f8c8d' }}>{selectedGroup}</p>
          </div>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #d0d7de',
              minWidth: '1200px'
            }}
          >
            <thead>
              <tr style={{ background: '#eef3ff' }}>
                <th style={{ border: '1px solid #d0d7de', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>Slot</th>
                <th style={{ border: '1px solid #d0d7de', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>Time</th>
                {dayGroups.map((dayGroup) => (
                  <th
                    key={dayGroup.day}
                    colSpan={dayGroup.columns.length}
                    style={{ border: '1px solid #d0d7de', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}
                  >
                    {dayGroup.day}
                  </th>
                ))}
              </tr>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ border: '1px solid #d0d7de', padding: '8px', textAlign: 'center' }} />
                <th style={{ border: '1px solid #d0d7de', padding: '8px', textAlign: 'center' }} />
                {schedule.columns.map((column) => (
                  <th
                    key={column.key}
                    style={{ border: '1px solid #d0d7de', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}
                  >
                    {column.session}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedule.sessions.map((row, index) => (
                <tr
                  key={`${row.slot}-${index}`}
                  style={{
                    background: row.isBreak ? '#fff8c5' : index % 2 === 0 ? '#ffffff' : '#fafafa'
                  }}
                >
                  <td style={{ border: '1px solid #d0d7de', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                    {row.slot}
                  </td>
                  <td style={{ border: '1px solid #d0d7de', padding: '10px', textAlign: 'center', fontWeight: row.isBreak ? 'bold' : 'normal' }}>
                    {row.time}
                  </td>
                  {row.entries.map((entry) => (
                    <td
                      key={`${row.slot}-${entry.key}`}
                      style={{
                        border: '1px solid #d0d7de',
                        padding: '8px',
                        textAlign: 'center',
                        fontSize: '12px',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.4',
                        color: entry.value ? '#2c3e50' : '#b0b7c3'
                      }}
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
  );
}
