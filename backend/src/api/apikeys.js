/**
 * API Keys Routes
 */

const express = require('express');
const router = express.Router();
const { getProvider } = require('../services/headscale/factory');
const { validateRequired, sanitizeInput, isValidDuration } = require('../utils/validator');
const logger = require('../utils/logger');

/**
 * GET /api/apikeys
 * List all API keys
 */
router.get('/', async (req, res, next) => {
  try {
    const provider = getProvider();
    const result = await provider.listApiKeys();

    if (!result.success) {
      return res.status(result.status || 500).json({
        error: result.error,
      });
    }

    // Extract apiKeys array from result.data (Headscale returns {apiKeys: [...]})
    const apiKeys = Array.isArray(result.data.apiKeys) ? result.data.apiKeys : [];

    res.json({
      success: true,
      data: apiKeys,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/apikeys
 * Create a new API key
 */
router.post('/', async (req, res, next) => {
  try {
    const expiration = req.body.expiration ? sanitizeInput(req.body.expiration) : null;

    // Validate expiration format if provided
    if (expiration && !isValidDuration(expiration)) {
      return res.status(400).json({
        error: 'Invalid expiration format',
        message: 'Expiration must be in format like 48h, 7d, 90d',
      });
    }

    const provider = getProvider();
    const result = await provider.createApiKey(expiration);

    if (!result.success) {
      return res.status(result.status || 500).json({
        error: result.error,
      });
    }

    logger.info('API key created', { expiration: expiration || 'none' });

    res.status(201).json({
      success: true,
      message: 'API key created successfully',
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/apikeys/expire
 * Expire an API key
 */
router.post('/expire', async (req, res, next) => {
  try {
    const validation = validateRequired(req.body, ['prefix']);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing: validation.missing,
      });
    }

    const prefix = sanitizeInput(req.body.prefix);

    const provider = getProvider();
    const result = await provider.expireApiKey(prefix);

    if (!result.success) {
      return res.status(result.status || 500).json({
        error: result.error,
      });
    }

    logger.info('API key expired', { prefix });

    res.json({
      success: true,
      message: 'API key expired successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
