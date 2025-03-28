// Deployment configuration and utilities

import { env, validateEnv } from "./env"
import logger from "./services/logging-service"

// Initialize deployment
export async function initializeDeployment() {
  // Validate environment variables
  const envErrors = validateEnv()
  if (envErrors.length > 0) {
    envErrors.forEach((error) => logger.error(`Environment error: ${error}`))

    // In development, we can continue with warnings
    if (env.NODE_ENV === "production") {
      throw new Error("Invalid environment configuration for production")
    }
  }

  // Create necessary directories
  const fs = require("fs")
  const path = require("path")

  try {
    if (!fs.existsSync(env.TEMP_UPLOAD_DIR)) {
      fs.mkdirSync(env.TEMP_UPLOAD_DIR, { recursive: true })
      logger.info(`Created temp upload directory: ${env.TEMP_UPLOAD_DIR}`)
    }

    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), "logs")
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
      logger.info(`Created logs directory: ${logsDir}`)
    }
  } catch (error) {
    logger.error("Error creating directories:", error)
  }

  // Initialize database connection
  try {
    const { connectToDatabase } = require("./db/connect")
    await connectToDatabase()
    logger.info("Database connection established")
  } catch (error) {
    logger.error("Failed to connect to database:", error)
    // In production, we might want to exit the process
    if (env.NODE_ENV === "production") {
      process.exit(1)
    }
  }

  // Schedule cleanup tasks
  const { cleanupOldTempFiles } = require("./middleware/file-upload")

  // Run cleanup immediately
  cleanupOldTempFiles()

  // Schedule regular cleanup (every 6 hours)
  setInterval(cleanupOldTempFiles, 6 * 60 * 60 * 1000)

  logger.info(`Server initialized in ${env.NODE_ENV} mode`)
}

// Graceful shutdown
export function setupGracefulShutdown() {
  // Handle process termination signals
  const signals = ["SIGINT", "SIGTERM", "SIGQUIT"]

  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger.info(`Received ${signal}, shutting down gracefully`)

      try {
        // Close database connection
        const { disconnectFromDatabase } = require("./db/connect")
        await disconnectFromDatabase()
        logger.info("Database connection closed")

        // Perform any other cleanup
        logger.info("Cleanup complete, exiting process")
        process.exit(0)
      } catch (error) {
        logger.error("Error during graceful shutdown:", error)
        process.exit(1)
      }
    })
  })
}

