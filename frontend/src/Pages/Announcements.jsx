import React, { useState, useEffect } from 'react';
import { apiGet } from '../api';

export default function Announcements() {
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const data = await apiGet('/api/announcements');
        setAnnouncementsList(data.map((ann) => ({
          id: ann.id || ann.AnnouncementID,
          title: ann.title || ann.Title,
          content: ann.content || ann.Content,
          date: ann.date || ann.Date,
          sourceUrl: ann.sourceUrl
        })));
      } catch (err) {
        setError(err.message || 'Unable to load announcements.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  if (isLoading) {
    return (
      <div className="announcements-page">
        <h1>Announcements</h1>
        <div className="announcements-container">
          <p style={{ color: '#7f8c8d' }}>⏳ Loading announcements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="announcements-page">
        <h1>Announcements</h1>
        <div className="announcements-container">
          <p style={{ color: '#c0392b' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="announcements-page">
      <h1>Announcements</h1>
      <div className="announcements-container">
        <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
          Live news from Ain Shams Engineering
        </p>
        {announcementsList.length > 0 ? (
          announcementsList.map((announcement, index) => (
            <div key={announcement.id || index} className="announcement-item">
              <h3>{announcement.title}</h3>
              {announcement.content ? (
                <p>{announcement.content}</p>
              ) : (
                <p style={{ color: '#7f8c8d' }}>
                  Latest headline from the faculty news page.
                </p>
              )}
              {announcement.date && (
                <p style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                  {announcement.date.includes('hour') || announcement.date.includes('minute') || announcement.date.includes('day')
                    ? announcement.date
                    : new Date(announcement.date).toLocaleDateString()}
                </p>
              )}
              {announcement.sourceUrl && (
                <a
                  href={announcement.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#667eea', fontWeight: 'bold' }}
                >
                  Read more
                </a>
              )}
            </div>
          ))
        ) : (
          <p style={{ color: '#7f8c8d' }}>No announcements available.</p>
        )}
      </div>
    </div>
  );
}
