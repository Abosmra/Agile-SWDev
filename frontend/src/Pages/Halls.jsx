import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Halls() {
  const [filters, setFilters] = useState({
    search: '',
    capacity: '',
    type: ''
  });
  const navigate = useNavigate();

  const hallsData = [
    {
      id: 1,
      name: 'Conference Room A',
      capacity: 50,
      type: 'Conference',
      floor: '3rd',
      amenities: ['Projector', 'Whiteboard', 'AC'],
      available: true,
      image: '🏢'
    },
    {
      id: 2,
      name: 'Auditorium B',
      capacity: 200,
      type: 'Auditorium',
      floor: '1st',
      amenities: ['Stage', 'Projector', 'Mic System'],
      available: true,
      image: '🎭'
    },
    {
      id: 3,
      name: 'Lab Room C',
      capacity: 30,
      type: 'Lab',
      floor: '2nd',
      amenities: ['Equipment', 'Computer', 'AC'],
      available: false,
      image: '🔬'
    },
    {
      id: 4,
      name: 'Meeting Room D',
      capacity: 15,
      type: 'Meeting',
      floor: '4th',
      amenities: ['Table', 'Chairs', 'AC'],
      available: true,
      image: '📊'
    },
    {
      id: 5,
      name: 'Seminar Room E',
      capacity: 80,
      type: 'Seminar',
      floor: '2nd',
      amenities: ['Projector', 'Whiteboard', 'Recording'],
      available: true,
      image: '🎓'
    },
    {
      id: 6,
      name: 'Studio F',
      capacity: 25,
      type: 'Studio',
      floor: '5th',
      amenities: ['Lighting', 'Camera', 'Green Screen'],
      available: true,
      image: '📹'
    }
  ];

  const filteredHalls = hallsData.filter(hall => {
    const capacityMatch = !filters.capacity || hall.capacity >= parseInt(filters.capacity);
    const typeMatch = !filters.type || hall.type === filters.type;
    const searchMatch = !filters.search || 
      hall.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      hall.type.toLowerCase().includes(filters.search.toLowerCase());
    return capacityMatch && typeMatch && searchMatch;
  });

  const hallTypes = [...new Set(hallsData.map(h => h.type))];

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>Available Halls</h1>
        <p style={{ color: '#7f8c8d' }}>Find and book the perfect space for your event</p>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap',
        alignItems: 'flex-end'
      }}>
        {/* Search */}
        <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#2c3e50' }}>🔍 Search</label>
          <input
            type="text"
            placeholder="Search by name or type..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              fontSize: '0.95rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#2c3e50' }}>👥 Capacity</label>
          <input
            type="number"
            placeholder="Min capacity"
            value={filters.capacity}
            onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}
            style={{
              padding: '10px',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              width: '140px',
              fontSize: '0.95rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#2c3e50' }}>📂 Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            style={{
              padding: '10px',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              width: '140px',
              fontSize: '0.95rem'
            }}
          >
            <option value="">All Types</option>
            {hallTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setFilters({ search: '', capacity: '', type: '' })}
          style={{
            padding: '10px 20px',
            background: '#f0f0f0',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#e0e0e0'}
          onMouseLeave={(e) => e.target.style.background = '#f0f0f0'}
        >
          Reset
        </button>
      </div>

      {/* Results Count */}
      <p style={{ color: '#7f8c8d', marginBottom: '20px', fontSize: '0.95rem' }}>
        {filteredHalls.length === 0 
          ? `No halls found matching your criteria`
          : `Showing ${filteredHalls.length} of ${hallsData.length} halls`
        }
      </p>

      {/* Halls Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {filteredHalls.map((hall) => (
          <div
            key={hall.id}
            onClick={() => navigate(`/hall-details/${hall.id}`)}
            style={{
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid #e0e0e0'
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
            {/* Header with Image and Status */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '30px',
              textAlign: 'center',
              color: 'white',
              position: 'relative',
              fontSize: '4rem'
            }}>
              {hall.image}
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: hall.available ? '#4CAF50' : '#f44336',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {hall.available ? 'Available' : 'Booked'}
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{hall.name}</h3>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '15px',
                fontSize: '0.9rem',
                color: '#7f8c8d'
              }}>
                <span>👥 {hall.capacity} people</span>
                <span>📍 {hall.floor} Floor</span>
              </div>

              <div style={{
                background: '#f8f9fa',
                padding: '10px',
                borderRadius: '6px',
                marginBottom: '15px'
              }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#667eea' }}>
                  Type: {hall.type}
                </p>
                <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                  {hall.amenities.join(', ')}
                </div>
              </div>

              <button
                style={{
                  width: '100%',
                  padding: '10px',
                  background: hall.available ? '#667eea' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: hall.available ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold'
                }}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredHalls.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#7f8c8d'
        }}>
          <p style={{ fontSize: '1.2rem' }}>No halls match your filters</p>
        </div>
      )}
    </div>
  );
}
