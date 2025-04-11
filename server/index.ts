import express from "express"
import cors from "cors"
import multer from "multer"
import path from "path"
import fs from "fs"
import { processImageWithOCR, parseInvoiceData } from "./services/ocr-service"

// Load environment variables
require("dotenv").config()

const app = express()
// Update the CORS configuration to properly handle preflight requests
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
)
app.use(express.json())

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.TEMP_UPLOAD_DIR || path.join(__dirname, "uploads")

    // Ensure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

// File filter to ensure only images and PDFs are uploaded
const fileFilter = (req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = (process.env.ALLOWED_MIME_TYPES || "image/jpeg,image/png,image/gif,application/pdf").split(
    ",",
  )

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(", ")}`))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE || "10485760"), // Default to 10MB
  },
})

// OCR endpoint
// Ensure the upload endpoint properly handles multipart/form-data
app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file uploaded" })
  }

  try {
    // Process the image with Google Vision OCR
    const ocrText = await processImageWithOCR(req.file.path, {
      preferredLanguage: req.body.language || "fr", // Default to French
    })

    // Parse the OCR text to extract invoice data
    const invoiceData = parseInvoiceData(ocrText)

    // Save the file to a permanent location if needed
    const fileUrl = `/uploads/${req.file.filename}`

    // Return the extracted data with file information
    res.json({
      success: true,
      data: {
        ...invoiceData,
        fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
      },
    })
  } catch (error) {
    console.error("Error processing OCR:", error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "OCR processing failed",
    })
  } finally {
    // Clean up the temporary file
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting temp file:", err)
      })
    }
  }
})

// Add a route to serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Start the server
const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
