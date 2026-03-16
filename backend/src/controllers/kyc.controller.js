const prisma = require('../utils/prisma');
const kycService = require('../services/kyc.service');

/**
 * Submit Aadhaar for verification
 * POST /api/v1/kyc/aadhaar
 */
const submitAadhaar = async (req, res) => {
  try {
    const { aadhaarNumber } = req.body;

    if (!aadhaarNumber) {
      return res.status(400).json({ success: false, message: 'Aadhaar number is required.' });
    }

    // 1. Verify via service
    const result = await kycService.verifyAadhaar(aadhaarNumber);

    // 2. Update User Record
    await prisma.user.update({
      where: { id: req.userId },
      data: {
        aadhaarVerified: true,
        // We might want to store more data later
      }
    });

    res.json({
      success: true,
      message: 'Aadhaar verified successfully.',
      data: result.data
    });
  } catch (error) {
    console.error('Aadhaar submission error:', error);
    res.status(400).json({ success: false, message: error.message || 'Verification failed.' });
  }
};

/**
 * Submit PAN for verification
 * POST /api/v1/kyc/pan
 */
const submitPan = async (req, res) => {
  try {
    const { panNumber } = req.body;

    if (!panNumber) {
      return res.status(400).json({ success: false, message: 'PAN number is required.' });
    }

    // 1. Verify via service
    const result = await kycService.verifyPan(panNumber);

    // 2. Update User Record
    await prisma.user.update({
      where: { id: req.userId },
      data: {
        panNumber: result.data.pan,
        kycStatus: 'VERIFIED'
      }
    });

    res.json({
      success: true,
      message: 'PAN verified and KYC completed successfully.',
      data: result.data
    });
  } catch (error) {
    console.error('PAN submission error:', error);
    res.status(400).json({ success: false, message: error.message || 'Verification failed.' });
  }
};

/**
 * Get current KYC status
 * GET /api/v1/kyc/status
 */
const getKycStatus = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        kycStatus: true,
        aadhaarVerified: true,
        panNumber: true
      }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get KYC status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = {
  submitAadhaar,
  submitPan,
  getKycStatus
};
