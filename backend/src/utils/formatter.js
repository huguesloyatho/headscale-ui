/**
 * Data Formatting Utilities
 */

/**
 * Formats a Headscale timestamp (object {seconds, nanos} or ISO string) to readable format
 */
function formatTimestamp(value) {
  if (!value) return '';

  try {
    // Handle {seconds, nanos} format
    if (typeof value === 'object' && value.seconds) {
      const date = new Date(parseInt(value.seconds) * 1000);
      return date.toISOString().replace('T', ' ').substring(0, 19);
    }

    // Handle ISO string
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().replace('T', ' ').substring(0, 19);
      }
      return value;
    }

    return '';
  } catch (error) {
    return String(value);
  }
}

/**
 * Converts duration string (e.g., "48h", "7d", "90d") to ISO 8601 timestamp
 */
function durationToTimestamp(duration) {
  if (!duration) return null;

  const match = duration.match(/^(\d+)([hdmy])$/);
  if (!match) {
    throw new Error('Invalid duration format. Use format like: 48h, 7d, 90d, 1y');
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  const now = new Date();
  let expiration;

  switch (unit) {
    case 'h':
      expiration = new Date(now.getTime() + value * 60 * 60 * 1000);
      break;
    case 'd':
      expiration = new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      break;
    case 'm':
      expiration = new Date(now);
      expiration.setMonth(expiration.getMonth() + value);
      break;
    case 'y':
      expiration = new Date(now);
      expiration.setFullYear(expiration.getFullYear() + value);
      break;
    default:
      throw new Error('Invalid duration unit');
  }

  return expiration.toISOString();
}

/**
 * Converts boolean or int to "yes"/"no" label
 */
function boolLabel(value) {
  if (typeof value === 'boolean') {
    return value ? 'yes' : 'no';
  }
  if (typeof value === 'number') {
    return value > 0 ? 'yes' : 'no';
  }
  if (typeof value === 'string') {
    const v = value.toLowerCase();
    if (['true', 'yes', '1', 'online'].includes(v)) return 'yes';
    if (['false', 'no', '0', 'offline'].includes(v)) return 'no';
  }
  return String(value);
}

/**
 * Masks an API key for display (shows only first 8 chars)
 */
function maskApiKey(apiKey) {
  if (!apiKey || apiKey.length < 8) return '***';
  return apiKey.substring(0, 8) + '...' + '*'.repeat(16);
}

/**
 * Formats an array to comma-separated string
 */
function arrayToString(arr) {
  if (!Array.isArray(arr)) return '';
  return arr.join(', ');
}

/**
 * Extracts user name from user object or string
 */
function extractUserName(user) {
  if (!user) return '';
  if (typeof user === 'string') return user;
  if (typeof user === 'object') {
    return user.name || user.id || '';
  }
  return '';
}

module.exports = {
  formatTimestamp,
  durationToTimestamp,
  boolLabel,
  maskApiKey,
  arrayToString,
  extractUserName,
};
