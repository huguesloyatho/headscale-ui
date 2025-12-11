/**
 * Global Error Handler Middleware
 */

const logger = require('../utils/logger');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Global error handler
 */
function errorHandler(err, req, res, next) {
  // Log the error
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Determine status code
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_ERROR;

  // Send error response
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
