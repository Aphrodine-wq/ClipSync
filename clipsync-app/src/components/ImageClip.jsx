/**
 * ImageClip Component
 * Displays image clips with preview and thumbnail
 */

import React, { useState } from 'react';
import './ImageClip.css';

export default function ImageClip({ clip, onCopy, onDelete, onPin }) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const imageUrl = clip.thumbnail_url || clip.content;
  const isBase64 = imageUrl.startsWith('data:image');

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleCopy = () => {
    if (onCopy) {
      onCopy(clip);
    }
  };

  return (
    <div className="image-clip">
      <div className="image-clip-header">
        <span className="image-clip-type">{clip.content_type}</span>
        {clip.pinned && <span className="pin-icon">📌</span>}
      </div>

      <div className="image-clip-preview">
        {isLoading && (
          <div className="image-loading">
            <div className="spinner"></div>
          </div>
        )}
        {imageError ? (
          <div className="image-error">
            <span>⚠️</span>
            <p>Failed to load image</p>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={clip.file_name || 'Clip image'}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className="image-preview"
          />
        )}
      </div>

      {clip.file_name && (
        <div className="image-clip-info">
          <p className="file-name">{clip.file_name}</p>
          {clip.file_size && (
            <p className="file-size">
              {(clip.file_size / 1024).toFixed(1)} KB
            </p>
          )}
          {clip.width && clip.height && (
            <p className="image-dimensions">
              {clip.width} × {clip.height}
            </p>
          )}
        </div>
      )}

      <div className="image-clip-actions">
        <button onClick={handleCopy} className="action-btn copy-btn">
          Copy
        </button>
        <button
          onClick={() => onPin && onPin(clip.id)}
          className={`action-btn pin-btn ${clip.pinned ? 'pinned' : ''}`}
        >
          {clip.pinned ? 'Unpin' : 'Pin'}
        </button>
        <button
          onClick={() => onDelete && onDelete(clip.id)}
          className="action-btn delete-btn"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

