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

  const formatDate = (date) => {
    if (!date) return null;
    if (date.includes('hour') || date.includes('minute') || date.includes('day')) return date;
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="ann-page">
      <div className="ann-hero">
        <div>
          <h1 className="ann-title">Announcements</h1>
          <p className="ann-subtitle">Live news from Ain Shams University Faculty of Engineering</p>
        </div>
        {!isLoading && !error && (
          <span className="ann-count">{announcementsList.length} updates</span>
        )}
      </div>

      {isLoading && (
        <div className="ann-state">
          <div className="ann-spinner" />
          <p>Loading announcements...</p>
        </div>
      )}

      {error && (
        <div className="ann-state ann-error">
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="ann-list">
          {announcementsList.length === 0 ? (
            <div className="ann-state">
              <p>No announcements available.</p>
            </div>
          ) : (
            announcementsList.map((ann, index) => (
              <div key={ann.id || index} className="ann-card">
                <div className="ann-card-index">{index + 1}</div>
                <div className="ann-card-body">
                  <h3 className="ann-card-title">{ann.title}</h3>
                  <p className="ann-card-content">
                    {ann.content || 'Latest headline from the faculty news page.'}
                  </p>
                  <div className="ann-card-footer">
                    {ann.date && (
                      <span className="ann-card-date">{formatDate(ann.date)}</span>
                    )}
                    {ann.sourceUrl && (
                      <a
                        className="ann-card-link"
                        href={ann.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Read more →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
