import winston from 'winston';
import path from 'path';
import { CONFIG } from './config';

// Create a Winston logger configuration
const logger = winston.createLogger({
  level: CONFIG.logging.level,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'ocr-service' },
  transports: [
    // Write logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...metadata }) => {
          let metaStr = '';
          if (Object.keys(metadata).length > 0 && !metadata.stack) {
            metaStr = JSON.stringify(metadata);
          }
          
          const stack = metadata.stack ? `\n${metadata.stack}` : '';
          return `${timestamp} ${level}: ${message} ${metaStr}${stack}`;
        })
      ),
    }),
  ],
});

// Add file logging in production
if (CONFIG.isProd) {
  logger.add(
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'error.log'), 
      level: 'error' 
    })
  );
  logger.add(
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'combined.log')
    })
  );
}

// Create a stream object for Morgan integration
export const logStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export default logger;

