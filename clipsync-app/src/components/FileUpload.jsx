/**
 * FileUpload Component
 * Handles file and image uploads
 */

import React, { useRef, useState } from 'react';
import './FileUpload.css';

export default function FileUpload({ onUpload, onCancel }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(`File type ${file.type} not supported`);
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10MB.');
      return;
    }

    // Show preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      if (onUpload) {
        await onUpload(formData);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      setPreview(null);
    }
  };

  return (
    <div className="file-upload">
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="preview-image" />
            <button
              className="remove-preview"
              onClick={() => setPreview(null)}
            >
              ×
            </button>
          </div>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf,text/plain"
              onChange={handleFileSelect}
              className="file-input"
            />
            <div className="upload-content">
              {uploading ? (
                <div className="upload-spinner">
                  <div className="spinner"></div>
                  <p>Uploading...</p>
                </div>
              ) : (
                <>
                  <span className="upload-icon">📎</span>
                  <p className="upload-text">
                    Drag and drop a file here, or click to select
                  </p>
                  <p className="upload-hint">
                    Images, PDFs, and text files supported (max 10MB)
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {onCancel && (
        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      )}
    </div>
  );
}

