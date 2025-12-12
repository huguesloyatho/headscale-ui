/**
 * Settings Service
 *
 * Manages application settings and Headscale connection configuration
 */

const { getStorage } = require('../../storage');
const { getClient } = require('../headscale/client');
const logger = require('../../utils/logger');
const { isValidUrl } = require('../../utils/validator');

class SettingsService {
  /**
   * Get current settings (without API key)
   */
  async getSettings() {
    const storage = getStorage();
    const settings = await storage.getSettings();

    // Add API key prefix (first 7 chars) to help identify the current key
    if (settings.apiKey) {
      settings.apiKeyPrefix = settings.apiKey.split('.')[0];
    }

    // Remove full API key for security
    delete settings.apiKey;

    return settings;
  }

  /**
   * Test connection to Headscale with given credentials
   */
  async testConnection(url, apiKey) {
    if (!isValidUrl(url)) {
      return {
        success: false,
        message: 'Invalid URL format',
      };
    }

    if (!apiKey || apiKey.trim() === '') {
      return {
        success: false,
        message: 'API key is required',
      };
    }

    try {
      // Create temporary client with new credentials
      const axios = require('axios');
      const testClient = axios.create({
        baseURL: url,
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const startTime = Date.now();
      const response = await testClient.get('/api/v1/user');
      const responseTime = Date.now() - startTime;

      logger.info('Connection test successful', { url, responseTime });

      return {
        success: true,
        message: 'Connection successful',
        data: {
          status: 'connected',
          userCount: Array.isArray(response.data.users)
            ? response.data.users.length
            : (response.data.user ? 1 : 0),
          responseTime: `${responseTime}ms`,
        },
      };
    } catch (error) {
      logger.error('Connection test failed', {
        url,
        error: error.message
      });

      return {
        success: false,
        message: 'Connection failed',
        error: error.response?.data?.message || error.message,
        data: {
          status: 'disconnected',
          responseTime: 'N/A',
        },
      };
    }
  }

  /**
   * Update settings and save to storage
   */
  async updateSettings(url, apiKey) {
    // Validate inputs
    if (!isValidUrl(url)) {
      throw new Error('Invalid URL format');
    }

    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API key is required');
    }

    // Test connection first
    const testResult = await this.testConnection(url, apiKey);
    if (!testResult.success) {
      throw new Error(`Connection test failed: ${testResult.error || testResult.message}`);
    }

    // Save to storage
    const storage = getStorage();
    await storage.updateSettings(url, apiKey);

    // Update the Headscale client configuration
    const client = getClient();
    client.updateConfig(url, apiKey);

    logger.info('Settings updated successfully', { url });

    return {
      success: true,
      message: 'Settings updated and connection successful',
    };
  }
}

module.exports = new SettingsService();
