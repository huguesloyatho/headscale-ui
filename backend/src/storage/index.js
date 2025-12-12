/**
 * Storage Manager
 *
 * Handles persistent storage of settings and configuration
 */

const fs = require('fs').promises;
const path = require('path');
const CryptoJS = require('crypto-js');
const config = require('../config/env');
const logger = require('../utils/logger');

// Use /app/storage for data (mounted volume), not __dirname (code location)
const STORAGE_DIR = path.join(__dirname, '../../..', 'storage');
const SETTINGS_FILE = path.join(STORAGE_DIR, 'settings.json');

class Storage {
  constructor() {
    this.settings = null;
    this.initialized = false;
  }

  /**
   * Initialize storage (create directory and file if needed)
   */
  async init() {
    if (this.initialized) return;

    try {
      // Ensure storage directory exists
      await fs.mkdir(STORAGE_DIR, { recursive: true });

      // Try to load existing settings
      try {
        const data = await fs.readFile(SETTINGS_FILE, 'utf8');
        this.settings = JSON.parse(data);
        logger.info('Settings loaded from storage');
      } catch (error) {
        // File doesn't exist, create default
        this.settings = {
          headscaleUrl: config.HEADSCALE_URL,
          apiKeyEncrypted: this._encrypt(config.HEADSCALE_API_KEY),
          lastConnection: null,
          version: '1.0.0',
          // User preferences
          preferences: {
            language: 'fr', // fr, en, es, ja, zh
            theme: 'dark', // dark, light, green
            customLogo: null, // base64 image or null
          },
        };
        await this.save();
        logger.info('Default settings created');
      }

      this.initialized = true;
    } catch (error) {
      logger.error('Failed to initialize storage', { error: error.message });
      throw error;
    }
  }

  /**
   * Get current settings
   */
  async getSettings() {
    if (!this.initialized) await this.init();

    // Ensure preferences exist (for backwards compatibility)
    if (!this.settings.preferences) {
      this.settings.preferences = {
        language: 'fr',
        theme: 'dark',
        customLogo: null,
      };
      await this.save();
    }

    return {
      headscaleUrl: this.settings.headscaleUrl,
      lastConnection: this.settings.lastConnection,
      version: this.settings.version,
      preferences: this.settings.preferences,
    };
  }

  /**
   * Get decrypted API key
   */
  async getApiKey() {
    if (!this.initialized) await this.init();
    return this._decrypt(this.settings.apiKeyEncrypted);
  }

  /**
   * Update settings
   */
  async updateSettings(newUrl, newApiKey) {
    if (!this.initialized) await this.init();

    this.settings.headscaleUrl = newUrl;
    if (newApiKey) {
      this.settings.apiKeyEncrypted = this._encrypt(newApiKey);
    }
    this.settings.lastConnection = new Date().toISOString();

    await this.save();
    logger.info('Settings updated');
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences) {
    if (!this.initialized) await this.init();

    // Ensure preferences object exists
    if (!this.settings.preferences) {
      this.settings.preferences = {
        language: 'fr',
        theme: 'dark',
        customLogo: null,
      };
    }

    // Update only provided fields
    if (preferences.language !== undefined) {
      this.settings.preferences.language = preferences.language;
    }
    if (preferences.theme !== undefined) {
      this.settings.preferences.theme = preferences.theme;
    }
    if (preferences.customLogo !== undefined) {
      this.settings.preferences.customLogo = preferences.customLogo;
    }

    await this.save();
    logger.info('User preferences updated', { preferences: this.settings.preferences });
    return this.settings.preferences;
  }

  /**
   * Save settings to file
   */
  async save() {
    try {
      await fs.writeFile(
        SETTINGS_FILE,
        JSON.stringify(this.settings, null, 2),
        'utf8'
      );
    } catch (error) {
      logger.error('Failed to save settings', { error: error.message });
      throw error;
    }
  }

  /**
   * Encrypt API key
   */
  _encrypt(text) {
    return CryptoJS.AES.encrypt(text, config.SESSION_SECRET).toString();
  }

  /**
   * Decrypt API key
   */
  _decrypt(encrypted) {
    const bytes = CryptoJS.AES.decrypt(encrypted, config.SESSION_SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}

// Singleton instance
let instance = null;

function getStorage() {
  if (!instance) {
    instance = new Storage();
  }
  return instance;
}

module.exports = { getStorage };
