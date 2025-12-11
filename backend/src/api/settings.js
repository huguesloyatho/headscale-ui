/**
 * Settings API Routes
 */

const express = require('express');
const router = express.Router();
const settingsService = require('../services/settings/settings.service');
const { strictLimiter } = require('../middleware/rateLimiter');
const { validateRequired, isValidUrl } = require('../utils/validator');
const logger = require('../utils/logger');

/**
 * GET /api/settings
 * Get current settings (without API key)
 */
router.get('/', async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/settings/test-connection
 * Test connection to Headscale
 * Rate limited to 3 requests per minute
 */
router.post('/test-connection', strictLimiter, async (req, res, next) => {
  try {
    const validation = validateRequired(req.body, ['url', 'apiKey']);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing: validation.missing,
      });
    }

    const { url, apiKey } = req.body;

    if (!isValidUrl(url)) {
      return res.status(400).json({
        error: 'Invalid URL format',
        message: 'Please provide a valid HTTP/HTTPS URL',
      });
    }

    const result = await settingsService.testConnection(url, apiKey);

    logger.info('Connection test performed', {
      url,
      success: result.success,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/settings
 * Update settings
 * Rate limited to 3 requests per minute
 */
router.post('/', strictLimiter, async (req, res, next) => {
  try {
    const validation = validateRequired(req.body, ['url', 'apiKey']);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing: validation.missing,
      });
    }

    const { url, apiKey } = req.body;

    if (!isValidUrl(url)) {
      return res.status(400).json({
        error: 'Invalid URL format',
        message: 'Please provide a valid HTTP/HTTPS URL',
      });
    }

    const result = await settingsService.updateSettings(url, apiKey);

    logger.info('Settings updated', { url });

    res.json(result);
  } catch (error) {
    // Send error as JSON
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
