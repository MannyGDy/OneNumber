import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'payment-api' },
  transports: [
    // Write to all logs with level 'info' and below to combined.log
    new winston.transports.File({ filename: path.join(logDir, 'combined.log') }),
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    // Write all logs with level 'debug' and below to debug.log in development
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.File({ filename: path.join(logDir, 'debug.log'), level: 'debug' })
    ] : []),
    // Only log to console in development or if explicitly set
    ...(process.env.NODE_ENV !== 'production' || process.env.LOG_TO_CONSOLE === 'true' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ] : [])
  ]
});

// Capture and log unhandled exceptions and rejections
logger.exceptions.handle(
  new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') })
);
logger.rejections.handle(
  new winston.transports.File({ filename: path.join(logDir, 'rejections.log') })
);

export default logger;