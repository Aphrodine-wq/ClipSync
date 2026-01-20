/**
 * SpacesSelector Component
 * Space/workspace selector and management
 */

import React, { useState, useEffect } from 'react';
import './SpacesSelector.css';

export default function SpacesSelector({ currentSpaceId, onSpaceChange, onSpaceCreate }) {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/spaces', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSpaces(data.spaces || []);
      }
    } catch (error) {
      console.error('Failed to load spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/spaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newSpaceName,
          color: '#6366f1',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSpaces([...spaces, data.space]);
        setNewSpaceName('');
        setShowCreate(false);
        if (onSpaceCreate) {
          onSpaceCreate(data.space);
        }
      }
    } catch (error) {
      console.error('Failed to create space:', error);
    }
  };

  if (loading) {
    return <div className="spaces-loading">Loading spaces...</div>;
  }

  return (
    <div className="spaces-selector">
      <div className="spaces-list">
        {spaces.map((space) => (
          <button
            key={space.id}
            className={`space-item ${currentSpaceId === space.id ? 'active' : ''}`}
            onClick={() => onSpaceChange && onSpaceChange(space.id)}
            style={{
              borderLeftColor: space.color || '#6366f1',
            }}
          >
            {space.icon && <span className="space-icon">{space.icon}</span>}
            <span className="space-name">{space.name}</span>
            {space.is_default && <span className="space-badge">Default</span>}
          </button>
        ))}
      </div>

      {showCreate ? (
        <div className="create-space-form">
          <input
            type="text"
            placeholder="Space name"
            value={newSpaceName}
            onChange={(e) => setNewSpaceName(e.target.value)}
            className="space-input"
            autoFocus
          />
          <div className="create-actions">
            <button onClick={handleCreateSpace} className="create-btn">
              Create
            </button>
            <button
              onClick={() => {
                setShowCreate(false);
                setNewSpaceName('');
              }}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          className="add-space-btn"
          onClick={() => setShowCreate(true)}
        >
          + New Space
        </button>
      )}
    </div>
  );
}

