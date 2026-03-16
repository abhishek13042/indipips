const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const planRoutes = require('./routes/plans.routes');
const userRoutes = require('./routes/user.routes');
const challengeRoutes = require('./routes/challenge.routes');
const paymentRoutes = require('./routes/payment.routes');
const { handleWebhook } = require('./controllers/payment.controller');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Stripe Webhook (MUST be before express.json) ────
app.post('/api/v1/webhooks/stripe', express.raw({ type: 'application/json' }), handleWebhook);

// ── Middleware ──────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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