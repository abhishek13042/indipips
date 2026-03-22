const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kyc.controller');
const { protect } = require('../middleware/auth.middleware');
const { kycLimiter } = require('../middleware/rateLimiter.middleware');

// All KYC routes are protected
router.use(protect);

router.post('/aadhaar', kycLimiter, kycController.submitAadhaar);
router.post('/pan', kycLimiter, kycController.submitPan);
router.get('/status', kycController.getKycStatus);

module.exports = router;
