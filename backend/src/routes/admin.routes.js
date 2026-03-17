const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');

// All admin routes are protected by both Auth and Admin Role checks
router.use(protect);
router.use(isAdmin);

// Challenge management
router.get('/stats', adminController.getGlobalStats);
router.get('/challenges', adminController.getAllChallenges);
router.patch('/challenges/:id/status', adminController.updateChallengeStatus);

// Payout management
router.get('/payouts', adminController.getAllPayouts);
router.patch('/payouts/:id/approve', adminController.approvePayout);
router.patch('/payouts/:id/reject', adminController.rejectPayout);

module.exports = router;
