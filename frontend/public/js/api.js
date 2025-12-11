/**
 * API Client
 *
 * Handles all communication with the backend API
 */

import { config } from './config.js';

class ApiClient {
  constructor() {
    this.baseURL = config.API_BASE_URL + '/api';
  }

  /**
   * Generic fetch wrapper
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, finalOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      // Return the backend response directly (already has success/data structure)
      return data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ==================== USERS ====================

  async getUsers() {
    return await this.request('/users');
  }

  async createUser(username) {
    return await this.request('/users', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  async deleteUser(username) {
    return await this.request(`/users/${username}`, {
      method: 'DELETE',
    });
  }

  // ==================== NODES ====================

  async getNodes() {
    return await this.request('/nodes');
  }

  async registerNode(user, key) {
    return await this.request('/nodes/register', {
      method: 'POST',
      body: JSON.stringify({ user, key }),
    });
  }

  async renameNode(nodeId, hostname) {
    return await this.request(`/nodes/${nodeId}/rename`, {
      method: 'POST',
      body: JSON.stringify({ hostname }),
    });
  }

  async deleteNode(nodeId) {
    return await this.request(`/nodes/${nodeId}`, {
      method: 'DELETE',
    });
  }

  // ==================== API KEYS ====================

  async getApiKeys() {
    return await this.request('/apikeys');
  }

  async createApiKey(expiration) {
    return await this.request('/apikeys', {
      method: 'POST',
      body: JSON.stringify({ expiration }),
    });
  }

  async expireApiKey(prefix) {
    return await this.request('/apikeys/expire', {
      method: 'POST',
      body: JSON.stringify({ prefix }),
    });
  }

  // ==================== PREAUTH KEYS ====================

  async getPreauthKeys(user) {
    return await this.request(`/preauth?user=${encodeURIComponent(user)}`);
  }

  async createPreauthKey(user, expiration, reusable, ephemeral) {
    return await this.request('/preauth', {
      method: 'POST',
      body: JSON.stringify({ user, expiration, reusable, ephemeral }),
    });
  }

  async expirePreauthKey(user, key) {
    return await this.request('/preauth/expire', {
      method: 'POST',
      body: JSON.stringify({ user, key }),
    });
  }

  // ==================== ROUTES ====================

  async getRoutes() {
    return await this.request('/routes');
  }

  async enableRoute(routeId) {
    return await this.request(`/routes/${routeId}/enable`, {
      method: 'POST',
    });
  }

  async disableRoute(routeId) {
    return await this.request(`/routes/${routeId}/disable`, {
      method: 'POST',
    });
  }

  // ==================== POLICY ====================

  async getPolicy() {
    return await this.request('/policy');
  }

  async setPolicy(policy) {
    return await this.request('/policy', {
      method: 'PUT',
      body: JSON.stringify({ policy }),
    });
  }

  // ==================== SETTINGS ====================

  async getSettings() {
    return await this.request('/settings');
  }

  async testConnection(url, apiKey) {
    return await this.request('/settings/test-connection', {
      method: 'POST',
      body: JSON.stringify({ url, apiKey }),
    });
  }

  async updateSettings(url, apiKey) {
    return await this.request('/settings', {
      method: 'POST',
      body: JSON.stringify({ url, apiKey }),
    });
  }

  // ==================== INFO / HEALTH ====================

  async getHealth() {
    return await this.request('/health');
  }
}

// Singleton instance
export const api = new ApiClient();
