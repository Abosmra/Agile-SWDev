import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([
    {
      id: 1,
      hallName: 'Conference Room A',
      date: '2026-05-15',
      startTime: '10:00',
      endTime: '12:00',
      purpose: 'Project Meeting',
      attendees: 20,
      status: 'Confirmed',
      bookingRef: 'BK-001-2026',
      hallCapacity: 50
    },
    {
      id: 2,
      hallName: 'Auditorium B',
      date: '2026-05-20',
      startTime: '14:00',
      endTime: '17:00',
      purpose: 'Seminar on AI',
      attendees: 150,
      status: 'Confirmed',
      bookingRef: 'BK-002-2026',
      hallCapacity: 200
    },
    {
      id: 3,
      hallName: 'Meeting Room D',
      date: '2026-05-25',
      startTime: '09:00',
      endTime: '10:30',
      purpose: 'Team Standup',
      attendees: 8,
      status: 'Pending',
      bookingRef: 'BK-003-2026',
      hallCapacity: 15
    },
    {
      id: 4,
      hallName: 'Seminar Room E',
      date: '2026-05-10',
      startTime: '15:00',
      endTime: '16:30',
      purpose: 'Workshop',
      attendees: 60,
      status: 'Completed',
      bookingRef: 'BK-004-2026',
      hallCapacity: 80
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [cancelModal, setCancelModal] = useState({ show: false, bookingId: null });
  const [modifyModal, setModifyModal] = useState({ show: false, booking: null });

  const cancelBooking = (bookingId) => {
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'Cancelled' } : b
    ));
    setCancelModal({ show: false, bookingId: null });
    alert('Booking cancelled successfully!');
  };

  const handleModify = (booking) => {
    setModifyModal({ show: true, booking: { ...booking } });
  };

  const handleModifySubmit = (updatedBooking) => {
    setBookings(bookings.map(b =>
      b.id === updatedBooking.id ? updatedBooking : b
    ));
    setModifyModal({ show: false, booking: null });
    alert('Booking updated successfully!');
  };
  const [cancelModal, setCancelModal] = useState({ show: false, bookingId: null });
  const [modifyModal, setModifyModal] = useState({ show: false, booking: null });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return '#4CAF50';
      case 'Pending':
        return '#ff9800';
      case 'Completed':
        return '#667eea';
      case 'Cancelled':
        return '#f44336';
      default:
        return '#7f8c8d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Confirmed':
        return '✓';
      case 'Pending':
        return '⏳';
      case 'Completed':
        return '✓✓';
      case 'Cancelled':
        return '✗';
      default:
        return '•';
    }
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status.toLowerCase() === filter.toLowerCase());

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isUpcoming = (dateStr) => {
    const today = new Date();
    const bookingDate = new Date(dateStr + 'T00:00:00');
    return bookingDate >= today;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>My Bookings</h1>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        {['all', 'confirmed', 'pending', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '10px 20px',
              border: filter === status ? '2px solid #667eea' : '1px solid #e0e0e0',
              background: filter === status ? '#f0f7ff' : 'white',
              color: filter === status ? '#667eea' : '#7f8c8d',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              textTransform: 'capitalize'
            }}
          >
            {status === 'all' ? 'All Bookings' : status}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '50px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📭</div>
          <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>No bookings found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e0e0e0',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Header with Status */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                alignItems: 'center',
                padding: '20px',
                borderBottom: '1px solid #e0e0e0',
                background: '#f9f9f9'
              }}>
                <div style={{
                  fontSize: '2rem',
                  marginRight: '15px'
                }}>
                  🏛️
                </div>

                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
                    {booking.hallName}
                  </h3>
                  <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>
                    Ref: {booking.bookingRef}
                  </p>
                </div>

                <div style={{
                  background: getStatusColor(booking.status),
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <span>{getStatusIcon(booking.status)}</span>
                  <span>{booking.status}</span>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '20px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  {/* Date and Time */}
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#667eea' }}>
                      📅 Date & Time
                    </p>
                    <p style={{ margin: 0, color: '#2c3e50' }}>
                      {formatDate(booking.date)}
                    </p>
                    <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                      {booking.startTime} - {booking.endTime}
                    </p>
                  </div>

                  {/* Duration */}
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#667eea' }}>
                      ⏱️ Duration
                    </p>
                    <p style={{ margin: 0, color: '#2c3e50' }}>
                      {Math.abs(parseInt(booking.endTime.split(':')[0]) - parseInt(booking.startTime.split(':')[0]))} hours
                    </p>
                  </div>

                  {/* Purpose */}
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#667eea' }}>
                      📌 Purpose
                    </p>
                    <p style={{ margin: 0, color: '#2c3e50' }}>
                      {booking.purpose}
                    </p>
                  </div>

                  {/* Attendees */}
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#667eea' }}>
                      👥 Attendees
                    </p>
                    <p style={{ margin: 0, color: '#2c3e50' }}>
                      {booking.attendees} / {booking.hallCapacity}
                    </p>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div style={{
                  background: '#f0f0f0',
                  borderRadius: '8px',
                  height: '8px',
                  marginBottom: '20px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    height: '100%',
                    width: `${(booking.attendees / booking.hallCapacity) * 100}%`
                  }} />
                </div>

                {/* Actions */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '10px'
                }}>
                  {isUpcoming(booking.date) && booking.status === 'Confirmed' && (
                    <>
                      <button
                        onClick={() => handleModify(booking)}
                        style={{
                          padding: '10px',
                          background: '#fff3cd',
                          color: '#ff9800',
                          border: '1px solid #ffc107',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#ffe082'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#fff3cd'}
                      >
                        ✏️ Modify
                      </button>
                      <button
                        onClick={() => setCancelModal({ show: true, bookingId: booking.id })}
                        style={{
                          padding: '10px',
                          background: '#ffebee',
                          color: '#f44336',
                          border: '1px solid #f44336',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#ffcdd2'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#ffebee'}
                      >
                        ✗ Cancel
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => navigate(`/hall-details/${booking.id}`)}
                    style={{
                      padding: '10px',
                      background: '#e8f4f8',
                      color: '#667eea',
                      border: '1px solid #667eea',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#d4ebf7'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#e8f4f8'}
                  >
                    👁️ View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Booking Button */}
      <div style={{
        marginTop: '30px',
        textAlign: 'center'
      }}>
        <button
          onClick={() => navigate('/book-hall')}
          style={{
            padding: '15px 40px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}
        >
          + New Booking
        </button>
      </div>
    </div>
  );
}
