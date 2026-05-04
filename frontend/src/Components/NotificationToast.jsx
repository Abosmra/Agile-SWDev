import React, { useState, useEffect } from 'react';

export default function NotificationToast({ type = 'info', message, duration = 4000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getColor = () => {
    switch (type) {
      case 'success':
        return { bg: '#d4edda', border: '#28a745', text: '#155724', icon: '✓' };
      case 'error':
        return { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24', icon: '✕' };
      case 'warning':
        return { bg: '#fff3cd', border: '#ffeeba', text: '#856404', icon: '!' };
      case 'info':
      default:
        return { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460', icon: 'ℹ' };
    }
  };

  const color = getColor();

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: color.bg,
        border: `2px solid ${color.border}`,
        borderRadius: '8px',
        padding: '16px 20px',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 10000,
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: color.text }}>
        {color.icon}
      </span>
      <span style={{ color: color.text, fontWeight: '500' }}>
        {message}
      </span>
      <button
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
        style={{
          background: 'transparent',
          border: 'none',
          color: color.text,
          cursor: 'pointer',
          fontSize: '1.2rem',
          marginLeft: '8px',
          padding: '0',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        ✕
      </button>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
