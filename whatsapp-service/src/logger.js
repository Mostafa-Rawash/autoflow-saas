/**
 * Logger utility using Winston
 * Provides structured logging with file rotation
 */
import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Safe JSON stringify that handles circular references
 */
function safeStringify(obj, space = 0) {
  const seen = new WeakSet();
  
  return JSON.stringify(obj, (key, value) => {
    // Skip functions and undefined
    if (typeof value === 'function' || value === undefined) {
      return undefined;
    }
    
    // Handle circular references
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
      
      // For Error objects, extract just the message
      if (value instanceof Error) {
        return value.message;
      }
    }
    
    return value;
  }, space);
}

/**
 * Create a service-specific logger
 * @param {string} serviceName - Name of the service for logging
 * @returns {winston.Logger} Configured logger instance
 */
export function createServiceLogger(serviceName) {
  const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
      let msg = `[${timestamp}] [${serviceName}] ${level.toUpperCase()}: ${message}`;
      
      // Safely stringify meta without circular references
      if (Object.keys(meta).length > 0) {
        try {
          msg += ` ${safeStringify(meta)}`;
        } catch (e) {
          msg += ` [meta stringify failed]`;
        }
      }
      
      if (stack) {
        msg += `\n${stack}`;
      }
      return msg;
    })
  );

  const transports = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '..', 'logs', `${serviceName}-%DATE%.log`),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info'
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '..', 'logs', `${serviceName}-error-%DATE%.log`),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error'
    })
  ];

  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports,
    exitOnError: false
  });
}

export const logger = createServiceLogger('App');
export default logger;
