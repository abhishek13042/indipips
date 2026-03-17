const upstoxService = require('../services/upstox.service');

/**
 * Initiates the Upstox OAuth login flow
 */
const initiateLogin = async (req, res) => {
  try {
    const loginUrl = upstoxService.getLoginUrl();
    res.json({
      success: true,
      data: { loginUrl }
    });
  } catch (error) {
    console.error('Upstox Login Initiation Error:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate Upstox login.' });
  }
};

/**
 * Handles the callback from Upstox after user authorization
 */
const handleCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Authorization code is missing.' });
  }

  try {
    // 1. Exchange code for token
    const tokenData = await upstoxService.exchangeCodeForToken(code);

    // 2. Save session to current user (req.userId comes from auth middleware)
    await upstoxService.saveSession(req.userId, tokenData);

    // 3. Verify connectivity by fetching profile
    const profile = await upstoxService.getProfile(tokenData.access_token);

    // 4. Redirect or respond
    // In a real flow, we might redirect back to the frontend dashboard
    res.json({
      success: true,
      message: 'Upstox broker connected successfully.',
      data: {
        brokerName: profile.data.user_name,
        brokerId: profile.data.user_id
      }
    });

  } catch (error) {
    console.error('Upstox Callback Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to complete Upstox connection.' });
  }
};

/**
 * Get current connected broker status
 */
const getBrokerStatus = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        brokerAccessToken: true,
        brokerTokenExpiry: true
      }
    });

    const isConnected = !!(user?.brokerAccessToken && new Date(user.brokerTokenExpiry) > new Date());

    res.json({
      success: true,
      data: { isConnected }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch broker status.' });
  }
};

module.exports = {
  initiateLogin,
  handleCallback,
  getBrokerStatus
};
