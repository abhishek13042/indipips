const helmet = require('helmet')
const mongoSanitize = require(
  'express-mongo-sanitize'
)

// ─────────────────────────────────────
// SECURITY HEADERS
// ─────────────────────────────────────
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        'https://checkout.razorpay.com',
        'https://s3.tradingview.com',
        'https://cdnjs.cloudflare.com',
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
      ],
      fontSrc: [
        "'self'",
        'https://fonts.gstatic.com',
      ],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: [
        "'self'",
        'wss:',
        'ws:',
        'https://api.indipips.com',
        'https://api.razorpay.com',
        'https://api.upstox.com',
      ],
      frameSrc: [
        'https://api.razorpay.com',
        'https://s3.tradingview.com',
      ],
    },
  },
  
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
  // Remove X-Powered-By: Express header
})

// ─────────────────────────────────────
// INPUT SANITIZATION
// Prevent NoSQL injection
// ─────────────────────────────────────
const sanitizeInput = (req, res, next) => next()

// ─────────────────────────────────────
// SUSPICIOUS ACTIVITY DETECTION
// Log and potentially block
// suspicious patterns
// ─────────────────────────────────────
const suspicionTracker = new Map()
// Track suspicious IPs in memory

const detectSuspiciousActivity = (
  req, res, next
) => {
  const ip = req.ip
  const path = req.path
  const userAgent = req.headers[
    'user-agent'
  ] || ''

  // Check for suspicious patterns
  const suspicious = []

  // 1. No user agent (likely a bot)
  if (!userAgent) {
    suspicious.push('No user agent')
  }

  // 2. Common attack paths
  const attackPaths = [
    '/admin', '/.env', '/config',
    '/wp-admin', '/phpmyadmin',
    '/../', '/etc/passwd',
  ]
  if (attackPaths.some(p => 
    path.includes(p) && 
    !path.startsWith('/api/v1/admin'))) {
    suspicious.push('Attack path: ' + path)
  }

  // 3. SQL injection attempts in body
  const body = JSON.stringify(req.body || {})
  const sqlPatterns = [
    /union\s+select/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /delete\s+from/i,
    /exec\s*\(/i,
    /xp_cmdshell/i,
  ]
  if (sqlPatterns.some(p => p.test(body))) {
    suspicious.push('SQL injection attempt')
  }

  if (suspicious.length > 0) {
    console.warn('🚨 Suspicious request:', {
      ip,
      path,
      userAgent: userAgent.substring(0, 50),
      reasons: suspicious,
      timestamp: new Date().toISOString(),
    })

    // Track this IP
    const count = (
      suspicionTracker.get(ip) || 0
    ) + 1
    suspicionTracker.set(ip, count)

    // Block if too many suspicious requests
    if (count > 10) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      })
    }
  }

  next()
}

// Clean suspicion tracker every hour
setInterval(() => {
  suspicionTracker.clear()
}, 60 * 60 * 1000)

// ─────────────────────────────────────
// REQUEST SIZE LIMITS
// Prevent large payload attacks
// ─────────────────────────────────────
const requestSizeLimits = {
  // JSON body: max 1MB
  json: { limit: '1mb' },
  // URL encoded: max 1MB
  urlencoded: { extended: true, limit: '1mb' },
}

module.exports = {
  securityHeaders,
  sanitizeInput,
  detectSuspiciousActivity,
  requestSizeLimits,
}
