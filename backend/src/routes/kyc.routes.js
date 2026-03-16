const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kyc.controller');
const { protect } = require('../middleware/auth.middleware');

// All KYC routes are protected
router.use(protect);

router.post('/aadhaar', kycController.submitAadhaar);
router.post('/pan', kycController.submitPan);
router.get('/status', kycController.getKycStatus);

module.exports = router;
