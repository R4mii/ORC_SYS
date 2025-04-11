import type { NextApiRequest, NextApiResponse } from "next"
import logger from "../services/logging-service"

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor)
  }
}

// Error handler middleware
export const errorHandler = (err: Error | ApiError, req: NextApiRequest, res: NextApiResponse) => {
  // Log the error
  logger.error(`${err.message}`, { stack: err.stack })

  // If it's an ApiError, use its status code and message
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      isOperational: err.isOperational,
    })
  }

  // For unhandled errors, return a generic 500 response
  return res.status(500).json({
    error: "An unexpected error occurred",
    isOperational: false,
  })
}

// Async handler to catch errors in async route handlers
export const asyncHandler = (fn: Function) => (req: NextApiRequest, res: NextApiResponse) => {
  Promise.resolve(fn(req, res)).catch((err) => errorHandler(err, req, res))
}

// Create specific error types
export const BadRequestError = (message: string) => new ApiError(400, message)
export const UnauthorizedError = (message: string) => new ApiError(401, message)
export const ForbiddenError = (message: string) => new ApiError(403, message)
export const NotFoundError = (message: string) => new ApiError(404, message)
export const InternalServerError = (message: string) => new ApiError(500, message, false)
