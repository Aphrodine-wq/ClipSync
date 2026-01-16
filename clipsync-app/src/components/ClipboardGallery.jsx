/**
 * ClipboardGallery Component
 * Grid view with thumbnails and drag-drop
 */

import React, { useState } from 'react';
import './ClipboardGallery.css';

export default function ClipboardGallery({ clips, onSelectClip, onReorder }) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex && onReorder) {
      onReorder(draggedIndex, dropIndex);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const getClipColor = (clip) => {
    // Generate color based on clip type or content
    const colors = {
      text: '#6366f1',
      code: '#10b981',
      json: '#f59e0b',
      url: '#3b82f6',
      email: '#8b5cf6',
    };
    return colors[clip.type] || '#6b7280';
  };

  return (
    <div className="clipboard-gallery">
      <div className="gallery-grid">
        {clips.map((clip, index) => {
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;
          const color = getClipColor(clip);

          return (
            <div
              key={clip.id}
              className={`gallery-item ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => onSelectClip && onSelectClip(clip)}
            >
              {clip.thumbnail_url || clip.content_type === 'image' ? (
                <div className="gallery-thumbnail">
                  <img
                    src={clip.thumbnail_url || clip.content}
                    alt={clip.file_name || 'Clip'}
                    className="thumbnail-image"
                  />
                </div>
              ) : (
                <div
                  className="gallery-preview"
                  style={{ backgroundColor: `${color}20`, borderColor: color }}
                >
                  <div className="preview-icon" style={{ color }}>
                    {clip.type === 'code' ? '💻' : clip.type === 'json' ? '📄' : '📋'}
                  </div>
                  <div className="preview-content" style={{ color }}>
                    {clip.content.substring(0, 50)}
                    {clip.content.length > 50 ? '...' : ''}
                  </div>
                </div>
              )}

              <div className="gallery-footer">
                <span className="gallery-type">{clip.type}</span>
                {clip.pinned && <span className="gallery-pin">📌</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

