/**
 * API Router
 *
 * Combines all API routes
 */

const express = require('express');
const router = express.Router();

// Import all route modules
const usersRouter = require('./users');
const nodesRouter = require('./nodes');
const apikeysRouter = require('./apikeys');
const preauthRouter = require('./preauth');
const routesRouter = require('./routes');
const policyRouter = require('./policy');
const settingsRouter = require('./settings');
const healthRouter = require('./health');
const debugRouter = require('./debug');

// Mount routes
router.use('/users', usersRouter);
router.use('/nodes', nodesRouter);
router.use('/apikeys', apikeysRouter);
router.use('/preauth', preauthRouter);
router.use('/routes', routesRouter);
router.use('/policy', policyRouter);
router.use('/settings', settingsRouter);
router.use('/health', healthRouter);
router.use('/debug', debugRouter);

// API root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Headscale UI API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      nodes: '/api/nodes',
      apikeys: '/api/apikeys',
      preauth: '/api/preauth',
      routes: '/api/routes',
      policy: '/api/policy',
      settings: '/api/settings',
      health: '/api/health',
      debug: '/api/debug (dev only)',
    },
  });
});

module.exports = router;
