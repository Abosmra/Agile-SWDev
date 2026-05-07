import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../api';
import NotificationToast from '../Components/NotificationToast';
import '../css/Halls.css';

export default function Halls() {
  const navigate = useNavigate();
  const [hallsData, setHallsData] = useState([]);
  const [filters, setFilters] = useState({ search: '', capacity: '', type: '' });
  const [maintenanceForm, setMaintenanceForm] = useState({ roomId: '', description: '' });
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHalls = async () => {
      try {
        const data = await apiGet('/api/halls');
        setHallsData(data.map((hall) => ({
          id: hall.HallID,
          name: hall.HallName,
          capacity: hall.Capacity,
          type: hall.Type,
          floor: hall.Floor,
          building: hall.Building,
          amenities: hall.Amenities || [],
          available: hall.Available,
          image: hall.Image
        })));
      } catch (err) {
        setError(err.message || 'Unable to load rooms and labs.');
      } finally {
        setIsLoading(false);
      }
    };

    loadHalls();
  }, []);

  const hallTypes = useMemo(() => [...new Set(hallsData.map((hall) => hall.type))], [hallsData]);
  const labsCount = hallsData.filter((hall) => hall.type === 'Lab').length;
  const availableCount = hallsData.filter((hall) => hall.available).length;

  const filteredHalls = hallsData.filter((hall) => {
    const query = filters.search.toLowerCase();
    const capacityMatch = !filters.capacity || hall.capacity >= Number(filters.capacity);
    const typeMatch = !filters.type || hall.type === filters.type;
    const searchMatch = !query || hall.name.toLowerCase().includes(query) || hall.type.toLowerCase().includes(query) || hall.building.toLowerCase().includes(query);
    return capacityMatch && typeMatch && searchMatch;
  });

  const handleMaintenanceSubmit = async (event) => {
    event.preventDefault();
    try {
      await apiPost('/api/maintenance', {
        roomId: maintenanceForm.roomId,
        description: maintenanceForm.description
      });
      setMaintenanceForm({ roomId: '', description: '' });
      setToast({ type: 'success', message: 'Maintenance issue reported.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Unable to report maintenance issue.' });
    }
  };

  return (
    <div className="halls-page">
      <header className="halls-hero">
        <div>
          <p className="halls-kicker">Classroom and Lab Management</p>
          <h1>Rooms, Labs, and Bookings</h1>
          <p>Check availability, reserve teaching spaces, and report room issues from one workspace.</p>
        </div>
        <button type="button" onClick={() => navigate('/book-hall')}>Reserve Space</button>
      </header>

      {error && <div className="halls-error">{error}</div>}

      <section className="halls-stats">
        <div><span>Total Spaces</span><strong>{hallsData.length}</strong></div>
        <div><span>Available Today</span><strong>{availableCount}</strong></div>
        <div><span>Labs</span><strong>{labsCount}</strong></div>
      </section>

      <section className="halls-toolbar">
        <label>
          <span>Search</span>
          <input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Room, lab, or building" />
        </label>
        <label>
          <span>Min Capacity</span>
          <input type="number" min="1" value={filters.capacity} onChange={(event) => setFilters({ ...filters, capacity: event.target.value })} placeholder="Any" />
        </label>
        <label>
          <span>Type</span>
          <select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}>
            <option value="">All spaces</option>
            {hallTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => setFilters({ search: '', capacity: '', type: '' })}>Reset</button>
      </section>

      {isLoading ? (
        <p className="halls-muted">Loading rooms and labs...</p>
      ) : (
        <section className="halls-grid">
          {filteredHalls.map((hall) => (
            <article key={hall.id} className="hall-card">
              <div className="hall-card-top">
                <span className="hall-icon">{hall.image}</span>
                <span className={`hall-status ${hall.available ? 'available' : 'busy'}`}>
                  {hall.available ? 'Available today' : 'Busy today'}
                </span>
              </div>
              <div className="hall-card-body">
                <h2>{hall.name}</h2>
                <p>{hall.building} · {hall.floor} floor</p>
                <div className="hall-meta">
                  <span>{hall.type}</span>
                  <span>{hall.capacity} seats</span>
                </div>
                <div className="hall-amenities">{hall.amenities.slice(0, 4).join(', ')}</div>
              </div>
              <div className="hall-card-actions">
                <button type="button" onClick={() => navigate(`/halls/${hall.id}`)}>Details</button>
                <button type="button" onClick={() => navigate('/book-hall', { state: { hallId: hall.id } })}>Book</button>
              </div>
            </article>
          ))}
          {filteredHalls.length === 0 && <p className="halls-muted">No rooms or labs match your filters.</p>}
        </section>
      )}

      <section className="maintenance-panel">
        <div>
          <p className="halls-kicker">Maintenance</p>
          <h2>Report a Room or Lab Issue</h2>
          <p>Send facilities a note about equipment, seating, lighting, projector, or lab readiness problems.</p>
        </div>
        <form onSubmit={handleMaintenanceSubmit}>
          <select value={maintenanceForm.roomId} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, roomId: event.target.value })} required>
            <option value="">Choose room or lab</option>
            {hallsData.map((hall) => <option key={hall.id} value={hall.id}>{hall.name}</option>)}
          </select>
          <textarea value={maintenanceForm.description} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, description: event.target.value })} placeholder="Describe the issue..." rows="4" required />
          <button type="submit">Report Issue</button>
        </form>
      </section>

      {toast && <NotificationToast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
