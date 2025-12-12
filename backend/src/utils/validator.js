/**
 * Input Validation Utilities
 */

/**
 * Validates that a string is not empty
 */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates that a value is a positive integer
 */
function isPositiveInteger(value) {
  const num = parseInt(value, 10);
  return !isNaN(num) && num > 0 && String(num) === String(value);
}

/**
 * Validates URL format
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates CIDR format (basic check)
 */
function isValidCidr(cidr) {
  const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
  return cidrRegex.test(cidr);
}

/**
 * Validates duration format (e.g., 48h, 7d, 90d, 1y, 6m)
 */
function isValidDuration(duration) {
  const durationRegex = /^\d+[smhdmy]$/;
  return durationRegex.test(duration);
}

/**
 * Validates node key format
 */
function isValidNodeKey(key) {
  return typeof key === 'string' && key.startsWith('nodekey:');
}

/**
 * Sanitizes user input (prevents XSS)
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Validates request body has required fields
 */
function validateRequired(body, fields) {
  const missing = [];
  fields.forEach(field => {
    if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
      missing.push(field);
    }
  });
  return {
    valid: missing.length === 0,
    missing,
  };
}

module.exports = {
  isNonEmptyString,
  isPositiveInteger,
  isValidUrl,
  isValidCidr,
  isValidDuration,
  isValidNodeKey,
  sanitizeInput,
  validateRequired,
};
