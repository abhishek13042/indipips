const express = require('express');
const router = express.Router();
const upstoxController = require('../controllers/upstox.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Root: /api/v1/upstox

/**
 * @route   GET /api/v1/upstox/login
 * @desc    Initiate Upstox OAuth flow
 * @access  Private (Trader)
 */
router.get('/login', authMiddleware.protect, upstoxController.initiateLogin);

/**
 * @route   GET /api/v1/upstox/callback
 * @desc    Upstox OAuth Callback
 * @access  Public (Called by Upstox redirect)
 * @note    In production, this should likely be private or securely validated
 */
router.get('/callback', upstoxController.handleCallback);

/**
 * @route   GET /api/v1/upstox/status
 * @desc    Get broker connection status
 * @access  Private (Trader)
 */
router.get('/status', authMiddleware.protect, upstoxController.getBrokerStatus);

module.exports = router;
