/**
 * Image Processing Service
 * Handles image upload, compression, and thumbnail generation
 */

const sharp = require('sharp');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;

class ImageProcessingService {
  constructor() {
    this.maxImageSize = 10 * 1024 * 1024; // 10MB
    this.maxThumbnailSize = 200 * 1024; // 200KB
    this.thumbnailWidth = 300;
    this.thumbnailHeight = 300;
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];
  }

  /**
   * Process uploaded image
   * @param {Buffer} imageBuffer - Image file buffer
   * @param {string} originalName - Original file name
   * @param {string} mimeType - MIME type
   * @returns {Promise<Object>} Processed image data
   */
  async processImage(imageBuffer, originalName, mimeType) {
    // Validate MIME type
    if (!this.allowedMimeTypes.includes(mimeType)) {
      throw new Error(`Unsupported image type: ${mimeType}`);
    }

    // Validate file size
    if (imageBuffer.length > this.maxImageSize) {
      throw new Error(`Image too large. Maximum size: ${this.maxImageSize / 1024 / 1024}MB`);
    }

    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    const { width, height, format } = metadata;

    // Generate checksum
    const checksum = crypto
      .createHash('sha256')
      .update(imageBuffer)
      .digest('hex');

    // Compress image if needed
    let processedBuffer = imageBuffer;
    if (imageBuffer.length > 2 * 1024 * 1024) { // Compress if > 2MB
      processedBuffer = await sharp(imageBuffer)
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    // Generate thumbnail
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(this.thumbnailWidth, this.thumbnailHeight, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    return {
      original: {
        buffer: processedBuffer,
        width,
        height,
        format,
        size: processedBuffer.length,
        mimeType: `image/${format}`,
      },
      thumbnail: {
        buffer: thumbnailBuffer,
        width: this.thumbnailWidth,
        height: this.thumbnailHeight,
        size: thumbnailBuffer.length,
        mimeType: 'image/jpeg',
      },
      checksum,
      metadata: {
        width,
        height,
        format,
        originalSize: imageBuffer.length,
        processedSize: processedBuffer.length,
      },
    };
  }

  /**
   * Save image to storage
   * @param {Buffer} buffer - Image buffer
   * @param {string} filename - File name
   * @param {string} storagePath - Storage directory path
   * @returns {Promise<string>} File path
   */
  async saveImage(buffer, filename, storagePath) {
    const filePath = path.join(storagePath, filename);
    await fs.mkdir(storagePath, { recursive: true });
    await fs.writeFile(filePath, buffer);
    return filePath;
  }

  /**
   * Generate unique filename
   * @param {string} originalName - Original file name
   * @returns {string} Unique filename
   */
  generateFilename(originalName) {
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `${baseName}-${timestamp}-${random}${ext}`;
  }

  /**
   * Validate image file
   * @param {Buffer} buffer - File buffer
   * @param {string} mimeType - MIME type
   * @returns {Promise<boolean>} Is valid
   */
  async validateImage(buffer, mimeType) {
    try {
      if (!this.allowedMimeTypes.includes(mimeType)) {
        return false;
      }

      // Try to read image metadata
      await sharp(buffer).metadata();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Convert image to base64
   * @param {Buffer} buffer - Image buffer
   * @param {string} mimeType - MIME type
   * @returns {string} Base64 string
   */
  toBase64(buffer, mimeType) {
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  }

  /**
   * Get image dimensions
   * @param {Buffer} buffer - Image buffer
   * @returns {Promise<Object>} Dimensions {width, height}
   */
  async getDimensions(buffer) {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
    };
  }
}

module.exports = new ImageProcessingService();

