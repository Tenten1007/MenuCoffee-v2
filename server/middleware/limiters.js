const { createRateLimiter } = require('./security');

const apiLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  'Too many requests from this IP, please try again later.'
);

const loginLimiter = createRateLimiter(
  parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  parseInt(process.env.LOGIN_RATE_LIMIT_MAX_REQUESTS) || 5,
  'Too many login attempts, please try again later.'
);

module.exports = {
  apiLimiter,
  loginLimiter,
}; 