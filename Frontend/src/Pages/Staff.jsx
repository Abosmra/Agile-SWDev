import React, { useState, useEffect } from 'react';
import { staff } from '../Data/staff';

export default function Staff() {
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    setStaffList(staff);
  }, []);

  return (
    <div className="staff-page">
      <h1>Staff Directory</h1>
      <div className="staff-container">
        {staffList.map((member, index) => (
          <div key={index} className="staff-card">
            <h3>{member.name}</h3>
            <p>{member.role}</p>
            <p>{member.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
