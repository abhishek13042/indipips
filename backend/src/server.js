require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('./config/passport'); // Initialize passport strategy
const http = require('http');
const socketIO = require('./utils/socket');

const authRoutes = require('./routes/auth.routes');
const planRoutes = require('./routes/plans.routes');
const userRoutes = require('./routes/user.routes');
const challengeRoutes = require('./routes/challenge.routes');
const paymentRoutes = require('./routes/payment.routes');
const tradeRoutes = require('./routes/trade.routes');
const kycRoutes = require('./routes/kyc.routes');
const adminRoutes = require('./routes/admin.routes');
const payoutRoutes = require('./routes/payout.routes');
const upstoxRoutes = require('./routes/upstox.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const { initBreachScanner } = require('./workers/breachScanner');
const { initSnapshotWorker } = require('./workers/snapshotWorker');
const { initExpiryWorker } = require('./workers/expiryWorker');
require('./workers/tradeWorker'); // Bull processing worker
const { getPoolStats } = require('./utils/db');
const { getCacheHealth } = require('./utils/cache.service');
const { getQueueStats } = require('./queues/tradeQueue');
const { handleStripeWebhook, handleRazorpayWebhook } = require('./controllers/webhook.controller');
const upstoxFeed = require('./services/upstoxFeed.service');

const {
  securityHeaders,
  sanitizeInput,
  detectSuspiciousActivity,
  requestSizeLimits,
} = require('./middleware/security.middleware')

const {
  globalLimiter,
  authLimiter,
  otpLimiter,
  tradeLimiter,
  payoutLimiter,
  adminLimiter,
  kycLimiter,
  webhookLimiter,
} = require('./middleware/rateLimiter.middleware')

const {
  requestTracker,
  getFullHealthReport,
} = require('./utils/monitoring')

const {
  setServer,
  setIO,
  registerShutdownHandlers,
} = require('./utils/gracefulShutdown')
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
socketIO.init(server);

// Start Background Workers
initBreachScanner();
initSnapshotWorker();
initExpiryWorker();

// Note: upstoxFeed.connect() is called after a user successfully connects their
// Upstox broker account. It is NOT started at server startup because it
// requires a valid per-user access token.

// ── Webhooks (MUST be before express.json) ──────────
app.post('/api/v1/webhooks/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);
app.post('/api/v1/webhooks/razorpay', express.raw({ type: '*/*' }), handleRazorpayWebhook);

// ── Security Middleware ───────────────────────────
app.use(securityHeaders);

// Trust Proxy for Production (Heroku/Nginx)
app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
  credentials: true
}));

// Request tracking
app.use(requestTracker)

// Body size limits
app.use(express.json(requestSizeLimits.json))
app.use(express.urlencoded(requestSizeLimits.urlencoded))
app.use(cookieParser());
app.use(passport.initialize());

// Input sanitization
app.use(sanitizeInput)

// Suspicious activity detection
app.use(detectSuspiciousActivity)

// Global rate limiter
app.use(globalLimiter)

app.use(morgan('dev'));

// ── Routes ──────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/auth/resend-otp', otpLimiter); // Removed, handled in routes
// app.use('/api/v1/auth/verify', otpLimiter); // Removed, handled in routes

app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/challenges', challengeRoutes);

app.use('/api/v1/trades', tradeRoutes);
app.use('/api/v1/payouts', payoutRoutes);
app.use('/api/v1/kyc', kycRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/webhooks', webhookLimiter);

app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/upstox', upstoxRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// ── Health Check ────────────────────────────────────
app.get('/api/v1/health', async (req, res) => {
  try {
    const report = await getFullHealthReport()
    const statusCode = 
      report.status === 'healthy' ? 200
      : report.status === 'degraded' ? 207
      : 503
    return res.status(statusCode).json(report)
  } catch (error) {
    return res.status(503).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Indipips API is running! 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ── 404 Handler ─────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found: ' + 
      req.method + ' ' + req.path,
  })
})

// ── Global Error Handler ────────────────────────────
app.use((err, req, res, next) => {
  console.error('🚨 Unhandled route error:', {
    message: err.message,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    stack: process.env.NODE_ENV === 
      'development' ? err.stack : undefined,
  })

  // Never expose internal errors to client
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 
      'production'
      ? 'An unexpected error occurred.'
      : err.message,
    requestId: req.headers['x-request-id'],
  })
})

// ── Start Server ────────────────────────────────────
const httpServer = server.listen(PORT, () => {
  console.log(`
  ██╗███╗   ██╗██████╗ ██╗██████╗ ██╗██████╗ ███████╗
  ██║████╗  ██║██╔══██╗██║██╔══██╗██║██╔══██╗██╔════╝
  ██║██╔██╗ ██║██║  ██║██║██████╔╝██║██████╔╝███████╗
  ██║██║╚██╗██║██║  ██║██║██╔═══╝ ██║██╔═══╝ ╚════██║
  ██║██║ ╚████║██████╔╝██║██║     ██║██║     ███████║
  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝╚═╝     ╚═╝╚═╝     ╚══════╝
  `);
  console.log(`✅ Indipips Server running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`📅 ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
  console.log(`🔐 Auth routes: http://localhost:${PORT}/api/v1/auth`);
  console.log(`💳 Payment routes: http://localhost:${PORT}/api/v1/payments`);
});

// Register with graceful shutdown
setServer(httpServer)

// Initialize Socket.io
setIO(socketIO.getIO ? socketIO.getIO() : null)

// Register shutdown handlers
registerShutdownHandlers()

module.exports = app;