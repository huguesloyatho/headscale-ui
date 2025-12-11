/**
 * Policy API Routes
 */

const express = require('express');
const router = express.Router();
const { getProvider } = require('../services/headscale/factory');
const logger = require('../utils/logger');

/**
 * GET /api/policy
 * Get current policy
 */
router.get('/', async (req, res, next) => {
  try {
    const provider = getProvider();
    const result = await provider.getPolicy();

    if (!result.success) {
      return res.status(result.status || 500).json({
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/policy
 * Set policy (NOT RECOMMENDED via UI)
 */
router.put('/', async (req, res, next) => {
  try {
    const policy = req.body.policy;

    if (!policy) {
      return res.status(400).json({
        error: 'Missing policy data',
        message: 'Policy is required in request body',
      });
    }

    const provider = getProvider();
    const result = await provider.setPolicy(policy);

    if (!result.success) {
      return res.status(result.status || 500).json({
        error: result.error,
      });
    }

    logger.warn('Policy updated via API', { user: 'admin' });

    res.json({
      success: true,
      message: 'Policy updated successfully',
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
