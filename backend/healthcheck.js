/**
 * Docker Healthcheck Script
 *
 * Simple script to check if the server is healthy
 */

const http = require('http');

const options = {
  host: 'localhost',
  port: process.env.APP_PORT || 3000,
  path: '/api/health',
  timeout: 2000,
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', () => {
  process.exit(1);
});

request.end();
