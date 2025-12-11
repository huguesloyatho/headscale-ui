/**
 * Logger Utility
 *
 * Structured logging using Winston
 */

const winston = require('winston');
const config = require('../config/env');

// Custom format for development (human-readable)
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}] ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Format for production (JSON)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger
const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: config.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
  ],
  // Don't exit on uncaught exceptions
  exitOnError: false,
});

// Don't log API keys or secrets
const sanitize = (data) => {
  if (typeof data === 'string') {
    return data.replace(/apikey[=:]\s*[\w-]+/gi, 'apikey=***REDACTED***');
  }
  if (typeof data === 'object' && data !== null) {
    const sanitized = { ...data };
    const sensitiveFields = ['apiKey', 'api_key', 'password', 'secret', 'token'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });
    return sanitized;
  }
  return data;
};

// Wrapper to sanitize all logs
const safeLogger = {
  error: (message, meta = {}) => logger.error(message, sanitize(meta)),
  warn: (message, meta = {}) => logger.warn(message, sanitize(meta)),
  info: (message, meta = {}) => logger.info(message, sanitize(meta)),
  debug: (message, meta = {}) => logger.debug(message, sanitize(meta)),
};

module.exports = safeLogger;
