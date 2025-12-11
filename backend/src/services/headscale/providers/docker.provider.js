/**
 * Docker Provider for Headscale (FALLBACK)
 *
 * NOT YET IMPLEMENTED
 * This is a skeleton for future implementation if Docker fallback is needed.
 *
 * See docs/DOCKER_FALLBACK.md for rationale and implementation guide.
 */

const logger = require('../../../utils/logger');

class DockerProvider {
  constructor() {
    this.name = 'Docker';
    logger.warn('Docker provider is not yet implemented');
  }

  // Stub methods - to be implemented if needed

  async listUsers() {
    throw new Error('Docker provider not implemented. Please use API provider.');
  }

  async createUser(username) {
    throw new Error('Docker provider not implemented. Please use API provider.');
  }

  async deleteUser(username) {
    throw new Error('Docker provider not implemented. Please use API provider.');
  }

  async listNodes() {
    throw new Error('Docker provider not implemented. Please use API provider.');
  }

  async registerNode(user, key) {
    throw new Error('Docker provider not implemented. Please use API provider.');
  }

  async renameNode(nodeId, newName) {
    throw new Error('Docker provider not implemented. Please use API provider.');
  }

  async deleteNode(nodeId) {
    throw new Error('Docker provider not implemented. Please use API provider.');
  }

  async listApiKeys() {
    throw new Error('Docker provider not implemented. Please use API provider.');
  }

  async createApiKey(expiration) {
    throw new Error('Docker provider not implemented. Please use API provider.');
  }

  async expireApiKey(prefix) {
    throw new Error('Docker provider not implemented. Please use API provider.');
  }

  async listPreauthKeys(user) {
    throw new Error('Docker provider not implemented. Please use API provider.');
  }

  async createPreauthKey(user, options) {
    throw new Error('Docker provider not implemented. Please use API provider.');
  }

  async expirePreauthKey(user, key) {
    throw new Error('Docker provider not implemented. Please use API provider.');
  }

  async listRoutes() {
    throw new Error('Docker provider not implemented. Please use API provider.');
  }

  async enableRoute(routeId) {
    throw new Error('Docker provider not implemented. Please use API provider.');
  }

  async disableRoute(routeId) {
    throw new Error('Docker provider not implemented. Please use API provider.');
  }

  async getPolicy() {
    throw new Error('Docker provider not implemented. Please use API provider.');
  }

  async setPolicy(policy) {
    throw new Error('Docker provider not implemented. Please use API provider.');
  }
}

module.exports = DockerProvider;
