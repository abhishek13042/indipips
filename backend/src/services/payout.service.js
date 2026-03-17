const auditLogger = require('../utils/auditLogger');

const DEFAULT_PROFIT_SPLIT = 80; // 80% to trader
const TDS_PERCENT = 10; // 10% TDS (Income Tax) for Indian payouts

/**
 * Calculate the breakdown of a payout request
 * @param {bigint} totalProfit - The total profit in the account (in cents/paise)
 * @param {number} splitPercent - The trader's split percentage (0-100)
 */
const calculateBreakdown = (totalProfit, splitPercent = DEFAULT_PROFIT_SPLIT) => {
  const profit = Number(totalProfit);
  
  if (profit <= 0) return { traderShare: 0, firmShare: 0, tdsAmount: 0, netPayout: 0 };

  const traderGrossShare = (profit * splitPercent) / 100;
  const firmShare = profit - traderGrossShare;
  
  // Calculate TDS on trader's share
  const tdsAmount = (traderGrossShare * TDS_PERCENT) / 100;
  const netPayout = traderGrossShare - tdsAmount;

  return {
    totalProfit: profit,
    traderGrossShare,
    firmShare,
    tdsAmount,
    netPayout,
    splitPercent
  };
};

module.exports = {
  calculateBreakdown,
  DEFAULT_PROFIT_SPLIT,
  TDS_PERCENT
};
