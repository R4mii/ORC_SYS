import express from "express"
import path from "path"
import morgan from "morgan"
import { processImageWithOCR, parseInvoiceData } from "./services/ocr-service"
import { type FileRequest, type OCROptions, AppError } from "./config/types"
import { CONFIG } from "./config/config"
import logger, { logStream } from "./config/logger"
import { uploadMiddleware, scheduleCleanup } from "./middleware/validate-upload"
import { errorHandler, asyncHandler, notFoundHandler, setupGlobalErrorHandlers } from "./middleware/error-handler"
import { applySecurity } from "./middleware/security"
import { generalLimiter, ocrLimiter } from "./middleware/rate-limiter"

// Initialize Express app
const app = express()

// Apply security middleware (helmet, CORS, etc.)
applySecurity(app)

// Add request logging
app.use(morgan("combined", { stream: logStream }))

// Global rate limiting
app.use("/api/", generalLimiter)

// Apply stricter rate limits to resource-intensive endpoints
app.use("/api/ocr", ocrLimiter)

// Set up error handling for uncaught exceptions
setupGlobalErrorHandlers()

// OCR endpoint with improved error handling
app.post(
  "/api/upload",
  uploadMiddleware.single("file"),
  asyncHandler(async (req: FileRequest, res) => {
    if (!req.file) {
      throw new AppError("No file uploaded", 400)
    }

    try {
      // Get language preference from request with validation
      const language = typeof req.body.language === "string" ? req.body.language : "fr"

      const options: OCROptions = {
        preferredLanguage: language,
        useCache: req.body.useCache !== "false", // Default to true if not specified
      }

      // Process the image with OCR
      logger.info(`Processing OCR request for file: ${req.file.originalname}`)
      const ocrText = await processImageWithOCR(req.file.path, options)

      // Parse the OCR text to extract invoice data
      const invoiceData = parseInvoiceData(ocrText)

      // Construct the file URL with proper host information
      const host = req.get("host") || "localhost"
      const protocol = req.protocol || "http"
      const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`

      // Return the extracted data with file information
      res.json({
        success: true,
        data: {
          ...invoiceData,
          fileUrl,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileType: req.file.mimetype,
          timestamp: Date.now(),
        },
      })
    } catch (error) {
      // Let the global error handler take care of this
      throw error
    }
  }),
)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: Date.now(),
    environment: CONFIG.isDev ? "development" : "production",
  })
})

// Add secure route to serve uploaded files
app.use("/uploads", express.static(path.join(CONFIG.upload.tempDir)))

// 404 handler for undefined routes
app.use(notFoundHandler)

// Global error handler must be last
app.use(errorHandler)

// Start the server
const port = CONFIG.server.port
const server = app.listen(port, () => {
  logger.info(`Server running on port ${port} in ${CONFIG.isDev ? "development" : "production"} mode`)
})

// Schedule the cleanup task for temporary files
const cleanupTask = scheduleCleanup()

// Handle graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received. Shutting down gracefully...")

  // Clear the cleanup interval
  clearInterval(cleanupTask)

  server.close(() => {
    logger.info("Server closed")
    process.exit(0)
  })

  // Force close after 10s
  setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down")
    process.exit(1)
  }, 10000)
})

export default app
