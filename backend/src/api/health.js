/**
 * Health Check API Routes
 */

const express = require('express');
const router = express.Router();
const { getClient } = require('../services/headscale/client');
const config = require('../config/env');
const { APP_VERSION } = require('../config/constants');

/**
 * GET /api/health
 * Health check endpoint for Docker healthcheck
 */
router.get('/', async (req, res) => {
  try {
    // Test Headscale connection
    const client = getClient();
    const connectionTest = await client.testConnection();

    const health = {
      status: connectionTest.success ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: APP_VERSION,
      headscale: {
        connected: connectionTest.success,
        url: config.HEADSCALE_URL,
        message: connectionTest.message,
      },
    };

    const statusCode = connectionTest.success ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: APP_VERSION,
      error: error.message,
    });
  }
});

module.exports = router;
