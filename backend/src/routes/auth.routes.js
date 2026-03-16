const express = require('express');
const router = express.Router();
const { register, login, getProfile, refreshToken, logout } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// ── Public Routes ──────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// ── Protected Routes ───────────────────────────────
router.get('/profile', protect, getProfile);

module.exports = router;