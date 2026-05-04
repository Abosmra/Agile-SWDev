import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet } from '../api';

export default function HallDetails() {
  const { hallId } = useParams();
  const navigate = useNavigate();
  const [hall, setHall] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHall = async () => {
      try {
        const data = await apiGet(`/api/halls/${hallId}`);
        setHall(data);
      } catch (err) {
        setError(err.message || 'Unable to load hall details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadHall();
  }, [hallId]);

  if (isLoading) {
    return <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>Loading hall details...</div>;
  }

  if (error || !hall) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ color: '#c0392b' }}>{error || 'Hall not found.'}</p>
        <button onClick={() => navigate('/halls')}>Back to Halls</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px',
          borderRadius: '12px',
          color: 'white',
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ fontSize: '4rem' }}>{hall.Image}</div>
        <div style={{ flex: 1, marginLeft: '30px' }}>
          <h1 style={{ margin: '0 0 10px 0' }}>{hall.HallName}</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>{hall.Building} • {hall.Floor} Floor</p>
        </div>
        <div
          style={{
            background: hall.Available ? '#4CAF50' : '#f44336',
            padding: '15px 25px',
            borderRadius: '10px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          {hall.Available ? 'Available Today' : 'Busy Today'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '30px' }}>
        <div>
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0' }}>
            <h3 style={{ marginTop: 0, color: '#667eea' }}>About</h3>
            <p style={{ color: '#7f8c8d', lineHeight: '1.6' }}>{hall.Description}</p>
          </div>

          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0' }}>
            <h3 style={{ marginTop: 0, color: '#667eea' }}>Amenities</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
              {hall.Amenities.map((amenity) => (
                <div key={amenity} style={{ background: '#f8f9fa', padding: '10px 15px', borderRadius: '6px', border: '1px solid #e0e0e0', textAlign: 'center', fontWeight: '500' }}>
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff3cd', padding: '25px', borderRadius: '12px', border: '1px solid #ffc107', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h3 style={{ marginTop: 0, color: '#ff9800' }}>Booking Rules</h3>
            <p style={{ margin: 0, color: '#7f8c8d' }}>{hall.BookingRules}</p>
          </div>
        </div>

        <div>
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0', position: 'sticky', top: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #e0e0e0' }}>
                <span style={{ color: '#7f8c8d' }}>Capacity:</span>
                <strong style={{ color: '#667eea' }}>{hall.Capacity} people</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #e0e0e0' }}>
                <span style={{ color: '#7f8c8d' }}>Type:</span>
                <strong style={{ color: '#667eea' }}>{hall.Type}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #e0e0e0' }}>
                <span style={{ color: '#7f8c8d' }}>Price:</span>
                <strong style={{ color: '#4CAF50' }}>{hall.PricePerHour}/hour</strong>
              </div>
            </div>

            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', color: '#ff9800' }}>
                {hall.Ratings} / 5
              </div>
              <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                Based on {hall.Reviews} reviews
              </p>
            </div>

            <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', color: '#7f8c8d' }}>
              <strong style={{ color: '#667eea' }}>Contact:</strong>
              <p style={{ margin: '5px 0', wordBreak: 'break-word' }}>{hall.Contact}</p>
            </div>

            <button
              onClick={() => navigate('/book-hall', { state: { hallId: hall.HallID } })}
              style={{
                width: '100%',
                padding: '15px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}
            >
              {hall.Available ? 'Book This Hall' : 'Book a Future Slot'}
            </button>

            <button
              onClick={() => navigate('/halls')}
              style={{
                width: '100%',
                padding: '12px',
                background: '#f0f0f0',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '10px'
              }}
            >
              Back to Halls
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
