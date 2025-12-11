/**
 * Application Constants
 */

module.exports = {
  // API versions
  API_VERSION: 'v1',
  APP_VERSION: '1.0.0',

  // Headscale API paths
  HEADSCALE_API: {
    USERS: '/api/v1/user',
    NODES: '/api/v1/node',
    APIKEYS: '/api/v1/apikey',
    PREAUTHKEYS: '/api/v1/preauthkey',
    ROUTES: '/api/v1/routes',
    POLICY: '/api/v1/policy',
  },

  // HTTP status codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },

  // Storage paths
  STORAGE: {
    SETTINGS: 'backend/src/storage/settings.json',
  },

  // Timestamps format
  TIMESTAMP_FORMAT: 'YYYY-MM-DD HH:mm:ss',

  // Provider types
  PROVIDERS: {
    API: 'api',
    DOCKER: 'docker',
  },
};
