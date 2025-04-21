import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { CONFIG } from '../config/config';
import { AppError } from '../config/types';
import logger from '../config/logger';
import crypto from 'crypto';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = CONFIG.upload.tempDir;

    // Ensure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize original file name
    const sanitizedName = path.basename(file.originalname).replace(/[^a-zA-Z0-9_.-]/g, '_');
    
    // Generate a unique filename with timestamp and random values
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
    const fileExt = path.extname(sanitizedName);
    
    cb(null, `${uniqueSuffix}${fileExt}`);
  },
});

// File filter to validate uploaded files
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check MIME type
  if (!CONFIG.upload.allowedMimeTypes.includes(file.mimetype)) {
    return cb(new AppError(
      `Invalid file type. Allowed types: ${CONFIG.upload.allowedMimeTypes.join(', ')}`,
      400
    ));
  }
  
  // Additional validation - check file extension matches mimetype
  const ext = path.extname(file.originalname).toLowerCase();
  let validExt = false;
  
  switch (file.mimetype) {
    case 'image/jpeg':
      validExt = ['.jpg', '.jpeg'].includes(ext);
      break;
    case 'image/png':
      validExt = ext === '.png';
      break;
    case 'image/gif':
      validExt = ext === '.gif';
      break;
    case 'application/pdf':
      validExt = ext === '.pdf';
      break;
    default:
      validExt = false;
  }
  
  if (!validExt) {
    return cb(new AppError(
      `File extension doesn't match the file type`,
      400
    ));
  }
  
  // Log the upload
  logger.info(`File upload: ${file.originalname} (${file.mimetype})`);
  
  cb(null, true);
};

// Configure multer with our settings
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: CONFIG.upload.maxFileSize,
  },
});

// Helper to clean up old files in the uploads directory
export function cleanupOldUploads(maxAgeHours = 24): void {
  const uploadDir = CONFIG.upload.tempDir;
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  
  if (!fs.existsSync(uploadDir)) {
    return;
  }
  
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      logger.error('Error reading upload directory during cleanup:', err);
      return;
    }
    
    const now = Date.now();
    
    files.forEach(file => {
      const filePath = path.join(uploadDir, file);
      
      fs.stat(filePath, (err, stats) => {
        if (err) {
          logger.error(`Error getting file stats for ${file}:`, err);
          return;
        }
        
        // Remove files older than maxAge
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlink(filePath, err => {
            if (err) {
              logger.error(`Error deleting old file ${file}:`, err);
            } else {
              logger.info(`Deleted old file: ${file}`);
            }
          });
        }
      });
    });
  });
}

// Schedule cleanup to run daily
export function scheduleCleanup(): NodeJS.Timeout {
  // Run cleanup immediately
  cleanupOldUploads();
  
  // Schedule to run every 24 hours
  return setInterval(() => {
    logger.info('Running scheduled upload directory cleanup');
    cleanupOldUploads();
  }, 24 * 60 * 60 * 1000);
}

