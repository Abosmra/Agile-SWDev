import React, { useState, useEffect } from 'react';
import { apiGet } from '../api';
import NotificationToast from '../Components/NotificationToast';

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const data = await apiGet('/api/staff');
        setStaffList(data.map((member) => ({
          id: member.StaffID,
          name: member.Name,
          role: member.Department || 'Staff',
          email: member.ContactInfo,
          department: member.Department
        })));
      } catch (err) {
        setError(err.message || 'Unable to load staff.');
      } finally {
        setIsLoading(false);
      }
    };

    loadStaff();
  }, []);

  const filteredStaff = staffList.filter(member =>
    (member.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (member) => {
    setSelectedStaff(member);
    setEditData({ ...member });
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    if (!editData.name.trim() || !editData.email.trim() || !editData.role.trim()) {
      setNotification({
        type: 'error',
        message: 'All fields are required'
      });
      return;
    }

    const updatedList = staffList.map(member =>
      member.id === editData.id ? editData : member
    );
    setStaffList(updatedList);
    setIsEditing(false);
    setSelectedStaff(null);
    setNotification({
      type: 'success',
      message: '✓ Profile updated successfully!'
    });
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>Staff Directory</h1>
        <p style={{ color: '#7f8c8d' }}>⏳ Loading staff...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>Staff Directory</h1>
        <p style={{ color: '#c0392b' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>Staff Directory</h1>
        <p style={{ color: '#7f8c8d' }}>Find and connect with staff members</p>
      </div>

      {/* Search Bar */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e0e0e0'
      }}>
        <input
          type="text"
          placeholder="🔍 Search by name, role, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 15px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '1rem',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
        <p style={{ margin: '12px 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
          Found <strong>{filteredStaff.length}</strong> staff member{filteredStaff.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Staff Grid */}
      {filteredStaff.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {filteredStaff.map((member) => (
            <div
              key={member.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e0e0e0',
                transition: 'all 0.3s ease'
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
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '30px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>👤</div>
              </div>

              {/* Content */}
              <div style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '1.1rem' }}>
                  {member.name}
                </h3>

                <div style={{
                  background: '#f0f7ff',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  marginBottom: '15px',
                  textAlign: 'center',
                  color: '#667eea',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  {member.role}
                </div>

                <div style={{
                  background: '#f5f5f5',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  wordBreak: 'break-all'
                }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#7f8c8d', fontWeight: 'bold' }}>
                    📧 Email
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#2c3e50' }}>
                    {member.email}
                  </p>
                </div>

                {member.phone && (
                  <div style={{
                    background: '#f5f5f5',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '15px'
                  }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#7f8c8d', fontWeight: 'bold' }}>
                      📞 Phone
                    </p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#2c3e50' }}>
                      {member.phone}
                    </p>
                  </div>
                )}

                {member.office && (
                  <div style={{
                    background: '#f5f5f5',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '15px'
                  }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#7f8c8d', fontWeight: 'bold' }}>
                      🏢 Office
                    </p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#2c3e50' }}>
                      {member.office}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{
                padding: '15px',
                borderTop: '1px solid #e0e0e0',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px'
              }}>
                <button
                  onClick={() => window.location.href = `mailto:${member.email}`}
                  style={{
                    padding: '10px',
                    background: '#f0f0f0',
                    color: '#667eea',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#e0e0e0'}
                  onMouseLeave={(e) => e.target.style.background = '#f0f0f0'}
                >
                  Email
                </button>
                <button
                  onClick={() => handleEditClick(member)}
                  style={{
                    padding: '10px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#5568d3'}
                  onMouseLeave={(e) => e.target.style.background = '#667eea'}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          background: 'white',
          padding: '60px 20px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🔍</div>
          <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
            No staff members found matching your search
          </p>
        </div>
      )}

      {/* Edit Profile Modal */}
      {selectedStaff && isEditing && (
        <div style={{ margin: '0 0 20px', padding: '18px', borderRadius: '12px', background: '#eef2ff', border: '1px solid #d6dbff' }}>
          <h2 style={{ margin: '0 0 8px', color: '#2c3e50' }}>Editing {selectedStaff.name}</h2>
          <p style={{ margin: 0, color: '#5f6a8c' }}>Update the profile below and click Save Changes.</p>
        </div>
      )}
      {isEditing && editData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '25px' }}>Edit Staff Profile</h2>

            {/* Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#2c3e50' }}>
                Full Name
              </label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Role */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#2c3e50' }}>
                Role
              </label>
              <input
                type="text"
                value={editData.role}
                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#2c3e50' }}>
                Email
              </label>
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Phone */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#2c3e50' }}>
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={editData.phone || ''}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Office */}
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#2c3e50' }}>
                Office Location (Optional)
              </label>
              <input
                type="text"
                value={editData.office || ''}
                onChange={(e) => setEditData({ ...editData, office: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedStaff(null);
                  setEditData(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
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
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <NotificationToast
          type={notification.type}
          message={notification.message}
          duration={4000}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
