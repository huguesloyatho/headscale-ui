/**
 * Authentication Middleware
 *
 * NOT YET IMPLEMENTED - Prepared for future use
 * Currently bypasses authentication
 */

const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Authentication middleware
 * TODO: Implement JWT verification when ENABLE_AUTH is true
 */
function authMiddleware(req, res, next) {
  // If auth is disabled, bypass
  if (!config.ENABLE_AUTH) {
    return next();
  }

  // TODO: Implement JWT verification
  // const token = req.headers.authorization?.split(' ')[1];
  // if (!token) {
  //   return res.status(401).json({ error: 'No token provided' });
  // }
  // Verify token, attach user to req.user, etc.

  logger.warn('Authentication is enabled but not yet implemented');
  return res.status(501).json({
    error: 'Authentication not yet implemented',
    message: 'Please disable ENABLE_AUTH or implement authentication',
  });
}

/**
 * 2FA middleware
 * TODO: Implement TOTP verification when TOTP_ENABLED is true
 */
function totpMiddleware(req, res, next) {
  // If TOTP is disabled, bypass
  if (!config.TOTP_ENABLED) {
    return next();
  }

  // TODO: Implement TOTP verification
  logger.warn('TOTP is enabled but not yet implemented');
  return res.status(501).json({
    error: 'TOTP not yet implemented',
    message: 'Please disable TOTP_ENABLED or implement 2FA',
  });
}

module.exports = {
  authMiddleware,
  totpMiddleware,
};
