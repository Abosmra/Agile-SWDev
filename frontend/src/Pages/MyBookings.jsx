import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiDelete, apiGet, apiPut } from '../api';
import NotificationToast from '../Components/NotificationToast';

function mapBooking(b) {
  return {
    id: b.BookingID,
    hallId: b.HallID,
    hallName: b.HallName,
    date: b.Date,
    startTime: b.StartTime,
    endTime: b.EndTime,
    purpose: b.Purpose,
    attendees: b.Attendees || 0,
    status: b.Status,
    bookingRef: `BK-${String(b.BookingID).padStart(3, '0')}-${new Date(b.Date).getFullYear()}`,
    hallCapacity: b.Capacity || 0,
    contact: b.Contact || ''
  };
}

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState({ show: false, bookingId: null });
  const [modifyModal, setModifyModal] = useState({ show: false, booking: null });

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await apiGet('/api/bookings');
        setBookings(data.map(mapBooking));
      } catch (err) {
        setError(err.message || 'Unable to load bookings.');
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, []);

  const cancelBooking = async (bookingId) => {
    try {
      const updated = await apiDelete(`/api/bookings/${bookingId}`);
      setBookings(bookings.map((b) => (b.id === bookingId ? mapBooking(updated) : b)));
      setCancelModal({ show: false, bookingId: null });
      alert('Booking cancelled successfully!');
    } catch (err) {
      setError(err.message || 'Unable to cancel booking.');
      setCancelModal({ show: false, bookingId: null });
    }
  };

  const handleModify = (booking) => {
    setModifyModal({ show: true, booking: { ...booking } });
  };

  const handleModifySubmit = async (updatedBooking) => {
    try {
      const saved = await apiPut(`/api/bookings/${updatedBooking.id}`, {
        Date: updatedBooking.date,
        StartTime: updatedBooking.startTime,
        EndTime: updatedBooking.endTime,
        Purpose: updatedBooking.purpose,
        Attendees: updatedBooking.attendees,
        Contact: updatedBooking.contact,
        Status: updatedBooking.status
      });
      setBookings(bookings.map((b) => (b.id === updatedBooking.id ? mapBooking(saved) : b)));
      setModifyModal({ show: false, booking: null });
      alert('Booking updated successfully!');
    } catch (err) {
      setError(err.message || 'Unable to update booking.');
    }
  };

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
    : bookings.filter((b) => b.status.toLowerCase() === filter.toLowerCase());

  const formatDate = (dateStr) => {
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isUpcoming = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(`${dateStr}T00:00:00`);
    return bookingDate >= today;
  };

  const getDurationHours = (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return ((end - start) / (1000 * 60 * 60)).toFixed(1);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>My Bookings</h1>
        <p style={{ color: '#7f8c8d' }}>Manage and track your hall reservations</p>
        {error && <p style={{ color: '#c0392b', marginTop: '10px' }}>{error}</p>}
      </div>

      {isLoading ? (
        <p style={{ color: '#7f8c8d' }}>Loading bookings...</p>
      ) : (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '15px',
              marginBottom: '30px'
            }}
          >
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '5px' }}>{bookings.length}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Bookings</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', color: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '5px' }}>{bookings.filter((b) => b.status === 'Confirmed').length}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Confirmed</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #ff9800 0%, #e68900 100%)', color: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '5px' }}>{bookings.filter((b) => b.status === 'Pending').length}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Pending</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #f44336 0%, #da190b 100%)', color: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '5px' }}>{bookings.filter((b) => b.status === 'Cancelled').length}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Cancelled</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
            {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((status) => (
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

          {filteredBookings.length === 0 ? (
            <div style={{ background: 'white', padding: '50px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>No bookings yet</div>
              <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>No bookings found</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {filteredBookings.map((booking) => (
                <div key={booking.id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e0e0e0', background: '#f9f9f9' }}>
                    <div style={{ fontSize: '2rem', marginRight: '15px' }}>🏛️</div>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{booking.hallName}</h3>
                      <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>Ref: {booking.bookingRef}</p>
                    </div>
                    <div style={{ background: getStatusColor(booking.status), color: 'white', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>{getStatusIcon(booking.status)}</span>
                      <span>{booking.status}</span>
                    </div>
                  </div>

                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                      <div>
                        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#667eea' }}>Date & Time</p>
                        <p style={{ margin: 0, color: '#2c3e50' }}>{formatDate(booking.date)}</p>
                        <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>{booking.startTime} - {booking.endTime}</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#667eea' }}>Duration</p>
                        <p style={{ margin: 0, color: '#2c3e50' }}>{getDurationHours(booking.startTime, booking.endTime)} hours</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#667eea' }}>Purpose</p>
                        <p style={{ margin: 0, color: '#2c3e50' }}>{booking.purpose}</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#667eea' }}>Attendees</p>
                        <p style={{ margin: 0, color: '#2c3e50' }}>{booking.attendees} / {booking.hallCapacity}</p>
                      </div>
                    </div>

                    <div style={{ background: '#f0f0f0', borderRadius: '8px', height: '8px', marginBottom: '20px', overflow: 'hidden' }}>
                      <div
                        style={{
                          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                          height: '100%',
                          width: booking.hallCapacity > 0 ? `${Math.min((booking.attendees / booking.hallCapacity) * 100, 100)}%` : '0%'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                      {isUpcoming(booking.date) && booking.status !== 'Cancelled' && (
                        <>
                          <button
                            onClick={() => handleModify(booking)}
                            style={{ padding: '10px', background: '#fff3cd', color: '#ff9800', border: '1px solid #ffc107', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            Modify
                          </button>
                          <button
                            onClick={() => setCancelModal({ show: true, bookingId: booking.id })}
                            style={{ padding: '10px', background: '#ffebee', color: '#f44336', border: '1px solid #f44336', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => navigate(`/hall-details/${booking.hallId}`)}
                        style={{ padding: '10px', background: '#e8f4f8', color: '#667eea', border: '1px solid #667eea', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <button
              onClick={() => navigate('/book-hall')}
              style={{ padding: '15px 40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
            >
              + New Booking
            </button>
          </div>

          {cancelModal.show && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div style={{ background: 'white', padding: '30px', borderRadius: '12px', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>!</div>
                <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>Cancel Booking?</h2>
                <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
                  Are you sure you want to cancel this booking? This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    onClick={() => setCancelModal({ show: false, bookingId: null })}
                    style={{ padding: '12px 25px', background: '#f0f0f0', border: '1px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={() => cancelBooking(cancelModal.bookingId)}
                    style={{ padding: '12px 25px', background: '#f44336', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Yes, Cancel Booking
                  </button>
                </div>
              </div>
            </div>
          )}

          {modifyModal.show && modifyModal.booking && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }}>
              <div style={{ background: 'white', padding: '30px', borderRadius: '12px', maxWidth: '500px', width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
                <h2 style={{ color: '#2c3e50', marginBottom: '25px' }}>Modify Booking</h2>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#2c3e50' }}>Date</label>
                  <input
                    type="date"
                    value={modifyModal.booking.date}
                    onChange={(e) => setModifyModal({ ...modifyModal, booking: { ...modifyModal.booking, date: e.target.value } })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#2c3e50' }}>Start Time</label>
                  <input
                    type="time"
                    value={modifyModal.booking.startTime}
                    onChange={(e) => setModifyModal({ ...modifyModal, booking: { ...modifyModal.booking, startTime: e.target.value } })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#2c3e50' }}>End Time</label>
                  <input
                    type="time"
                    value={modifyModal.booking.endTime}
                    onChange={(e) => setModifyModal({ ...modifyModal, booking: { ...modifyModal.booking, endTime: e.target.value } })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#2c3e50' }}>Purpose</label>
                  <input
                    type="text"
                    value={modifyModal.booking.purpose}
                    onChange={(e) => setModifyModal({ ...modifyModal, booking: { ...modifyModal.booking, purpose: e.target.value } })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#2c3e50' }}>Attendees</label>
                  <input
                    type="number"
                    value={modifyModal.booking.attendees}
                    onChange={(e) => setModifyModal({ ...modifyModal, booking: { ...modifyModal.booking, attendees: parseInt(e.target.value, 10) || 0 } })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#2c3e50' }}>Contact</label>
                  <input
                    type="text"
                    value={modifyModal.booking.contact}
                    onChange={(e) => setModifyModal({ ...modifyModal, booking: { ...modifyModal.booking, contact: e.target.value } })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                  <button
                    onClick={() => setModifyModal({ show: false, booking: null })}
                    style={{ flex: 1, padding: '12px', background: '#f0f0f0', border: '1px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleModifySubmit(modifyModal.booking)}
                    style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
