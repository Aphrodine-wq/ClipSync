/**
 * File Upload Middleware
 * Handles multipart/form-data for image and file uploads
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Configure storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'text/plain',
    'application/json',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/**
 * Middleware to handle single file upload
 */
const uploadSingle = upload.single('file');

/**
 * Middleware to handle multiple file uploads
 */
const uploadMultiple = upload.array('files', 10);

/**
 * Process uploaded file and attach to request
 */
const processUpload = async (req, res, next) => {
  if (!req.file && !req.body.content) {
    return next(); // No file, continue with regular JSON body
  }

  try {
    if (req.file) {
      // File upload detected
      req.body.isFileUpload = true;
      req.body.fileBuffer = req.file.buffer;
      req.body.fileName = req.file.originalname;
      req.body.mimeType = req.file.mimetype;
      req.body.fileSize = req.file.size;

      // Set content type based on file
      if (req.file.mimetype.startsWith('image/')) {
        req.body.contentType = 'image';
      } else {
        req.body.contentType = 'file';
      }

      // If content is provided in body, use it as description/metadata
      if (!req.body.content) {
        req.body.content = req.file.originalname; // Use filename as content
      }
    }

    next();
  } catch (error) {
    console.error('Upload processing error:', error);
    res.status(400).json({ error: 'Failed to process upload', message: error.message });
  }
};

export {
  uploadSingle,
  uploadMultiple,
  processUpload,
};