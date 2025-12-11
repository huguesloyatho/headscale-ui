/**
 * Provider Factory
 *
 * Returns the appropriate Headscale provider based on configuration
 */

const config = require('../../config/env');
const { PROVIDERS } = require('../../config/constants');
const ApiProvider = require('./providers/api.provider');
const DockerProvider = require('./providers/docker.provider');
const logger = require('../../utils/logger');

let providerInstance = null;

/**
 * Gets the configured Headscale provider
 */
function getProvider() {
  if (!providerInstance) {
    const providerType = config.HEADSCALE_PROVIDER;

    switch (providerType) {
      case PROVIDERS.DOCKER:
        logger.info('Using Docker provider');
        providerInstance = new DockerProvider();
        break;

      case PROVIDERS.API:
      default:
        logger.info('Using API provider');
        providerInstance = new ApiProvider();
        break;
    }
  }

  return providerInstance;
}

/**
 * Reset provider instance (useful for testing or config changes)
 */
function resetProvider() {
  providerInstance = null;
}

module.exports = {
  getProvider,
  resetProvider,
};
