import React, { useState, useContext, useEffect } from 'react';
import { ProfileContext } from '../context/ProfileContext';
import { apiGet, apiPost } from '../api';
import { isAdminRole } from '../roleUtils';

export default function Messaging() {
  const { profileData } = useContext(ProfileContext);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const viewingStudentInbox = isAdminRole(profileData?.role);

  useEffect(() => {
    const endpoint = viewingStudentInbox ? '/api/messages/conversations' : '/api/staff';
    apiGet(endpoint)
      .then(data => setConversations(data))
      .catch(err => console.error(err));
  }, [viewingStudentInbox]);

  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }

    const endpoint = viewingStudentInbox
      ? `/api/messages/student/${activeChat.studentUserId}?staffId=${activeChat.staffId || ''}`
      : `/api/messages/${activeChat.id}`;

    apiGet(endpoint)
      .then((data) => setMessages(data))
      .catch((err) => {
        console.error(err);
        setMessages([]);
      });
  }, [activeChat, viewingStudentInbox]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const payload = viewingStudentInbox
      ? { toUserId: activeChat.studentUserId, staffId: activeChat.staffId, body: newMessage.trim() }
      : { toStaffId: activeChat.id, body: newMessage.trim() };

    try {
      const savedMessage = await apiPost('/api/messages', payload);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: savedMessage.id,
          text: savedMessage.body,
          sender: savedMessage.sender,
          time: new Date(savedMessage.sentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isUser: true
        }
      ]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="messaging-page">
    <div className="messaging-layout">
      {/* Sidebar: Conversation List */}
      <div className="messaging-sidebar">
        <div className="sidebar-header">
          <h3>{viewingStudentInbox ? 'Admin Messages' : 'Messages'}</h3>
        </div>
        <div className="conversation-list">
          {conversations.map((member) => (
            <div 
              key={member.id} 
              className={`conversation-item ${activeChat?.id === member.id ? 'active' : ''}`}
              onClick={() => setActiveChat(member)}
            >
              <div className="avatar-circle">
                {(member.name || '').charAt(0)}
              </div>
              <div className="conversation-details">
                <span className="user-name">{member.name}</span>
                <span className="last-snippet">{viewingStudentInbox && member.staffName ? `${member.staffName}: ${member.lastSnippet || ''}` : member.lastSnippet || member.role || member.department}</span>
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
                <span>{viewingStudentInbox && activeChat.staffName ? `Conversation through ${activeChat.staffName}` : activeChat.department}</span>
              </div>
            </div>
            
            <div className="chat-history">
              {messages.length === 0 ? (
                <div className="empty-chat-message">
                  {viewingStudentInbox ? 'No messages in this student conversation yet.' : 'No messages yet. Send the first message to your advisor or doctor.'}
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`message-row ${msg.isUser ? 'user-sent' : 'received'}`}>
                    <div className="bubble">
                      <p>{msg.text}</p>
                      <span className="bubble-time">{msg.time}</span>
                    </div>
                  </div>
                ))
              )}
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
              <p>{viewingStudentInbox ? 'Select a student conversation from the left.' : 'Select a staff member or instructor from the left to start a conversation.'}</p>
              <div className="theme-divider"></div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
