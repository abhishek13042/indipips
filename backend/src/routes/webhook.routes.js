const express = require('express');
const router = express.Router();
const { handleStripeWebhook } = require('../controllers/webhook.controller');

// Stripe requires the raw body for signature verification
router.post('/', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
