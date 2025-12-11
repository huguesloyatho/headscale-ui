/**
 * Headscale API Client
 *
 * Handles all HTTP communication with Headscale API
 */

const axios = require('axios');
const config = require('../../config/env');
const logger = require('../../utils/logger');

class HeadscaleClient {
  constructor() {
    this.baseURL = config.HEADSCALE_URL;
    this.apiKey = config.HEADSCALE_API_KEY;

    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('API Request', {
          method: config.method?.toUpperCase(),
          url: config.url,
        });
        return config;
      },
      (error) => {
        logger.error('API Request Error', { error: error.message });
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('API Response', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error) => {
        logger.error('API Response Error', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generic GET request
   */
  async get(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return this._handleError(error);
    }
  }

  /**
   * Generic POST request
   */
  async post(endpoint, data = {}) {
    try {
      const response = await this.client.post(endpoint, data);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return this._handleError(error);
    }
  }

  /**
   * Generic PUT request
   */
  async put(endpoint, data = {}) {
    try {
      const response = await this.client.put(endpoint, data);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return this._handleError(error);
    }
  }

  /**
   * Generic DELETE request
   */
  async delete(endpoint) {
    try {
      const response = await this.client.delete(endpoint);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return this._handleError(error);
    }
  }

  /**
   * Test connection to Headscale
   */
  async testConnection() {
    try {
      const response = await this.client.get('/api/v1/user');
      return {
        success: true,
        message: 'Connection successful',
        data: {
          status: 'connected',
          userCount: Array.isArray(response.data) ? response.data.length : 0,
          responseTime: response.headers['x-response-time'] || 'N/A',
        },
      };
    } catch (error) {
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
   * Handle API errors
   */
  _handleError(error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'Unknown error';

    return {
      success: false,
      error: message,
      status,
      data: null,
    };
  }

  /**
   * Update configuration (useful for Settings page)
   */
  updateConfig(newUrl, newApiKey) {
    this.baseURL = newUrl;
    this.apiKey = newApiKey;
    this.client.defaults.baseURL = newUrl;
    this.client.defaults.headers['Authorization'] = `Bearer ${newApiKey}`;
    logger.info('Headscale client configuration updated');
  }
}

// Singleton instance
let instance = null;

function getClient() {
  if (!instance) {
    instance = new HeadscaleClient();
  }
  return instance;
}

module.exports = { getClient, HeadscaleClient };
