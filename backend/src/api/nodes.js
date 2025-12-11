/**
 * Nodes API Routes
 */

const express = require('express');
const router = express.Router();
const { getProvider } = require('../services/headscale/factory');
const { validateRequired, sanitizeInput, isPositiveInteger, isValidNodeKey } = require('../utils/validator');
const { formatTimestamp, boolLabel, arrayToString, extractUserName } = require('../utils/formatter');
const logger = require('../utils/logger');

/**
 * GET /api/nodes
 * List all nodes
 */
router.get('/', async (req, res, next) => {
  try {
    const provider = getProvider();
    const result = await provider.listNodes();

    if (!result.success) {
      return res.status(result.status || 500).json({
        error: result.error,
      });
    }

    // Format nodes data to match the expected table structure
    const nodes = Array.isArray(result.data.nodes) ? result.data.nodes : [];
    const formatted = nodes.map(node => ({
      id: node.id || '',
      hostname: node.hostname || node.name || '',
      name: node.givenName || node.name || '',
      machine_key: node.machineKey || '',
      node_key: node.nodeKey || '',
      user: extractUserName(node.user),
      ip_addresses: arrayToString(node.ipAddresses || node.addresses || []),
      ephemeral: boolLabel(node.ephemeral),
      last_seen: formatTimestamp(node.lastSeen || node.last_seen),
      expiration: formatTimestamp(node.expiry || node.expiration),
      connected: boolLabel(node.online || node.connected),
      expired: boolLabel(node.expired),
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
 * POST /api/nodes/register
 * Register a new node
 */
router.post('/register', async (req, res, next) => {
  try {
    // Validate input
    const validation = validateRequired(req.body, ['user', 'key']);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing: validation.missing,
      });
    }

    const user = sanitizeInput(req.body.user);
    const key = sanitizeInput(req.body.key);

    if (!isValidNodeKey(key)) {
      return res.status(400).json({
        error: 'Invalid node key format',
        message: 'Key must start with "nodekey:"',
      });
    }

    const provider = getProvider();
    const result = await provider.registerNode(user, key);

    if (!result.success) {
      return res.status(result.status || 500).json({
        error: result.error,
      });
    }

    logger.info('Node registered', { user });

    res.status(201).json({
      success: true,
      message: 'Node registered successfully',
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/nodes/:nodeId/rename
 * Rename a node
 */
router.post('/:nodeId/rename', async (req, res, next) => {
  try {
    const nodeId = req.params.nodeId;

    if (!isPositiveInteger(nodeId)) {
      return res.status(400).json({
        error: 'Invalid node ID',
        message: 'Node ID must be a positive integer',
      });
    }

    const validation = validateRequired(req.body, ['hostname']);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing: validation.missing,
      });
    }

    const hostname = sanitizeInput(req.body.hostname);

    const provider = getProvider();
    const result = await provider.renameNode(nodeId, hostname);

    if (!result.success) {
      return res.status(result.status || 500).json({
        error: result.error,
      });
    }

    logger.info('Node renamed', { nodeId, hostname });

    res.json({
      success: true,
      message: 'Node renamed successfully',
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/nodes/:nodeId
 * Delete a node
 */
router.delete('/:nodeId', async (req, res, next) => {
  try {
    const nodeId = req.params.nodeId;

    if (!isPositiveInteger(nodeId)) {
      return res.status(400).json({
        error: 'Invalid node ID',
        message: 'Node ID must be a positive integer',
      });
    }

    const provider = getProvider();
    const result = await provider.deleteNode(nodeId);

    if (!result.success) {
      return res.status(result.status || 500).json({
        error: result.error,
      });
    }

    logger.info('Node deleted', { nodeId });

    res.json({
      success: true,
      message: 'Node deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
