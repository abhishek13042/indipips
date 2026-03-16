/**
 * Stats Engine
 * Logic for professional trading analytics.
 */

const calculatePerformanceStats = (trades, initialBalance) => {
  if (!trades || trades.length === 0) {
    return {
      winRate: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      totalPnl: 0,
      tradesCount: 0
    };
  }

  const closedTrades = trades.filter(t => t.status === 'CLOSED');
  const winningTrades = closedTrades.filter(t => Number(t.pnl) > 0);
  const losingTrades = closedTrades.filter(t => Number(t.pnl) < 0);

  const totalWin = winningTrades.reduce((sum, t) => sum + Number(t.pnl), 0);
  const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + Number(t.pnl), 0));

  const winRate = (winningTrades.length / closedTrades.length) * 100;
  const profitFactor = totalLoss === 0 ? (totalWin > 0 ? 99 : 0) : totalWin / totalLoss;

  const averageWin = winningTrades.length > 0 ? totalWin / winningTrades.length : 0;
  const averageLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;
  const totalPnl = closedTrades.reduce((sum, t) => sum + Number(t.pnl), 0);

  return {
    winRate: parseFloat(winRate.toFixed(2)),
    profitFactor: parseFloat(profitFactor.toFixed(2)),
    averageWin: parseFloat(averageWin.toFixed(2)),
    averageLoss: parseFloat(averageLoss.toFixed(2)),
    totalPnl,
    tradesCount: closedTrades.length
  };
};

module.exports = {
  calculatePerformanceStats
};
