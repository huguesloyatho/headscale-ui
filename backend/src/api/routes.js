/**
 * Routes API
 */

const express = require('express');
const router = express.Router();
const { getProvider } = require('../services/headscale/factory');
const { validateRequired, isPositiveInteger } = require('../utils/validator');
const { arrayToString } = require('../utils/formatter');
const logger = require('../utils/logger');

/**
 * GET /api/routes
 * List all routes
 */
router.get('/', async (req, res, next) => {
  try {
    const provider = getProvider();
    const result = await provider.listRoutes();

    if (!result.success) {
      return res.status(result.status || 500).json({
        error: result.error,
      });
    }

    // Format routes data
    const routes = Array.isArray(result.data.routes) ? result.data.routes : [];
    const formatted = routes.map(route => ({
      id: route.id || '',
      hostname: route.node?.hostname || route.node?.name || '',
      approved: arrayToString(route.advertisedRoutes || []),
      available: arrayToString(route.enabledRoutes || []),
      serving_primary: arrayToString(route.primaryRoutes || []),
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
 * POST /api/routes/:routeId/enable
 * Enable/approve a route
 */
router.post('/:routeId/enable', async (req, res, next) => {
  try {
    const routeId = req.params.routeId;

    if (!isPositiveInteger(routeId)) {
      return res.status(400).json({
        error: 'Invalid route ID',
        message: 'Route ID must be a positive integer',
      });
    }

    const provider = getProvider();
    const result = await provider.enableRoute(routeId);

    if (!result.success) {
      return res.status(result.status || 500).json({
        error: result.error,
      });
    }

    logger.info('Route enabled', { routeId });

    res.json({
      success: true,
      message: 'Route enabled successfully',
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/routes/:routeId/disable
 * Disable a route
 */
router.post('/:routeId/disable', async (req, res, next) => {
  try {
    const routeId = req.params.routeId;

    if (!isPositiveInteger(routeId)) {
      return res.status(400).json({
        error: 'Invalid route ID',
        message: 'Route ID must be a positive integer',
      });
    }

    const provider = getProvider();
    const result = await provider.disableRoute(routeId);

    if (!result.success) {
      return res.status(result.status || 500).json({
        error: result.error,
      });
    }

    logger.info('Route disabled', { routeId });

    res.json({
      success: true,
      message: 'Route disabled successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
