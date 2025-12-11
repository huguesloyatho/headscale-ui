/**
 * Rate Limiting Middleware
 */

const rateLimit = require('express-rate-limit');
const config = require('../config/env');

/**
 * General rate limiter for all API endpoints
 */
const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW * 60 * 1000, // minutes to ms
  max: config.RATE_LIMIT_MAX,
  message: {
    error: 'Too many requests',
    message: `Please try again later. Limit: ${config.RATE_LIMIT_MAX} requests per ${config.RATE_LIMIT_WINDOW} minutes`,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for sensitive endpoints (like test connection)
 */
const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 3, // 3 requests per minute
  message: {
    error: 'Too many requests',
    message: 'Please try again later. Limit: 3 requests per minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  strictLimiter,
};
