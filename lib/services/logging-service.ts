import winston from "winston"
import { config } from "../config"

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Define log level based on environment
const level = () => {
  const env = config.server.env
  return env === "development" ? "debug" : "info"
}

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
}

// Add colors to winston
winston.addColors(colors)

// Define the format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
)

// Define where to store logs
const transports = [
  // Console logs
  new winston.transports.Console(),

  // Error logs
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
  }),

  // All logs
  new winston.transports.File({ filename: "logs/all.log" }),
]

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
})

export default logger

// Middleware for HTTP request logging
export const httpLogger = (req: any, res: any, next: () => void) => {
  // Log HTTP request
  logger.http(`${req.method} ${req.url}`)
  next()
}

// Log API errors
export const logApiError = (error: Error, context: string) => {
  logger.error(`API Error in ${context}: ${error.message}`, {
    stack: error.stack,
    context,
  })
}

// Log OCR processing
export const logOcrProcessing = (fileInfo: { name: string; size: number }, success: boolean, duration: number) => {
  if (success) {
    logger.info(`OCR processing successful for ${fileInfo.name} (${fileInfo.size} bytes) in ${duration}ms`)
  } else {
    logger.error(`OCR processing failed for ${fileInfo.name} (${fileInfo.size} bytes) after ${duration}ms`)
  }
}

