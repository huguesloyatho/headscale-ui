/**
 * Preauth Keys Routes
 */

const express = require('express');
const router = express.Router();
const { getProvider } = require('../services/headscale/factory');
const { validateRequired, sanitizeInput, isValidDuration } = require('../utils/validator');
const { formatTimestamp, boolLabel, extractUserName } = require('../utils/formatter');
const logger = require('../utils/logger');

/**
 * GET /api/preauth
 * List preauth keys for a user
 * Query params: user (required)
 */
router.get('/', async (req, res, next) => {
  try {
    const user = req.query.user;

    if (!user) {
      return res.status(400).json({
        error: 'Missing required parameter',
        message: 'User parameter is required',
      });
    }

    const provider = getProvider();
    const result = await provider.listPreauthKeys(user);

    if (!result.success) {
      return res.status(result.status || 500).json({
        error: result.error,
      });
    }

    // Format preauth keys data
    const keys = Array.isArray(result.data.preAuthKeys) ? result.data.preAuthKeys : [];
    const formatted = keys.map(key => ({
      id: key.id || '',
      user: extractUserName(key.user),
      key: key.key || '',
      reusable: boolLabel(key.reusable),
      ephemeral: boolLabel(key.ephemeral),
      used: boolLabel(key.used),
      expiration: formatTimestamp(key.expiration),
      created: formatTimestamp(key.createdAt || key.created),
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/preauth
 * Create a new preauth key
 */
router.post('/', async (req, res, next) => {
  try {
    const validation = validateRequired(req.body, ['user']);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing: validation.missing,
      });
    }

    const user = sanitizeInput(req.body.user);
    const expiration = req.body.expiration ? sanitizeInput(req.body.expiration) : '48h';
    const reusable = req.body.reusable === true || req.body.reusable === 'true';
    const ephemeral = req.body.ephemeral === true || req.body.ephemeral === 'true';

    // Validate expiration format
    if (expiration && !isValidDuration(expiration)) {
      return res.status(400).json({
        error: 'Invalid expiration format',
        message: 'Expiration must be in format like 48h, 7d, 90d',
      });
    }

    const options = {
      expiration,
      reusable,
      ephemeral,
    };

    const provider = getProvider();
    const result = await provider.createPreauthKey(user, options);

    if (!result.success) {
      return res.status(result.status || 500).json({
        error: result.error,
      });
    }

    logger.info('Preauth key created', { user, reusable, ephemeral });

    res.status(201).json({
      success: true,
      message: 'Preauth key created successfully',
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/preauth/expire
 * Expire a preauth key
 */
router.post('/expire', async (req, res, next) => {
  try {
    const validation = validateRequired(req.body, ['user', 'key']);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing: validation.missing,
      });
    }

    const user = sanitizeInput(req.body.user);
    const key = sanitizeInput(req.body.key);

    const provider = getProvider();
    const result = await provider.expirePreauthKey(user, key);

    if (!result.success) {
      return res.status(result.status || 500).json({
        error: result.error,
      });
    }

    logger.info('Preauth key expired', { user, key });

    res.json({
      success: true,
      message: 'Preauth key expired successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
