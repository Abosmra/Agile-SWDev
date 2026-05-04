import React, { useState, useContext, useEffect } from 'react';
import { ProfileContext } from '../context/ProfileContext';
import { apiGet } from '../api';

export default function Messaging() {
  const { profileData } = useContext(ProfileContext);
  const [staff, setStaff] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    apiGet('/api/staff').then(data => setStaff(data)).catch(err => console.error(err));
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && activeChat) {
      const msg = {
        id: Date.now(),
        text: newMessage,
        sender: `${profileData.firstName} ${profileData.lastName}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: true
      };
      setMessages([...messages, msg]);
      setNewMessage('');
    }
  };

  return (
    <div className="messaging-layout">
      {/* Sidebar: Conversation List */}
      <div className="messaging-sidebar">
        <div className="sidebar-header">
          <h3>Messages</h3>
        </div>
        <div className="conversation-list">
          {staff.map((member) => (
            <div 
              key={member.id} 
              className={`conversation-item ${activeChat?.id === member.id ? 'active' : ''}`}
              onClick={() => setActiveChat(member)}
            >
              <div className="avatar-circle">
                {member.name.charAt(0)}
              </div>
              <div className="conversation-details">
                <span className="user-name">{member.name}</span>
                <span className="last-snippet">{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-area">
        {activeChat ? (
          <>
            <div className="chat-header">
              <div className="header-info">
                <h4>{activeChat.name}</h4>
                <span>{activeChat.department}</span>
              </div>
            </div>
            
            <div className="chat-history">
              {messages.map((msg) => (
                <div key={msg.id} className={`message-row ${msg.isUser ? 'user-sent' : 'received'}`}>
                  <div className="bubble">
                    <p>{msg.text}</p>
                    <span className="bubble-time">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <form className="chat-input-container" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Write a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="btn-primary">Send</button>
            </form>
          </>
        ) : (
          /* Structured Welcome State */
          <div className="chat-empty-state">
            <div className="empty-content">
              <div className="welcome-icon">💬</div>
              <h2>Welcome to LMS Chats</h2>
              <p>Select a staff member or instructor from the left to start a conversation.</p>
              <div className="theme-divider"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
