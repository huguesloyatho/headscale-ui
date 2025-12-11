/**
 * Headscale UI Backend
 *
 * Main entry point for the Express server
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

// Load configuration
const config = require('./config/env');
const logger = require('./utils/logger');
const { getStorage } = require('./storage');

// Middleware
const { generalLimiter } = require('./middleware/rateLimiter');
const { authMiddleware } = require('./middleware/auth');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// API Routes
const apiRouter = require('./api');

// Create Express app
const app = express();

// Trust proxy (needed for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
    },
  },
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Rate limiting (general)
app.use('/api', generalLimiter);

// Logging middleware
app.use((req, res, next) => {
  logger.debug('Request received', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Authentication middleware (bypassed if ENABLE_AUTH is false)
app.use('/api', authMiddleware);

// API routes
app.use('/api', apiRouter);

// Serve static files (frontend) in production
if (config.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../public');
  app.use(express.static(frontendPath));

  // SPA fallback - send index.html for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
      notFoundHandler(req, res);
    }
  });
}

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Initialize storage and start server
async function start() {
  try {
    // Initialize storage
    logger.info('Initializing storage...');
    const storage = getStorage();
    await storage.init();

    // Start server
    const PORT = config.APP_PORT;
    app.listen(PORT, () => {
      logger.info('Server started', {
        port: PORT,
        env: config.NODE_ENV,
        headscaleUrl: config.HEADSCALE_URL,
        authEnabled: config.ENABLE_AUTH,
      });

      if (!config.ENABLE_AUTH && config.NODE_ENV === 'production') {
        logger.warn('⚠️  WARNING: Authentication is DISABLED in production!');
        logger.warn('⚠️  This application should be protected by Authelia, VPN, or similar');
      }
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
start();
