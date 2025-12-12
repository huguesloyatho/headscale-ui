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

    // Format routes data from nodes
    const nodes = Array.isArray(result.data.nodes) ? result.data.nodes : [];
    const formatted = nodes.map(node => ({
      id: node.id || '',
      hostname: node.givenName || node.name || '',
      approved: arrayToString(node.approvedRoutes || []),
      available: arrayToString(node.availableRoutes || []),
      serving_primary: arrayToString(node.subnetRoutes || []),
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
 * POST /api/routes/:nodeId/enable
 * Enable/approve routes for a node
 */
router.post('/:nodeId/enable', async (req, res, next) => {
  try {
    const nodeId = req.params.nodeId;
    const routes = req.body.routes || [];

    if (!isPositiveInteger(nodeId)) {
      return res.status(400).json({
        error: 'Invalid node ID',
        message: 'Node ID must be a positive integer',
      });
    }

    // Parse routes string if needed (can be comma-separated)
    let routesArray = [];
    if (typeof routes === 'string') {
      // Remove quotes if present
      const cleanRoutes = routes.replace(/["']/g, '').trim();
      if (cleanRoutes) {
        routesArray = cleanRoutes.split(',').map(r => r.trim()).filter(r => r);
      }
    } else if (Array.isArray(routes)) {
      routesArray = routes;
    }

    const provider = getProvider();
    const result = await provider.enableRoute(nodeId, routesArray);

    if (!result.success) {
      return res.status(result.status || 500).json({
        error: result.error,
      });
    }

    logger.info('Routes approved for node', { nodeId, routes: routesArray });

    res.json({
      success: true,
      message: routesArray.length > 0 ? 'Routes approved successfully' : 'Routes cleared successfully',
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
