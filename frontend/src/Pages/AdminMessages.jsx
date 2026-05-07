import React from 'react';
import Messaging from './Messaging';
import '../css/AdminDashboard.css';

export default function AdminMessages() {
  return (
    <div className="admin-messages-page">
      <div className="admin-messages-header">
        <p className="admin-kicker">Community Operations</p>
        <h1>Admin Messages</h1>
      </div>
      <Messaging />
    </div>
  );
}
