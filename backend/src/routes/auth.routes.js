const express = require('express');
const passport = require('passport');
const router = express.Router();
const { register, login, getProfile, refreshToken, logout, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// ── Public Routes ──────────────────────────────────
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ── Google OAuth Routes ───────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), (req, res, next) => {
  // Pass req.user to the controller function
  req.authAction = 'google';
  next();
}, require('../controllers/auth.controller').googleCallback);

// ── Protected Routes ───────────────────────────────
router.get('/profile', protect, getProfile);

module.exports = router;