/**
 * Risk Engine Utility
 * Handles calculation of daily loss and maximum drawdown breaches.
 */

const calculateBreach = (challenge, currentEquity) => {
  const accountSize = Number(challenge.accountSize);
  const currentBalance = Number(challenge.currentBalance);
  const peakBalance = Number(challenge.peakBalance);
  const dailyStartingBalance = Number(challenge.dailyStartingBalance || challenge.accountSize);

  // 1. Daily Loss (4% of initial account size or start of day balance?)
  // Standard prop firm rule: 4% of initial account size or 4% of start-of-day balance.
  // We'll use 4% of the dailyStartingBalance for now.
  const dailyLossLimit = 0.04 * accountSize;
  const currentDailyLoss = dailyStartingBalance - currentEquity;

  if (currentDailyLoss >= dailyLossLimit) {
    return {
      isBreached: true,
      reason: 'DAILY_LOSS_LIMIT_REACHED',
      details: `Daily loss of ${currentDailyLoss.toFixed(2)} exceeded limit of ${dailyLossLimit.toFixed(2)}`
    };
  }

  // 2. Maximum Drawdown (8% of initial account size or peak balance?)
  // Standard prop firm rule: 8% of the initial account size is the absolute floor.
  // Some use 8% of Peak Balance (Trailing Drawdown).
  // We will use 8% of the initial account size as a fixed drawdown floor for now (Classic).
  const maxDrawdownLimit = 0.08 * accountSize;
  const drawdownFloor = accountSize - maxDrawdownLimit;

  if (currentEquity <= drawdownFloor) {
    return {
      isBreached: true,
      reason: 'MAX_DRAWDOWN_REACHED',
      details: `Current equity ${currentEquity.toFixed(2)} dropped below absolute floor of ${drawdownFloor.toFixed(2)}`
    };
  }

  return { isBreached: false };
};

module.exports = { calculateBreach };
