import type { NextApiRequest, NextApiResponse } from "next"
import multer from "multer"
import fs from "fs"
import path from "path"
import { config } from "../config"
import { v4 as uuidv4 } from "uuid"
import type { Express } from "express" // Import Express

// Ensure temp directory exists
const tempDir = config.upload.tempDir
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir)
  },
  filename: (req, file, cb) => {
    // Generate unique filename to prevent collisions
    const uniqueFilename = `${uuidv4()}-${file.originalname}`
    cb(null, uniqueFilename)
  },
})

// File filter to validate uploads
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if the file type is allowed
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${config.upload.allowedMimeTypes.join(", ")}`))
  }
}

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize, // Max file size in bytes
  },
})

// Middleware to handle file uploads
export const uploadMiddleware = (fieldName = "file") => {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const multerUpload = upload.single(fieldName)

    multerUpload(req as any, res as any, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              error: `File too large. Maximum size is ${config.upload.maxFileSize / 1024 / 1024}MB`,
            })
          }
        }
        return res.status(400).json({ error: err.message })
      }

      // Continue to next middleware
      next()
    })
  }
}

// Helper to clean up temporary files
export const cleanupTempFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (error) {
    console.error(`Error cleaning up temp file ${filePath}:`, error)
  }
}

// Schedule cleanup of old temporary files (run periodically)
export const cleanupOldTempFiles = () => {
  try {
    const files = fs.readdirSync(tempDir)
    const now = Date.now()

    files.forEach((file) => {
      const filePath = path.join(tempDir, file)
      const stats = fs.statSync(filePath)

      // Remove files older than 24 hours
      const fileAge = now - stats.mtimeMs
      if (fileAge > 24 * 60 * 60 * 1000) {
        fs.unlinkSync(filePath)
        console.log(`Cleaned up old temp file: ${filePath}`)
      }
    })
  } catch (error) {
    console.error("Error cleaning up old temp files:", error)
  }
}
