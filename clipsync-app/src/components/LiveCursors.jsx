/**
 * LiveCursors Component
 * Real-time cursor tracking for collaboration
 */

import React, { useEffect, useState } from 'react';
import './LiveCursors.css';

export default function LiveCursors({ socket, clipId, teamId }) {
  const [cursors, setCursors] = useState({});
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for cursor updates
    const handleCursorUpdate = (data) => {
      setCursors(prev => ({
        ...prev,
        [data.userId]: {
          ...data.user,
          position: data.position,
        },
      }));
    };

    // Listen for user join/leave
    const handleUserJoined = (data) => {
      setActiveUsers(prev => {
        if (prev.find(u => u.userId === data.userId)) {
          return prev;
        }
        return [...prev, { userId: data.userId, ...data.user }];
      });
    };

    const handleUserLeft = (data) => {
      setActiveUsers(prev => prev.filter(u => u.userId !== data.userId));
      setCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[data.userId];
        return newCursors;
      });
    };

    // Listen for active users list
    const handleActiveUsers = (users) => {
      setActiveUsers(users);
    };

    socket.on('cursor:update', handleCursorUpdate);
    socket.on('user:joined', handleUserJoined);
    socket.on('user:left', handleUserLeft);
    socket.on('users:active', handleActiveUsers);

    // Join clip room
    if (clipId) {
      socket.emit('clip:join', clipId);
    }

    // Cleanup
    return () => {
      socket.off('cursor:update', handleCursorUpdate);
      socket.off('user:joined', handleUserJoined);
      socket.off('user:left', handleUserLeft);
      socket.off('users:active', handleActiveUsers);
      
      if (clipId) {
        socket.emit('clip:leave', clipId);
      }
    };
  }, [socket, clipId, teamId]);

  // Update cursor position on mouse move
  useEffect(() => {
    if (!socket || !clipId) return;

    const handleMouseMove = (e) => {
      const position = {
        x: e.clientX,
        y: e.clientY,
      };

      socket.emit('cursor:update', {
        clipId,
        teamId,
        position,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [socket, clipId, teamId]);

  return (
    <>
      {Object.entries(cursors).map(([userId, cursor]) => (
        <div
          key={userId}
          className="live-cursor"
          style={{
            left: cursor.position?.x || 0,
            top: cursor.position?.y || 0,
          }}
        >
          <div className="cursor-pointer" style={{ color: getColorForUser(userId) }}>
            <span className="cursor-icon">✏️</span>
          </div>
          <div className="cursor-label">{cursor.name}</div>
        </div>
      ))}

      {activeUsers.length > 0 && (
        <div className="active-users">
          <span className="users-label">Active:</span>
          {activeUsers.map(user => (
            <span key={user.userId} className="user-badge">
              {user.name}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

function getColorForUser(userId) {
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

