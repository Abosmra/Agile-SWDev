import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Events() {
  const navigate = useNavigate();
  const [filterCategory, setFilterCategory] = useState('all');

  const eventsData = [
    {
      id: 1,
      title: 'Spring Conference 2026',
      category: 'Conference',
      date: '2026-05-25',
      time: '09:00 - 17:00',
      location: 'Auditorium B',
      description: 'Annual spring conference featuring keynote speakers from leading tech companies and panel discussions.',
      attendees: 150,
      registered: true,
      image: '📋'
    },
    {
      id: 2,
      title: 'AI & Machine Learning Workshop',
      category: 'Workshop',
      date: '2026-05-20',
      time: '10:00 - 12:30',
      location: 'Lab Room C',
      description: 'Hands-on workshop covering latest advances in AI and practical ML implementation.',
      attendees: 40,
      registered: false,
      image: '🤖'
    },
    {
      id: 3,
      title: 'Student Leadership Summit',
      category: 'Summit',
      date: '2026-06-10',
      time: '14:00 - 18:00',
      location: 'Conference Room A',
      description: 'Inspiring summit for student leaders discussing campus initiatives and community engagement.',
      attendees: 200,
      registered: true,
      image: '🎯'
    },
    {
      id: 4,
      title: 'Networking Social Event',
      category: 'Social',
      date: '2026-05-22',
      time: '18:00 - 20:00',
      location: 'Seminar Room E',
      description: 'Casual networking event to connect with peers, alumni, and industry professionals.',
      attendees: 100,
      registered: false,
      image: '🤝'
    },
    {
      id: 5,
      title: 'Career Fair 2026',
      category: 'Career',
      date: '2026-06-05',
      time: '10:00 - 16:00',
      location: 'Multiple Halls',
      description: 'Connect with top employers, explore internship and job opportunities across industries.',
      attendees: 500,
      registered: true,
      image: '💼'
    },
    {
      id: 6,
      title: 'Innovation Hackathon',
      category: 'Competition',
      date: '2026-05-28',
      time: '09:00 - 21:00',
      location: 'Lab Room C',
      description: '24-hour hackathon to build innovative solutions with prizes and mentorship.',
      attendees: 80,
      registered: false,
      image: '💡'
    }
  ];

  const categories = ['all', 'Conference', 'Workshop', 'Summit', 'Social', 'Career', 'Competition'];

  const filteredEvents = filterCategory === 'all' 
    ? eventsData 
    : eventsData.filter(event => event.category === filterCategory);

  const getEventColor = (category) => {
    const colors = {
      'Conference': '#667eea',
      'Workshop': '#764ba2',
      'Summit': '#f093fb',
      'Social': '#4facfe',
      'Career': '#43e97b',
      'Competition': '#fa709a'
    };
    return colors[category] || '#667eea';
  };

  const isUpcoming = (dateStr) => {
    const today = new Date();
    const eventDate = new Date(dateStr + 'T00:00:00');
    return eventDate >= today;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>Events</h1>
        <p style={{ color: '#7f8c8d' }}>Stay updated with upcoming campus events and activities</p>
      </div>

      {/* Category Filter */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilterCategory(category)}
            style={{
              padding: '10px 20px',
              border: filterCategory === category ? '2px solid #667eea' : '1px solid #e0e0e0',
              background: filterCategory === category ? '#f0f7ff' : 'white',
              color: filterCategory === category ? '#667eea' : '#7f8c8d',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (filterCategory !== category) {
                e.target.style.borderColor = '#667eea';
              }
            }}
            onMouseLeave={(e) => {
              if (filterCategory !== category) {
                e.target.style.borderColor = '#e0e0e0';
              }
            }}
          >
            {category === 'all' ? 'All Events' : category}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '50px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📭</div>
          <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>No events found in this category</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e0e0e0',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }}
            >
              {/* Header */}
              <div style={{
                background: `linear-gradient(135deg, ${getEventColor(event.category)} 0%, ${getEventColor(event.category)}dd 100%)`,
                padding: '25px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{ fontSize: '3rem' }}>{event.image}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>
                    {event.title}
                  </h3>
                  <span style={{
                    background: 'rgba(255,255,255,0.3)',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    display: 'inline-block'
                  }}>
                    {event.category}
                  </span>
                </div>
                {event.registered && (
                  <div style={{
                    background: '#4CAF50',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}>
                    ✓ Registered
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: '20px', flex: 1 }}>
                {/* Date & Time */}
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#667eea', fontSize: '0.9rem' }}>
                    📅 {formatDate(event.date)}
                  </p>
                  <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.85rem' }}>
                    🕐 {event.time}
                  </p>
                </div>

                {/* Location */}
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>
                    📍 {event.location}
                  </p>
                </div>

                {/* Description */}
                <p style={{
                  margin: '15px 0',
                  color: '#555',
                  fontSize: '0.9rem',
                  lineHeight: '1.5'
                }}>
                  {event.description}
                </p>

                {/* Attendees */}
                <div style={{
                  background: '#f5f5f5',
                  padding: '10px',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  color: '#667eea',
                  fontWeight: 'bold'
                }}>
                  👥 {event.attendees} people interested
                </div>
              </div>

              {/* Footer Buttons */}
              <div style={{
                padding: '20px',
                borderTop: '1px solid #e0e0e0',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px'
              }}>
                <button
                  onClick={() => setFilterCategory(event.category)}
                  style={{
                    padding: '10px',
                    background: '#f0f0f0',
                    color: '#667eea',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#e0e0e0'}
                  onMouseLeave={(e) => e.target.style.background = '#f0f0f0'}
                >
                  More {event.category}
                </button>
                <button
                  style={{
                    padding: '10px',
                    background: event.registered ? '#4CAF50' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  {event.registered ? '✓ Registered' : 'Register'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
