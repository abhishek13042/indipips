const auditLogger = require('../utils/auditLogger');

const DEFAULT_PROFIT_SPLIT = 80; // 80% to trader
const TDS_PERCENT = 30; // 30% TDS (Income Tax Section 194BA)

/**
 * Calculate the breakdown of a payout request
 * @param {bigint} totalProfit - The total profit in the account (in cents/paise)
 * @param {bigint} challengeFee - The initial fee paid for the challenge
 * @param {boolean} isFirstPayout - Whether this is the first payout on this challenge
 * @param {number} splitPercent - The trader's split percentage (0-100)
 */
const calculateBreakdown = (totalProfit, challengeFee = 0n, isFirstPayout = false, splitPercent = DEFAULT_PROFIT_SPLIT) => {
  const profit = Number(totalProfit);
  
  if (profit <= 0) return { traderGrossShare: 0, firmShare: 0, tdsAmount: 0, feeRefund: 0, netPayout: 0 };

  const traderGrossShare = (profit * splitPercent) / 100;
  const firmShare = profit - traderGrossShare;
  
  // Calculate TDS (30%) on trader's gross profit share
  const tdsAmount = (traderGrossShare * TDS_PERCENT) / 100;
  
  // Fee refund only on first payout
  const feeRefund = isFirstPayout ? Number(challengeFee) : 0;
  
  // netPayout = (traderGrossShare - tds) + feeRefund
  const netPayout = (traderGrossShare - tdsAmount) + feeRefund;

  return {
    totalProfit: profit,
    traderGrossShare,
    firmShare,
    tdsAmount,
    feeRefund,
    netPayout,
    splitPercent
  };
};

/**
 * Check if a challenge is old enough for a payout (14 days after passing)
 */
const checkPayoutAge = (challenge) => {
  if (!challenge.passedAt) return { isEligible: false, reason: 'Challenge has not been passed yet.' };

  const passedAt = new Date(challenge.passedAt);
  const now = new Date();
  const diffTime = Math.abs(now - passedAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const daysRemaining = 14 - diffDays;
  const availableFrom = new Date(passedAt);
  availableFrom.setDate(availableFrom.getDate() + 14);

  return {
    isEligible: diffDays >= 14,
    daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
    availableFrom
  };
};

module.exports = {
  calculateBreakdown,
  checkPayoutAge,
  DEFAULT_PROFIT_SPLIT,
  TDS_PERCENT
};
