import React, { useState, useEffect } from 'react';
import { announcements } from '../Data/announcements';

export default function Announcements() {
  const [announcementsList, setAnnouncementsList] = useState([]);

  useEffect(() => {
    setAnnouncementsList(announcements);
  }, []);

  return (
    <div className="announcements-page">
      <h1>Announcements</h1>
      <div className="announcements-container">
        {announcementsList.map((announcement, index) => (
          <div key={index} className="announcement-item">
            <h3>{announcement.title}</h3>
            <p>{announcement.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
