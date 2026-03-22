const rateLimit = require('express-rate-limit')
const RedisStore = require(
  'rate-limit-redis'
).default
const { redisClient, redisAvailable } = 
  require('../utils/cache.service')

// ─────────────────────────────────────
// HELPER: Create rate limiter with
// Redis store + memory fallback
// ─────────────────────────────────────
const createLimiter = ({
  windowMs,
  max,
  message,
  keyPrefix,
}) => {
  const config = {
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
      code: 'RATE_LIMITED',
      retryAfter: Math.ceil(windowMs / 1000),
    },
    handler: (req, res, next, options) => {
      console.warn('⚠️ Rate limit hit:', {
        ip: req.ip,
        path: req.path,
        userId: req.user?.id || 'anonymous',
        limit: max,
        window: windowMs / 1000 + 's',
      })
      res.status(429).json(options.message)
    },
    skip: (req) => {
      // Never rate limit health checks
      return req.path === '/api/v1/health'
    },
    keyGenerator: (req) => {
      // Rate limit by userId if logged in
      // Otherwise by IP
      const userId = req.user?.id
      return userId 
        ? keyPrefix + ':user:' + userId
        : keyPrefix + ':ip:' + req.ip
    },
  }

  // Use Redis store if available
  // More accurate across multiple servers
  if (redisAvailable()) {
    config.store = new RedisStore({
      client: redisClient,
      prefix: 'rl:' + keyPrefix + ':',
      sendCommand: (...args) => 
        redisClient.call(...args),
    })
  }
  // If Redis unavailable: uses memory store
  // Less accurate but still works

  return rateLimit(config)
}

// ─────────────────────────────────────
// RATE LIMITERS — Different per route
// ─────────────────────────────────────

// Global: 200 requests per minute per IP
// Catches general abuse
const globalLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 200,
  message: 'Too many requests. ' +
    'Maximum 200 requests per minute.',
  keyPrefix: 'global',
})

// Auth routes: 5 per minute
// Prevents brute force login attacks
const authLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many auth attempts. ' +
    'Maximum 5 per minute. ' +
    'Wait 60 seconds and try again.',
  keyPrefix: 'auth',
})

// OTP routes: 3 per hour
// Prevents OTP spam (costs money via SMS)
const otpLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many OTP requests. ' +
    'Maximum 3 per hour.',
  keyPrefix: 'otp',
})

// Trade routes: 10 per minute per trader
// Prevents order spam
const tradeLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many orders. ' +
    'Maximum 10 orders per minute. ' +
    'Please wait before placing more.',
  keyPrefix: 'trade',
})

// Payout routes: 3 per hour
// Prevents payout request spam
const payoutLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many payout requests. ' +
    'Maximum 3 per hour.',
  keyPrefix: 'payout',
})

// Admin routes: 100 per minute
// Admins need higher limits
const adminLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Admin rate limit exceeded.',
  keyPrefix: 'admin',
})

// KYC routes: 5 per hour
// Each KYC call costs money (Digio API)
const kycLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many KYC attempts. ' +
    'Maximum 5 per hour.',
  keyPrefix: 'kyc',
})

// Webhook routes: 1000 per minute
// Razorpay/Upstox send many webhooks
const webhookLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 1000,
  message: 'Webhook rate limit exceeded.',
  keyPrefix: 'webhook',
})

module.exports = {
  globalLimiter,
  authLimiter,
  otpLimiter,
  tradeLimiter,
  payoutLimiter,
  adminLimiter,
  kycLimiter,
  webhookLimiter,
}
