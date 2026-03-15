const express = require('express');
const router = express.Router();
const { seedPlans, getPlans, getPlanById } = require('../controllers/plans.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// Public
router.get('/', getPlans);
router.get('/:id', getPlanById);

// Admin only
router.post('/seed', protect, adminOnly, seedPlans);

module.exports = router;