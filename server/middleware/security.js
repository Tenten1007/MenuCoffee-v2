const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const sanitizeHtml = require('sanitize-html');

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Slow down configuration (updated for v2)
const createSlowDown = (windowMs, delayAfter, delayMs) => {
  return slowDown({
    windowMs,
    delayAfter,
    delayMs: () => delayMs, // Fixed for v2
    maxDelayMs: 20000
  });
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key], {
          allowedTags: [],
          allowedAttributes: {}
        });
      }
    });
  }
  
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeHtml(req.query[key], {
          allowedTags: [],
          allowedAttributes: {}
        });
      }
    });
  }
  
  next();
};

// Security headers configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// File upload validation
const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      error: 'File type not allowed. Only images are permitted.'
    });
  }

  if (req.file.size > maxSize) {
    return res.status(400).json({
      error: `File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`
    });
  }

  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      error: 'Internal server error'
    });
  }

  res.status(500).json({
    error: err.message,
    stack: err.stack
  });
};

// Not found handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
};

module.exports = {
  createRateLimiter,
  createSlowDown,
  sanitizeInput,
  securityHeaders,
  validateFileUpload,
  errorHandler,
  notFoundHandler
}; 