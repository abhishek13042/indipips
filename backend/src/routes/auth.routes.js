const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// ── Public Routes ──────────────────────────────────
router.post('/register', register);
router.post('/login', login);

// ── Protected Routes ───────────────────────────────
router.get('/profile', protect, getProfile);

module.exports = router;