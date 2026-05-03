import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BookHall() {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedHallId = location.state?.hallId;
  const preSelectedHallName = location.state?.hallName;

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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
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
              <input
                type="number"
                name="attendees"
                placeholder="Number of people"
                value={formData.attendees}
                onChange={handleChange}
                min="1"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.attendees ? '2px solid #f44336' : '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
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
