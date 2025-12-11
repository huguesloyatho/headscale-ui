/**
 * Users API Routes
 */

const express = require('express');
const router = express.Router();
const { getProvider } = require('../services/headscale/factory');
const { validateRequired, sanitizeInput } = require('../utils/validator');
const logger = require('../utils/logger');

/**
 * GET /api/users
 * List all users
 */
router.get('/', async (req, res, next) => {
  try {
    const provider = getProvider();
    const result = await provider.listUsers();

    if (!result.success) {
      return res.status(result.status || 500).json({
        error: result.error,
      });
    }

    // Extract users array from result.data (Headscale returns {users: [...]})
    const users = Array.isArray(result.data.users) ? result.data.users : [];

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users
 * Create a new user
 */
router.post('/', async (req, res, next) => {
  try {
    // Validate input
    const validation = validateRequired(req.body, ['username']);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing: validation.missing,
      });
    }

    const username = sanitizeInput(req.body.username);

    const provider = getProvider();
    const result = await provider.createUser(username);

    if (!result.success) {
      return res.status(result.status || 500).json({
        error: result.error,
      });
    }

    logger.info('User created', { username });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/users/:username
 * Delete a user
 */
router.delete('/:username', async (req, res, next) => {
  try {
    const username = sanitizeInput(req.params.username);

    const provider = getProvider();
    const result = await provider.deleteUser(username);

    if (!result.success) {
      return res.status(result.status || 500).json({
        error: result.error,
      });
    }

    logger.info('User deleted', { username });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
