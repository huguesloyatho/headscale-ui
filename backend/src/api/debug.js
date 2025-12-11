/**
 * Debug API Routes
 *
 * These endpoints are for development and debugging only.
 * They should be disabled in production.
 */

const express = require('express');
const router = express.Router();
const config = require('../config/env');
const { getClient } = require('../services/headscale/client');
const { getStorage } = require('../storage');
const { maskApiKey } = require('../utils/formatter');
const logger = require('../utils/logger');

// Middleware to disable debug routes in production
router.use((req, res, next) => {
  if (config.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'Debug endpoints are disabled in production',
    });
  }
  next();
});

/**
 * GET /api/debug/config
 * Get current configuration (without secrets)
 */
router.get('/config', (req, res) => {
  const safeConfig = {
    HEADSCALE_URL: config.HEADSCALE_URL,
    HEADSCALE_API_KEY: maskApiKey(config.HEADSCALE_API_KEY),
    HEADSCALE_PROVIDER: config.HEADSCALE_PROVIDER,
    APP_PORT: config.APP_PORT,
    NODE_ENV: config.NODE_ENV,
    LOG_LEVEL: config.LOG_LEVEL,
    ENABLE_AUTH: config.ENABLE_AUTH,
    TOTP_ENABLED: config.TOTP_ENABLED,
    RATE_LIMIT_MAX: config.RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW: config.RATE_LIMIT_WINDOW,
    DOCKER_FALLBACK_ENABLED: config.DOCKER_FALLBACK_ENABLED,
  };

  res.json({
    success: true,
    config: safeConfig,
  });
});

/**
 * GET /api/debug/health-full
 * Detailed health check
 */
router.get('/health-full', async (req, res) => {
  try {
    const client = getClient();
    const connectionTest = await client.testConnection();
    const storage = getStorage();
    const settings = await storage.getSettings();

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        headscale: {
          status: connectionTest.success ? 'connected' : 'disconnected',
          url: config.HEADSCALE_URL,
          message: connectionTest.message,
          data: connectionTest.data,
        },
        storage: {
          status: 'ok',
          lastConnection: settings.lastConnection,
        },
      },
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }
});

/**
 * POST /api/debug/test-api
 * Test a specific Headscale API endpoint
 */
router.post('/test-api', async (req, res) => {
  try {
    const { endpoint, method = 'GET', body = null } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        error: 'Endpoint is required',
      });
    }

    const client = getClient();
    let result;

    switch (method.toUpperCase()) {
      case 'GET':
        result = await client.get(endpoint);
        break;
      case 'POST':
        result = await client.post(endpoint, body);
        break;
      case 'PUT':
        result = await client.put(endpoint, body);
        break;
      case 'DELETE':
        result = await client.delete(endpoint);
        break;
      default:
        return res.status(400).json({
          error: 'Invalid method',
          message: 'Method must be GET, POST, PUT, or DELETE',
        });
    }

    logger.debug('API test performed', { endpoint, method });

    res.json({
      success: true,
      endpoint,
      method,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/debug/logs
 * Get recent logs (if available)
 * Note: This would require implementing a log buffer/store
 */
router.get('/logs', (req, res) => {
  res.json({
    message: 'Log retrieval not yet implemented',
    hint: 'Check Docker logs with: docker logs headscale-ui',
  });
});

module.exports = router;
