const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('./config/passport'); // Initialize passport strategy
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const planRoutes = require('./routes/plans.routes');
const userRoutes = require('./routes/user.routes');
const challengeRoutes = require('./routes/challenge.routes');
const paymentRoutes = require('./routes/payment.routes');
const { handleStripeWebhook } = require('./controllers/webhook.controller');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Stripe Webhook (MUST be before express.json) ────
app.post('/api/v1/webhooks/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

// ── Middleware ──────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per `window`
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use(helmet());
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(limiter);
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

// ── Start Server ────────────────────────────────────
app.listen(PORT, () => {
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