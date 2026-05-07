import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { apiGet, apiPost } from '../api';
import NotificationToast from '../Components/NotificationToast';
import '../css/Halls.css';

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

export default function BookHall() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const preSelectedHallId = location.state?.hallId || id || '';
  const [hallsData, setHallsData] = useState([]);
  const [usage, setUsage] = useState([]);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    hall: preSelectedHallId,
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: '',
    contact: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [halls, bookings] = await Promise.all([
          apiGet('/api/halls'),
          apiGet('/api/bookings/usage')
        ]);
        setHallsData(halls.map((hall) => ({
          id: hall.HallID,
          name: hall.HallName,
          capacity: hall.Capacity,
          type: hall.Type,
          floor: hall.Floor,
          available: hall.Available
        })));
        setUsage(bookings);
      } catch (err) {
        setToast({ type: 'error', message: err.message || 'Unable to load booking data.' });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedHall = hallsData.find((hall) => Number(hall.id) === Number(formData.hall));
  const dayUsage = useMemo(
    () => usage.filter((booking) => Number(booking.HallID) === Number(formData.hall) && booking.Date === formData.date),
    [usage, formData.hall, formData.date]
  );
  const conflict = formData.startTime && formData.endTime
    ? dayUsage.find((booking) => overlaps(formData.startTime, formData.endTime, booking.StartTime, booking.EndTime))
    : null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (conflict) {
      setToast({ type: 'error', message: 'This time slot overlaps an existing booking.' });
      return;
    }

    try {
      const created = await apiPost('/api/bookings', {
        HallID: Number(formData.hall),
        Date: formData.date,
        StartTime: formData.startTime,
        EndTime: formData.endTime,
        Purpose: formData.purpose.trim(),
        Attendees: Number(formData.attendees),
        Contact: formData.contact.trim(),
        Status: 'Confirmed'
      });
      setUsage((current) => [...current, created]);
      setToast({ type: 'success', message: 'Space reserved successfully.' });
      setFormData((current) => ({
        ...current,
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: '',
        contact: ''
      }));
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Unable to create booking.' });
    }
  };

  return (
    <div className="booking-page">
      <header className="halls-hero">
        <div>
          <p className="halls-kicker">Reserve Space</p>
          <h1>Book a Classroom or Lab</h1>
          <p>Choose a room, check current usage, and reserve a time for classes, labs, meetings, or events.</p>
        </div>
        <button type="button" onClick={() => navigate('/halls')}>View Spaces</button>
      </header>

      {isLoading ? (
        <p className="halls-muted">Loading booking form...</p>
      ) : (
        <section className="booking-layout">
          <form className="booking-form" onSubmit={handleSubmit}>
            <label>
              <span>Room or Lab</span>
              <select name="hall" value={formData.hall} onChange={handleChange} required>
                <option value="">Choose a space</option>
                {hallsData.map((hall) => (
                  <option key={hall.id} value={hall.id}>{hall.name} · {hall.type} · {hall.capacity} seats</option>
                ))}
              </select>
            </label>

            {selectedHall && (
              <div className="booking-selected">
                <strong>{selectedHall.name}</strong>
                <span>{selectedHall.type} · {selectedHall.floor} floor · {selectedHall.capacity} seats</span>
              </div>
            )}

            <div className="booking-two-col">
              <label>
                <span>Date</span>
                <input type="date" name="date" min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={handleChange} required />
              </label>
              <label>
                <span>Attendees</span>
                <input type="number" name="attendees" min="1" max={selectedHall?.capacity || 500} value={formData.attendees} onChange={handleChange} required />
              </label>
            </div>

            <div className="booking-two-col">
              <label>
                <span>Start Time</span>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
              </label>
              <label>
                <span>End Time</span>
                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
              </label>
            </div>

            {conflict && (
              <div className="booking-conflict">
                Existing booking from {conflict.StartTime} to {conflict.EndTime} for {conflict.Purpose || 'reserved use'}.
              </div>
            )}

            <label>
              <span>Purpose</span>
              <input name="purpose" value={formData.purpose} onChange={handleChange} placeholder="Class, lab, meeting, seminar..." required />
            </label>
            <label>
              <span>Contact</span>
              <input name="contact" value={formData.contact} onChange={handleChange} placeholder="Email or phone" required />
            </label>

            <button type="submit" disabled={Boolean(conflict)}>Reserve Space</button>
          </form>

          <aside className="booking-usage">
            <h2>Usage on Selected Date</h2>
            {!formData.hall || !formData.date ? (
              <p>Select a space and date to view existing bookings.</p>
            ) : dayUsage.length === 0 ? (
              <p>No bookings for this space on that date.</p>
            ) : (
              dayUsage.map((booking) => (
                <div key={booking.BookingID} className="booking-usage-row">
                  <strong>{booking.StartTime} - {booking.EndTime}</strong>
                  <span>{booking.Purpose || 'Reserved'} · {booking.Status}</span>
                </div>
              ))
            )}
          </aside>
        </section>
      )}

      {toast && <NotificationToast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
