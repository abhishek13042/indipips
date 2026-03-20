/**
 * Risk Engine Utility
 * Handles calculation of daily loss and maximum drawdown breaches.
 */

const calculateBreach = (challenge, currentEquity) => {
  const accountSize = BigInt(challenge.accountSize);
  const dailyStartingBalance = BigInt(challenge.dailyStartingBalance || challenge.accountSize);

  // 1. Daily Loss (4% of initial account size or start of day balance?)
  // Standard prop firm rule: 4% of initial account size.
  const dailyLossLimit = (accountSize * 4n) / 100n;
  const currentDailyLoss = dailyStartingBalance - currentEquity;

  if (currentDailyLoss >= dailyLossLimit) {
    return {
      isBreached: true,
      reason: 'DAILY_LOSS_LIMIT_REACHED',
      details: `Daily loss of ${(Number(currentDailyLoss) / 100).toFixed(2)} exceeded limit of ${(Number(dailyLossLimit) / 100).toFixed(2)}`
    };
  }

  // 2. Maximum Drawdown (8% of initial account size or peak balance?)
  // Standard prop firm rule: 8% of the initial account size is the absolute floor.
  const maxDrawdownLimit = (accountSize * 8n) / 100n;
  const drawdownFloor = accountSize - maxDrawdownLimit;

  if (currentEquity <= drawdownFloor) {
    return {
      isBreached: true,
      reason: 'MAX_DRAWDOWN_REACHED',
      details: `Current equity ${(Number(currentEquity) / 100).toFixed(2)} dropped below absolute floor of ${(Number(drawdownFloor) / 100).toFixed(2)}`
    };
  }

  return { isBreached: false };
};

module.exports = { calculateBreach };
