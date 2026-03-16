/**
 * Notification Service
 * Manages alerts for account status changes, breaches, and target hits.
 */

const { emitToUser } = require('../utils/socket');

/**
 * Notify user about account failure/breach
 */
const notifyBreach = (userId, challengeId, reason, details) => {
  console.log(`🚨 [NOTIFICATION] User ${userId} | Account ${challengeId} FAILED | Reason: ${reason}`);
  
  // Real-time Socket Alert
  emitToUser(userId, 'account_status_change', {
    type: 'ACCOUNT_FAILED',
    challengeId,
    reason,
    details,
    timestamp: new Date().toISOString()
  });

  // Future: Integration with Email (Nodemailer) or SMS (Twilio/Fast2SMS)
};

/**
 * Notify user about passing a phase or challenge
 */
const notifySuccess = (userId, challengeId, phase) => {
  console.log(`🎯 [NOTIFICATION] User ${userId} | Account ${challengeId} passed Phase ${phase}!`);

  emitToUser(userId, 'account_status_change', {
    type: 'ACCOUNT_PASSED',
    challengeId,
    phase,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  notifyBreach,
  notifySuccess
};
