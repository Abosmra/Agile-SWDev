import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function HallDetails() {
  const { hallId } = useParams();
  const navigate = useNavigate();

  const hallsData = {
    1: {
      id: 1,
      name: 'Conference Room A',
      capacity: 50,
      type: 'Conference',
      floor: '3rd',
      building: 'Main Building',
      amenities: ['Projector', 'Whiteboard', 'AC', 'WiFi', 'Coffee Machine'],
      description: 'Modern conference room equipped with latest technology for business meetings and presentations.',
      image: '🏢',
      available: true,
      pricePerHour: 500,
      booking_rules: 'Minimum 2 hours booking. Available Mon-Fri 9AM-6PM',
      contact: 'Facilities@university.edu | Ext: 2345',
      ratings: 4.5,
      reviews: 12
    },
    2: {
      id: 2,
      name: 'Auditorium B',
      capacity: 200,
      type: 'Auditorium',
      floor: '1st',
      building: 'Academic Block',
      amenities: ['Stage', 'Projector', 'Mic System', 'Recording Equipment', 'Parking'],
      description: 'Large auditorium perfect for lectures, seminars, and events with professional sound system.',
      image: '🎭',
      available: true,
      pricePerHour: 1500,
      booking_rules: 'Minimum 4 hours booking. Available Mon-Sat 8AM-8PM',
      contact: 'Events@university.edu | Ext: 3456',
      ratings: 4.7,
      reviews: 28
    },
    3: {
      id: 3,
      name: 'Lab Room C',
      capacity: 30,
      type: 'Lab',
      floor: '2nd',
      building: 'Science Building',
      amenities: ['Lab Equipment', 'Computer', 'AC', 'Fume Hood', 'Safety Equipment'],
      description: 'Well-equipped laboratory for practical classes and research work.',
      image: '🔬',
      available: false,
      pricePerHour: 800,
      booking_rules: 'Requires lab coat. Book 24 hours in advance',
      contact: 'Labs@university.edu | Ext: 4567',
      ratings: 4.3,
      reviews: 15
    }
  };

  const hall = hallsData[hallId] || hallsData[1];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px',
        borderRadius: '12px',
        color: 'white',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '4rem' }}>{hall.image}</div>
        <div style={{ flex: 1, marginLeft: '30px' }}>
          <h1 style={{ margin: '0 0 10px 0' }}>{hall.name}</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>{hall.building} • {hall.floor} Floor</p>
        </div>
        <div style={{
          background: hall.available ? '#4CAF50' : '#f44336',
          padding: '15px 25px',
          borderRadius: '10px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {hall.available ? '✓ Available' : '✗ Booked'}
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '30px' }}>
        {/* Left Column */}
        <div>
          {/* Description */}
          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '12px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ marginTop: 0, color: '#667eea' }}>About</h3>
            <p style={{ color: '#7f8c8d', lineHeight: '1.6' }}>{hall.description}</p>
          </div>

          {/* Amenities */}
          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '12px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ marginTop: 0, color: '#667eea' }}>Amenities</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '10px'
            }}>
              {hall.amenities.map((amenity, idx) => (
                <div key={idx} style={{
                  background: '#f8f9fa',
                  padding: '10px 15px',
                  borderRadius: '6px',
                  border: '1px solid #e0e0e0',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  ✓ {amenity}
                </div>
              ))}
            </div>
          </div>

          {/* Booking Rules */}
          <div style={{
            background: '#fff3cd',
            padding: '25px',
            borderRadius: '12px',
            border: '1px solid #ffc107',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ marginTop: 0, color: '#ff9800' }}>📋 Booking Rules</h3>
            <p style={{ margin: 0, color: '#7f8c8d' }}>{hall.booking_rules}</p>
          </div>
        </div>

        {/* Right Column - Booking Card */}
        <div>
          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e0e0e0',
            position: 'sticky',
            top: '20px'
          }}>
            {/* Key Info */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '15px',
                paddingBottom: '15px',
                borderBottom: '1px solid #e0e0e0'
              }}>
                <span style={{ color: '#7f8c8d' }}>Capacity:</span>
                <strong style={{ color: '#667eea' }}>👥 {hall.capacity} people</strong>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '15px',
                paddingBottom: '15px',
                borderBottom: '1px solid #e0e0e0'
              }}>
                <span style={{ color: '#7f8c8d' }}>Type:</span>
                <strong style={{ color: '#667eea' }}>{hall.type}</strong>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '15px',
                paddingBottom: '15px',
                borderBottom: '1px solid #e0e0e0'
              }}>
                <span style={{ color: '#7f8c8d' }}>Price:</span>
                <strong style={{ color: '#4CAF50' }}>₹{hall.pricePerHour}/hour</strong>
              </div>
            </div>

            {/* Rating */}
            <div style={{
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', color: '#ff9800' }}>
                ⭐ {hall.ratings} / 5
              </div>
              <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                Based on {hall.reviews} reviews
              </p>
            </div>

            {/* Contact */}
            <div style={{
              background: '#e8f4f8',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.9rem',
              color: '#7f8c8d'
            }}>
              <strong style={{ color: '#667eea' }}>Contact:</strong>
              <p style={{ margin: '5px 0', wordBreak: 'break-word' }}>{hall.contact}</p>
            </div>

            {/* Booking Button */}
            <button
              onClick={() => navigate('/book-hall', { state: { hallId: hall.id, hallName: hall.name } })}
              style={{
                width: '100%',
                padding: '15px',
                background: hall.available ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: hall.available ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (hall.available) {
                  e.currentTarget.transform = 'translateY(-2px)';
                  e.currentTarget.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.4)';
                }
              }}
            >
              {hall.available ? 'Book This Hall' : 'Not Available'}
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
