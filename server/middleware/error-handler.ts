import { Request, Response, NextFunction } from 'express';
import { AppError } from '../config/types';
import logger from '../config/logger';
import { CONFIG } from '../config/config';

/**
 * Central error handler middleware for handling different types of errors
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // Log the error
  logger.error('Error occurred:', err);

  // Set defaults
  let statusCode = 500;
  let message = 'An unexpected error occurred';
  let errorData: Record<string, any> = {};

  // Handle our custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    
    // Only include operational errors in the response
    if (!err.isOperational) {
      message = 'An unexpected error occurred';
    }
  } 
  // Handle Multer errors
  else if (err.name === 'MulterError') {
    statusCode = 400;
    message = `File upload error: ${err.message}`;
    
    if (err.message === 'File too large') {
      message = `File exceeds maximum size limit of ${CONFIG.upload.maxFileSize / (1024 * 1024)}MB`;
    }
  } 
  // Handle Validation errors
  else if (err.name === 'ValidationError' || err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation error';
    errorData.details = err.message;
  }
  // Handle SyntaxError (usually JSON parsing error)
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  // In production, don't expose error details for non-operational errors
  const responseBody = {
    success: false,
    error: message,
    ...(CONFIG.isDev || (err instanceof AppError && err.isOperational) 
      ? { details: errorData.details || err.message } 
      : {}),
    timestamp: Date.now()
  };

  // Send error response
  res.status(statusCode).json(responseBody);
}

/**
 * Middleware to handle async errors
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Middleware to handle 404 Not Found errors
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
}

/**
 * Global error handlers for unhandled exceptions and rejections
 */
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: Error) => {
    logger.error('Unhandled Promise Rejection:', reason);
    // In a production environment, you might want to gracefully restart the process
    if (CONFIG.isProd) {
      logger.error('Unhandled rejection in production environment. Exiting...');
      process.exit(1);
    }
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    // Always exit on uncaught exceptions
    logger.error('Uncaught exception. Exiting...');
    process.exit(1);
  });
}

