/**
 * API Provider for Headscale
 *
 * Implements all operations using Headscale REST API
 */

const { getClient } = require('../client');
const logger = require('../../../utils/logger');
const { durationToTimestamp } = require('../../../utils/formatter');

class ApiProvider {
  constructor() {
    this.client = getClient();
    this.name = 'API';
  }

  // ==================== USERS ====================

  async listUsers() {
    logger.debug('Fetching users via API');
    return await this.client.get('/api/v1/user');
  }

  async createUser(username) {
    logger.info('Creating user via API', { username });
    return await this.client.post('/api/v1/user', { name: username });
  }

  async deleteUser(username) {
    logger.info('Deleting user via API', { username });
    return await this.client.delete(`/api/v1/user/${username}`);
  }

  // ==================== NODES ====================

  async listNodes() {
    logger.debug('Fetching nodes via API');
    return await this.client.get('/api/v1/node');
  }

  async registerNode(user, key) {
    logger.info('Registering node via API', { user });
    return await this.client.post('/api/v1/node/register', {
      user,
      key,
    });
  }

  async renameNode(nodeId, newName) {
    logger.info('Renaming node via API', { nodeId, newName });
    return await this.client.post(`/api/v1/node/${nodeId}/rename/${newName}`);
  }

  async deleteNode(nodeId) {
    logger.info('Deleting node via API', { nodeId });
    return await this.client.delete(`/api/v1/node/${nodeId}`);
  }

  // ==================== API KEYS ====================

  async listApiKeys() {
    logger.debug('Fetching API keys via API');
    return await this.client.get('/api/v1/apikey');
  }

  async createApiKey(expiration) {
    logger.info('Creating API key via API', { expiration });

    // Convert duration (e.g., "48h", "90d") to ISO 8601 timestamp
    let data = {};
    if (expiration) {
      try {
        const timestamp = durationToTimestamp(expiration);
        data = { expiration: timestamp };
        logger.debug('Converted duration to timestamp', { duration: expiration, timestamp });
      } catch (error) {
        return {
          success: false,
          error: error.message,
          status: 400,
        };
      }
    }

    return await this.client.post('/api/v1/apikey', data);
  }

  async expireApiKey(prefix) {
    logger.info('Expiring API key via API', { prefix });
    return await this.client.post('/api/v1/apikey/expire', { prefix });
  }

  // ==================== PREAUTH KEYS ====================

  async listPreauthKeys(user) {
    logger.debug('Fetching preauth keys via API', { user });
    return await this.client.get('/api/v1/preauthkey', { user });
  }

  async createPreauthKey(user, options = {}) {
    logger.info('Creating preauth key via API', { user, options });
    const data = {
      user,
      reusable: options.reusable || false,
      ephemeral: options.ephemeral || false,
    };

    // Convert duration to ISO timestamp if expiration is provided
    if (options.expiration) {
      try {
        const { durationToTimestamp } = require('../../../utils/formatter');
        const timestamp = durationToTimestamp(options.expiration);
        data.expiration = timestamp;
        logger.debug('Converted duration to timestamp', { duration: options.expiration, timestamp });
      } catch (error) {
        return { success: false, error: error.message, status: 400 };
      }
    }

    return await this.client.post('/api/v1/preauthkey', data);
  }

  async expirePreauthKey(user, key) {
    logger.info('Expiring preauth key via API', { user, key });
    return await this.client.post('/api/v1/preauthkey/expire', { user, key });
  }

  // ==================== ROUTES ====================

  async listRoutes() {
    logger.debug('Fetching routes via API (from nodes)');
    // Routes are part of nodes, so we fetch nodes and extract route info
    return await this.client.get('/api/v1/node');
  }

  async enableRoute(nodeId, routes) {
    logger.info('Enabling routes via API', { nodeId, routes });
    // In Headscale API v1, routes are managed via node endpoints
    return await this.client.post(`/api/v1/node/${nodeId}/approve_routes`, {
      routes: routes || []
    });
  }

  async disableRoute(nodeId) {
    logger.info('Disabling routes via API', { nodeId });
    // Disable by sending empty routes array
    return await this.client.post(`/api/v1/node/${nodeId}/approve_routes`, {
      routes: []
    });
  }

  // ==================== POLICY ====================

  async getPolicy() {
    logger.debug('Fetching policy via API');
    return await this.client.get('/api/v1/policy');
  }

  async setPolicy(policy) {
    logger.info('Setting policy via API');
    return await this.client.put('/api/v1/policy', { policy });
  }
}

module.exports = ApiProvider;
