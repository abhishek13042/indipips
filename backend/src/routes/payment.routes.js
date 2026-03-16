const express = require('express');
const router = express.Router();
const { createCheckoutSession, verifyPayment, getMyPayments } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

// All payment routes require authentication
router.post('/create-checkout', protect, createCheckoutSession);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getMyPayments);

module.exports = router;
