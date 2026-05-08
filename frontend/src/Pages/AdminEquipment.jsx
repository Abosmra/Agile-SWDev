import React, { useEffect, useState } from 'react';
import { apiGet } from '../api';
import '../css/AdminDashboard.css';

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value || 0)));
}

function EquipmentRow({ resource }) {
  const total = resource.TotalQuantity;
  const available = resource.AvailableQuantity;
  const availablePercent = total > 0 ? clamp((available / total) * 100) : 0;
  
  const getStockStatus = (availableQty, totalQty) => {
    const percentage = (availableQty / totalQty) * 100;
    if (percentage === 0) return { text: 'Out of Stock', color: '#b4232f' };
    if (percentage < 30) return { text: 'Low Stock', color: '#c88719' };
    if (percentage < 70) return { text: 'Medium Stock', color: '#3a7ca5' };
    return { text: 'Good Stock', color: '#2f9e7e' };
  };
  
  const status = getStockStatus(available, total);

  return (
    <div className="admin-progress-row" style={{ gridTemplateColumns: 'minmax(200px, 1.2fr) minmax(120px, 0.8fr) auto' }}>
      <div className="admin-progress-copy">
        <strong>
          {resource.ResourceName}
        </strong>
        <span>
          {resource.ResourceType} · {available} of {total} available
        </span>
      </div>
      <div className="admin-progress-track" style={{ margin: '0 8px' }}>
        <div className="admin-progress-fill" style={{ width: `${availablePercent}%`, background: '#2f9e7e' }} />
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: '0' }}>
        <span className="admin-progress-value" style={{ minWidth: '50px' }}>{availablePercent}%</span>
        <span style={{ color: status.color, fontSize: '0.8rem', fontWeight: 600, minWidth: '85px' }}>
          {status.text}
        </span>
      </div>
    </div>
  );
}

export default function AdminEquipmentTracker() {
  const [resources, setResources] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEquipmentData();
  }, []);

  const loadEquipmentData = async () => {
    try {
      setIsLoading(true);
      const dashboardData = await apiGet('/api/admin/dashboard');
      const rawResources = dashboardData.facilities?.resources || [];
      
      // Calculate allocated as Total - Available (more reliable)
      const resourcesWithAllocated = rawResources.map(r => ({
        ...r,
        AllocatedQuantity: (r.TotalQuantity - r.AvailableQuantity)
      }));
      
      setResources(resourcesWithAllocated);
    } catch (err) {
      setError(err.message || 'Unable to load equipment data.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesType = filterType === 'all' || resource.ResourceType === filterType;
    const matchesSearch = searchTerm === '' || 
      resource.ResourceName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Now calculate using Total - Available
  const totalResources = resources.reduce((sum, r) => sum + r.TotalQuantity, 0);
  const totalAllocated = resources.reduce((sum, r) => sum + (r.TotalQuantity - r.AvailableQuantity), 0);
  const overallUtilization = totalResources > 0 ? Math.round((totalAllocated / totalResources) * 100) : 0;
  const equipmentCount = resources.filter(r => r.ResourceType === 'Equipment').length;
  const softwareCount = resources.filter(r => r.ResourceType === 'Software License').length;
  
  const equipmentAllocated = resources
    .filter(r => r.ResourceType === 'Equipment')
    .reduce((sum, r) => sum + (r.TotalQuantity - r.AvailableQuantity), 0);
    
  const softwareAllocated = resources
    .filter(r => r.ResourceType === 'Software License')
    .reduce((sum, r) => sum + (r.TotalQuantity - r.AvailableQuantity), 0);

  if (isLoading) {
    return <div className="admin-dashboard"><p className="admin-loading">Loading equipment tracker...</p></div>;
  }

  if (error) {
    return <div className="admin-dashboard"><p className="admin-error">{error}</p></div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <p className="admin-kicker">Facilities Management</p>
          <h1>Equipment & Resource Tracker</h1>
        </div>
      </header>

      {/* Stats summary cards */}
      <div className="admin-module-grid" style={{ marginBottom: '24px' }}>
        <div className="admin-module admin-module-blue">
          <div className="admin-module-top">
            <h2>Overall Utilization</h2>
          </div>
          <div className="admin-module-metrics">
            <div className="admin-metric admin-metric-blue">
              <span>Usage Rate</span>
              <strong>{overallUtilization}%</strong>
            </div>
            <div className="admin-metric admin-metric-blue">
              <span>Total Items</span>
              <strong>{totalResources}</strong>
            </div>
          </div>
        </div>
        <div className="admin-module admin-module-green">
          <div className="admin-module-top">
            <h2>Equipment</h2>
          </div>
          <div className="admin-module-metrics">
            <div className="admin-metric admin-metric-green">
              <span>Types</span>
              <strong>{equipmentCount}</strong>
            </div>
            <div className="admin-metric admin-metric-green">
              <span>Allocated</span>
              <strong>{equipmentAllocated}</strong>
            </div>
          </div>
        </div>
        <div className="admin-module admin-module-amber">
          <div className="admin-module-top">
            <h2>Software Licenses</h2>
          </div>
          <div className="admin-module-metrics">
            <div className="admin-metric admin-metric-amber">
              <span>Types</span>
              <strong>{softwareCount}</strong>
            </div>
            <div className="admin-metric admin-metric-amber">
              <span>Allocated</span>
              <strong>{softwareAllocated}</strong>
            </div>
          </div>
        </div>
        <div className="admin-module admin-module-rose">
          <div className="admin-module-top">
            <h2>Active Allocations</h2>
          </div>
          <div className="admin-module-metrics">
            <div className="admin-metric admin-metric-rose">
              <span>Current</span>
              <strong>{totalAllocated}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-maintenance-form" style={{ marginBottom: '20px', background: 'white', borderRadius: '8px' }}>
        <input
          type="text"
          placeholder="Search equipment or software..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ gridColumn: 'span 2' }}
        />
        <div style={{ display: 'flex', gap: '8px', gridColumn: 'span 2', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => setFilterType('all')}
            style={{ 
              background: filterType === 'all' ? '#3a7ca5' : 'white', 
              color: filterType === 'all' ? 'white' : '#263746',
              border: '1px solid #d7dde5',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            All
          </button>
          <button 
            onClick={() => setFilterType('Equipment')}
            style={{ 
              background: filterType === 'Equipment' ? '#3a7ca5' : 'white', 
              color: filterType === 'Equipment' ? 'white' : '#263746',
              border: '1px solid #d7dde5',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Equipment
          </button>
          <button 
            onClick={() => setFilterType('Software License')}
            style={{ 
              background: filterType === 'Software License' ? '#3a7ca5' : 'white', 
              color: filterType === 'Software License' ? 'white' : '#263746',
              border: '1px solid #d7dde5',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Software
          </button>
        </div>
      </div>

      {/* Resources list */}
      <div className="admin-panel admin-progress-panel">
        <div className="admin-panel-head">
          <h2>Resource Inventory</h2>
          <span>{filteredResources.length} items</span>
        </div>
        {filteredResources.map((resource) => (
          <EquipmentRow 
            key={resource.ResourceID} 
            resource={resource} 
          />
        ))}
        {filteredResources.length === 0 && (
          <div className="admin-empty-cell" style={{ textAlign: 'center', padding: '40px' }}>
            No resources match your filters
          </div>
        )}
      </div>
    </div>
  );
}