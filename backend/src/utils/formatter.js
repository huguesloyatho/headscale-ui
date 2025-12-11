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
  boolLabel,
  maskApiKey,
  arrayToString,
  extractUserName,
};
