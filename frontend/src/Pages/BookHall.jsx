import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiGet, apiPost } from '../api';

function toConflictShape(booking) {
  return {
    hallId: booking.HallID,
    date: booking.Date,
    startTime: booking.StartTime,
    endTime: booking.EndTime
  };
}

export default function BookHall() {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedHallId = location.state?.hallId;

  const [hallsData, setHallsData] = useState([]);
  const [existingBookings, setExistingBookings] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [halls, bookings] = await Promise.all([
          apiGet('/api/halls'),
          apiGet('/api/bookings?scope=all')
        ]);
        setHallsData(halls.map((hall) => ({
          id: hall.HallID,
          name: hall.HallName,
          capacity: hall.Capacity,
          available: hall.Available
        })));
        setExistingBookings(bookings.map(toConflictShape));
      } catch (err) {
        setError(err.message || 'Unable to load data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedHall = hallsData.find((hall) => hall.id === parseInt(formData.hall, 10));
  const availableHalls = hallsData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }

    if (['date', 'startTime', 'endTime', 'hall'].includes(name)) {
      setBookingConflict(null);
    }
  };

  const checkBookingConflict = (hallId, date, startTime, endTime) => {
    return existingBookings.find((booking) => {
      if (booking.hallId !== parseInt(hallId, 10)) return false;
      if (booking.date !== date) return false;

      const existingStart = parseInt(booking.startTime.replace(':', ''), 10);
      const existingEnd = parseInt(booking.endTime.replace(':', ''), 10);
      const newStart = parseInt(startTime.replace(':', ''), 10);
      const newEnd = parseInt(endTime.replace(':', ''), 10);

      return newStart < existingEnd && newEnd > existingStart;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.hall) newErrors.hall = 'Please select a hall';
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.startTime) newErrors.startTime = 'Please select start time';
    if (!formData.endTime) newErrors.endTime = 'Please select end time';
    if (!formData.purpose.trim()) newErrors.purpose = 'Please enter the purpose';
    if (!formData.attendees) newErrors.attendees = 'Please enter number of attendees';
    if (!formData.contact.trim()) newErrors.contact = 'Please enter contact number';

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    const today = new Date().toISOString().split('T')[0];
    if (formData.date && formData.date < today) {
      newErrors.date = 'Please select a future date';
    }

    if (selectedHall && formData.attendees) {
      const attendeesNum = parseInt(formData.attendees, 10);
      if (attendeesNum > selectedHall.capacity) {
        newErrors.attendees = `Maximum capacity is ${selectedHall.capacity} people`;
      }
    }

    if (formData.hall && formData.date && formData.startTime && formData.endTime) {
      const conflict = checkBookingConflict(formData.hall, formData.date, formData.startTime, formData.endTime);
      if (conflict) {
        setBookingConflict(conflict);
        newErrors.dateTime = 'This time slot is already booked. Please select a different time.';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const createdBooking = await apiPost('/api/bookings', {
        HallID: parseInt(formData.hall, 10),
        Date: formData.date,
        StartTime: formData.startTime,
        EndTime: formData.endTime,
        Purpose: formData.purpose.trim(),
        Attendees: parseInt(formData.attendees, 10) || 0,
        Contact: formData.contact.trim(),
        Status: 'Pending'
      });

      setExistingBookings((prev) => [...prev, toConflictShape(createdBooking)]);
      setSubmitted(true);
      setErrors({});
      setBookingConflict(null);
    } catch (err) {
      setErrors({ submit: err.message || 'Unable to create booking.' });
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
        <h1>Book a Hall</h1>
        <p style={{ color: '#7f8c8d' }}>Loading halls...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
        <h1>Book a Hall</h1>
        <p style={{ color: '#c0392b' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Book a Hall</h1>

      <div
        style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e0e0e0'
        }}
      >
        {errors.submit && (
          <div
            style={{
              background: '#f8d7da',
              border: '1px solid #f5c6cb',
              padding: '18px',
              borderRadius: '10px',
              marginBottom: '24px',
              color: '#721c24'
            }}
          >
            <strong>Error:</strong> {errors.submit}
          </div>
        )}

        {submitted && selectedHall && (
          <div
            style={{
              background: '#e8f5e9',
              border: '1px solid #4CAF50',
              padding: '18px',
              borderRadius: '10px',
              marginBottom: '24px',
              color: '#2e7d32'
            }}
          >
            <strong>Booking confirmed!</strong>
            <p style={{ margin: '10px 0 0' }}>
              {selectedHall.name} has been booked for {formData.date} from {formData.startTime} to {formData.endTime}.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => navigate('/my-bookings')}
                style={{
                  padding: '12px 18px',
                  borderRadius: '8px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                View My Bookings
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    hall: preSelectedHallId || '',
                    date: '',
                    startTime: '',
                    endTime: '',
                    purpose: '',
                    attendees: '',
                    contact: '',
                    notes: ''
                  });
                }}
                style={{
                  padding: '12px 18px',
                  borderRadius: '8px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Make Another Booking
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '25px' }}>
            <label
              style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: '#2c3e50'
              }}
            >
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
              {availableHalls.map((hall) => (
                <option key={hall.id} value={hall.id}>
                  {hall.name} (Capacity: {hall.capacity})
                </option>
              ))}
            </select>
            {errors.hall && <p style={{ color: '#f44336', fontSize: '0.9rem', margin: '5px 0 0 0' }}>{errors.hall}</p>}
          </div>

          {selectedHall && (
            <div
              style={{
                background: '#f0f7ff',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '25px',
                border: '1px solid #667eea'
              }}
            >
              <p style={{ margin: 0, color: '#667eea', fontWeight: 'bold' }}>
                {selectedHall.name} selected (Max: {selectedHall.capacity} people)
              </p>
            </div>
          )}

          <div style={{ marginBottom: '25px' }}>
            <label
              style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: '#2c3e50'
              }}
            >
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#2c3e50'
                }}
              >
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

            <div>
              <label
                style={{
                  display: 'block',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#2c3e50'
                }}
              >
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

          {formData.startTime && formData.endTime && formData.startTime < formData.endTime && (
            <div
              style={{
                background: '#f0f7ff',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '25px',
                border: '1px solid #667eea',
                color: '#667eea',
                fontWeight: 'bold',
                textAlign: 'center'
              }}
            >
              Duration: {Math.round((new Date(`2000-01-01T${formData.endTime}`) - new Date(`2000-01-01T${formData.startTime}`)) / 60000)} minutes
            </div>
          )}

          {bookingConflict && (
            <div
              style={{
                background: '#fff3cd',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '25px',
                border: '2px solid #ffc107',
                color: '#856404'
              }}
            >
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '1.05rem' }}>
                Time Slot Conflict Detected
              </p>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                This time slot is already booked from {bookingConflict.startTime} to {bookingConflict.endTime} on {bookingConflict.date}.
              </p>
            </div>
          )}

          <div style={{ marginBottom: '25px' }}>
            <label
              style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: '#2c3e50'
              }}
            >
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#2c3e50'
                }}
              >
                Expected Attendees <span style={{ color: '#f44336' }}>*</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const current = parseInt(formData.attendees, 10) || 0;
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
                  -
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
                    const current = parseInt(formData.attendees, 10) || 0;
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

            <div>
              <label
                style={{
                  display: 'block',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#2c3e50'
                }}
              >
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

          <div style={{ marginBottom: '25px' }}>
            <label
              style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: '#2c3e50'
              }}
            >
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
