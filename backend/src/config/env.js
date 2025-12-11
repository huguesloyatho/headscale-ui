/**
 * Environment Configuration
 *
 * Validates and exports all environment variables.
 * Fails fast if required variables are missing.
 */

const dotenv = require('dotenv');
const path = require('path');

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '../../../.env') });

/**
 * Validates that a required environment variable is set
 */
function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${name}\nPlease check your .env file`);
  }
  return value;
}

/**
 * Gets an optional environment variable with a default value
 */
function getEnv(name, defaultValue) {
  return process.env[name] || defaultValue;
}

/**
 * Validates URL format
 */
function validateUrl(url, name) {
  try {
    new URL(url);
    return url;
  } catch (error) {
    throw new Error(`❌ Invalid URL for ${name}: ${url}`);
  }
}

// Required variables
const HEADSCALE_URL = validateUrl(requireEnv('HEADSCALE_URL'), 'HEADSCALE_URL');
const HEADSCALE_API_KEY = requireEnv('HEADSCALE_API_KEY');

// Optional variables with defaults
const config = {
  // Headscale
  HEADSCALE_URL,
  HEADSCALE_API_KEY,
  HEADSCALE_PROVIDER: getEnv('HEADSCALE_PROVIDER', 'api'),

  // Application
  APP_PORT: parseInt(getEnv('APP_PORT', '3000'), 10),
  NODE_ENV: getEnv('NODE_ENV', 'production'),
  LOG_LEVEL: getEnv('LOG_LEVEL', 'info'),

  // Security
  ENABLE_AUTH: getEnv('ENABLE_AUTH', 'false') === 'true',
  SESSION_SECRET: getEnv('SESSION_SECRET', 'change-me-in-production'),
  JWT_SECRET: getEnv('JWT_SECRET', 'change-me-in-production'),
  JWT_EXPIRY: getEnv('JWT_EXPIRY', '7d'),

  // 2FA
  TOTP_ENABLED: getEnv('TOTP_ENABLED', 'false') === 'true',
  TOTP_ISSUER: getEnv('TOTP_ISSUER', 'Headscale-UI'),

  // Rate limiting
  RATE_LIMIT_MAX: parseInt(getEnv('RATE_LIMIT_MAX', '100'), 10),
  RATE_LIMIT_WINDOW: parseInt(getEnv('RATE_LIMIT_WINDOW', '15'), 10),

  // Docker fallback
  DOCKER_FALLBACK_ENABLED: getEnv('DOCKER_FALLBACK_ENABLED', 'false') === 'true',
  DOCKER_CONTAINER_NAME: getEnv('DOCKER_CONTAINER_NAME', 'headscale'),
};

// Validation warnings
if (config.NODE_ENV === 'production') {
  if (config.SESSION_SECRET === 'change-me-in-production') {
    console.warn('⚠️  WARNING: Using default SESSION_SECRET in production!');
  }
  if (config.JWT_SECRET === 'change-me-in-production') {
    console.warn('⚠️  WARNING: Using default JWT_SECRET in production!');
  }
  if (!config.ENABLE_AUTH) {
    console.warn('⚠️  WARNING: Authentication is DISABLED! This app should be behind Authelia/VPN');
  }
}

module.exports = config;
