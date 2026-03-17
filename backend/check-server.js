const authRoutes = require('./src/routes/auth.routes');
const planRoutes = require('./src/routes/plans.routes');
const { handleStripeWebhook } = require('./src/controllers/webhook.controller');
const rateLimit = require('express-rate-limit');

console.log('authRoutes:', typeof authRoutes);
console.log('planRoutes:', typeof planRoutes);
console.log('handleStripeWebhook:', typeof handleStripeWebhook);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
console.log('authLimiter:', typeof authLimiter);
