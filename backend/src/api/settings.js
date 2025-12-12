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

/**
 * PUT /api/settings/preferences
 * Update user preferences (language, theme, logo)
 */
router.put('/preferences', async (req, res, next) => {
  try {
    const { language, theme, customLogo } = req.body;

    // Validate language
    if (language && !['fr', 'en', 'es', 'ja', 'zh'].includes(language)) {
      return res.status(400).json({
        error: 'Invalid language',
        message: 'Supported languages: fr, en, es, ja, zh',
      });
    }

    // Validate theme
    if (theme && !['dark', 'light', 'green'].includes(theme)) {
      return res.status(400).json({
        error: 'Invalid theme',
        message: 'Supported themes: dark, light, green',
      });
    }

    // Validate logo (must be base64 image or null)
    if (customLogo !== undefined && customLogo !== null) {
      if (typeof customLogo !== 'string' || !customLogo.startsWith('data:image/')) {
        return res.status(400).json({
          error: 'Invalid logo format',
          message: 'Logo must be a base64 encoded image (data:image/...)',
        });
      }

      // Check size (max 1MB)
      const sizeInBytes = (customLogo.length * 3) / 4;
      if (sizeInBytes > 1024 * 1024) {
        return res.status(400).json({
          error: 'Logo too large',
          message: 'Maximum logo size is 1MB',
        });
      }
    }

    const result = await settingsService.updatePreferences({
      language,
      theme,
      customLogo,
    });

    logger.info('User preferences updated', { language, theme, hasLogo: !!customLogo });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
