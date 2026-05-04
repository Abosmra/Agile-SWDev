import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BookHall() {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedHallId = location.state?.hallId;
  const preSelectedHallName = location.state?.hallName;

  // Sample existing bookings for double-booking prevention
  const existingBookings = [
    { hallId: 1, date: '2026-05-15', startTime: '10:00', endTime: '12:00', status: 'Confirmed' },
    { hallId: 2, date: '2026-05-20', startTime: '14:00', endTime: '17:00', status: 'Confirmed' },
    { hallId: 1, date: '2026-05-18', startTime: '09:00', endTime: '11:00', status: 'Confirmed' }
  ];

  const hallsData = [
    { id: 1, name: 'Conference Room A', capacity: 50, available: true },
    { id: 2, name: 'Auditorium B', capacity: 200, available: true },
    { id: 3, name: 'Lab Room C', capacity: 30, available: false },
    { id: 4, name: 'Meeting Room D', capacity: 15, available: true },
    { id: 5, name: 'Seminar Room E', capacity: 80, available: true },
    { id: 6, name: 'Studio F', capacity: 25, available: true }
  ];

  const [formData, setFormData] = useState({
    hall: preSelectedHallId || '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: '',
    contact: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [bookingConflict, setBookingConflict] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Clear conflict warning when changing date/time
    if (['date', 'startTime', 'endTime', 'hall'].includes(name)) {
      setBookingConflict(null);
    }
  };

  // Check for booking conflicts (double-booking prevention)
  const checkBookingConflict = (hallId, date, startTime, endTime) => {
    const conflict = existingBookings.find(booking => {
      if (booking.hallId !== parseInt(hallId)) return false;
      if (booking.date !== date) return false;
      
      const existingStart = parseInt(booking.startTime.replace(':', ''));
      const existingEnd = parseInt(booking.endTime.replace(':', ''));
      const newStart = parseInt(startTime.replace(':', ''));
      const newEnd = parseInt(endTime.replace(':', ''));
      
      // Check for time overlap
      return (newStart < existingEnd && newEnd > existingStart);
    });
    
    return conflict;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.hall) newErrors.hall = 'Please select a hall';
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.startTime) newErrors.startTime = 'Please select start time';
    if (!formData.endTime) newErrors.endTime = 'Please select end time';
    if (!formData.purpose) newErrors.purpose = 'Please enter the purpose';
    if (!formData.attendees) newErrors.attendees = 'Please enter number of attendees';
    if (!formData.contact) newErrors.contact = 'Please enter contact number';
    
    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    const today = new Date().toISOString().split('T')[0];
    if (formData.date && formData.date < today) {
      newErrors.date = 'Please select a future date';
    }

    // Validate attendees capacity
    if (selectedHall && formData.attendees) {
      const attendeesNum = parseInt(formData.attendees);
      if (attendeesNum > selectedHall.capacity) {
        newErrors.attendees = `Maximum capacity is ${selectedHall.capacity} people`;
      }
    }

    // Check for double-booking conflicts
    if (formData.hall && formData.date && formData.startTime && formData.endTime) {
      const conflict = checkBookingConflict(formData.hall, formData.date, formData.startTime, formData.endTime);
      if (conflict) {
        setBookingConflict(conflict);
        newErrors.dateTime = 'This time slot is already booked. Please select a different time.';
      }
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setSubmitted(true);
      console.log('Booking submitted:', formData);
      // Show success message
      alert('Hall booked successfully! Confirmation email sent to your registered email.');
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
    } else {
      setErrors(newErrors);
    }
  };

  const selectedHall = hallsData.find(h => h.id === parseInt(formData.hall));
  const availableHalls = hallsData.filter(h => h.available);

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Book a Hall</h1>

      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e0e0e0'
      }}>
        <form onSubmit={handleSubmit}>
          {/* Hall Selection */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#2c3e50'
            }}>
              Select Hall <span style={{ color: '#f44336' }}>*</span>
            </label>
            <select
              name="hall"
              value={formData.hall}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: errors.hall ? '2px solid #f44336' : '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            >
              <option value="">-- Select a Hall --</option>
              {availableHalls.map(hall => (
                <option key={hall.id} value={hall.id}>
                  {hall.name} (Capacity: {hall.capacity})
                </option>
              ))}
            </select>
            {errors.hall && <p style={{ color: '#f44336', fontSize: '0.9rem', margin: '5px 0 0 0' }}>{errors.hall}</p>}
          </div>

          {/* Hall Details */}
          {selectedHall && (
            <div style={{
              background: '#f0f7ff',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '25px',
              border: '1px solid #667eea'
            }}>
              <p style={{ margin: 0, color: '#667eea', fontWeight: 'bold' }}>
                ✓ {selectedHall.name} selected (Max: {selectedHall.capacity} people)
              </p>
            </div>
          )}

          {/* Date Selection */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#2c3e50'
            }}>
              Date <span style={{ color: '#f44336' }}>*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: '12px',
                border: errors.date ? '2px solid #f44336' : '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
            {errors.date && <p style={{ color: '#f44336', fontSize: '0.9rem', margin: '5px 0 0 0' }}>{errors.date}</p>}
          </div>

          {/* Time Selection Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
            {/* Start Time */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: '#2c3e50'
              }}>
                Start Time <span style={{ color: '#f44336' }}>*</span>
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.startTime ? '2px solid #f44336' : '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              {errors.startTime && <p style={{ color: '#f44336', fontSize: '0.9rem', margin: '5px 0 0 0' }}>{errors.startTime}</p>}
            </div>

            {/* End Time */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: '#2c3e50'
              }}>
                End Time <span style={{ color: '#f44336' }}>*</span>
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.endTime ? '2px solid #f44336' : '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              {errors.endTime && <p style={{ color: '#f44336', fontSize: '0.9rem', margin: '5px 0 0 0' }}>{errors.endTime}</p>}
            </div>
          </div>

          {/* Duration Display */}
          {formData.startTime && formData.endTime && formData.startTime < formData.endTime && (
            <div style={{
              background: '#f0f7ff',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '25px',
              border: '1px solid #667eea',
              color: '#667eea',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              ⏱️ Duration: {Math.round((new Date(`2000-01-01T${formData.endTime}`) - new Date(`2000-01-01T${formData.startTime}`)) / 60000)} minutes
            </div>
          )}

          {/* Booking Conflict Warning */}
          {bookingConflict && (
            <div style={{
              background: '#fff3cd',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '25px',
              border: '2px solid #ffc107',
              color: '#856404'
            }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '1.05rem' }}>
                ⚠️ Time Slot Conflict Detected
              </p>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                This time slot is already booked from {bookingConflict.startTime} to {bookingConflict.endTime} on {bookingConflict.date}.
              </p>
              <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
                Please select a different time or date to proceed with your booking.
              </p>
            </div>
          )}

          {/* Purpose */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#2c3e50'
            }}>
              Purpose <span style={{ color: '#f44336' }}>*</span>
            </label>
            <input
              type="text"
              name="purpose"
              placeholder="e.g., Class lecture, Team meeting, Seminar"
              value={formData.purpose}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: errors.purpose ? '2px solid #f44336' : '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
            {errors.purpose && <p style={{ color: '#f44336', fontSize: '0.9rem', margin: '5px 0 0 0' }}>{errors.purpose}</p>}
          </div>

          {/* Attendees and Contact Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
            {/* Attendees */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: '#2c3e50'
              }}>
                Expected Attendees <span style={{ color: '#f44336' }}>*</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const current = parseInt(formData.attendees) || 0;
                    if (current > 1) {
                      setFormData({ ...formData, attendees: current - 1 });
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    background: '#f0f0f0',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}
                >
                  −
                </button>
                <input
                  type="number"
                  name="attendees"
                  placeholder="Number of people"
                  value={formData.attendees}
                  onChange={handleChange}
                  min="1"
                  max={selectedHall ? selectedHall.capacity : 500}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: errors.attendees ? '2px solid #f44336' : '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    textAlign: 'center'
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const current = parseInt(formData.attendees) || 0;
                    const max = selectedHall ? selectedHall.capacity : 500;
                    if (current < max) {
                      setFormData({ ...formData, attendees: current + 1 });
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}
                >
                  +
                </button>
              </div>
              {selectedHall && (
                <p style={{ fontSize: '0.85rem', color: '#7f8c8d', margin: '5px 0 0 0' }}>
                  Max capacity: {selectedHall.capacity} people
                </p>
              )}
              {errors.attendees && <p style={{ color: '#f44336', fontSize: '0.9rem', margin: '5px 0 0 0' }}>{errors.attendees}</p>}
            </div>

            {/* Contact */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: '#2c3e50'
              }}>
                Contact Number <span style={{ color: '#f44336' }}>*</span>
              </label>
              <input
                type="tel"
                name="contact"
                placeholder="Your phone number"
                value={formData.contact}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.contact ? '2px solid #f44336' : '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              {errors.contact && <p style={{ color: '#f44336', fontSize: '0.9rem', margin: '5px 0 0 0' }}>{errors.contact}</p>}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#2c3e50'
            }}>
              Additional Notes (Optional)
            </label>
            <textarea
              name="notes"
              placeholder="Any special requests or notes..."
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <button
              type="button"
              onClick={() => navigate('/halls')}
              style={{
                padding: '12px',
                background: '#f0f0f0',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              Book Hall
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
