const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('./config/passport'); // Initialize passport strategy
require('dotenv').config();
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
const { initBreachScanner } = require('./workers/breachScanner');
const { initSnapshotWorker } = require('./workers/snapshotWorker');
const { handleStripeWebhook } = require('./controllers/webhook.controller');
const upstoxFeed = require('./services/upstoxFeed.service');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
socketIO.init(server);

// Start Background Workers
initBreachScanner();
initSnapshotWorker();

// Note: upstoxFeed.connect() is called after a user successfully connects their
// Upstox broker account. It is NOT started at server startup because it
// requires a valid per-user access token.

// ── Stripe Webhook (MUST be before express.json) ────
app.post('/api/v1/webhooks/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

// ── Security Middleware ───────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.stripe.com"],
      connectSrc: ["'self'", "https://api.upstox.com", "wss://api.upstox.com", "https://api.stripe.com", "https://api.razorpay.com"],
      frameSrc: ["'self'", "https://checkout.stripe.com", "https://api.razorpay.com"],
      imgSrc: ["'self'", "data:", "https://*.stripe.com", "https://*.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  },
}));

// Trust Proxy for Production (Heroku/Nginx)
app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
  credentials: true
}));

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

// Auth & Payment Specific Limiter (Stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many sensitive requests. Security lockout engaged.' }
});

app.use('/api/', globalLimiter);
app.use('/api/v1/auth/', authLimiter);
app.use('/api/v1/payments/', authLimiter);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// ── Routes ──────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/challenges', challengeRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/trades', tradeRoutes);
app.use('/api/v1/kyc', kycRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/payouts', payoutRoutes);
app.use('/api/v1/upstox', upstoxRoutes);

// ── Health Check ────────────────────────────────────
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
    message: `Route ${req.originalUrl} not found`
  });
});

// ── Global Error Handler ────────────────────────────
// Catches all unhandled async errors — prevents stack traces leaking to users
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected error occurred.'
  });
});

// ── Start Server ────────────────────────────────────
server.listen(PORT, () => {
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

module.exports = app;