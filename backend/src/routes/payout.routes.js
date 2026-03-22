const express = require('express');
const router = express.Router();
const payoutController = require('../controllers/payout.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, payoutRequestSchema } = require('../middleware/validation.middleware');

router.use(protect);

router.get('/eligibility/:challengeId', payoutController.getPayoutEligibility);
router.post('/request', validate(payoutRequestSchema), payoutController.requestPayout);
router.get('/history', payoutController.getMyPayouts);

module.exports = router;
