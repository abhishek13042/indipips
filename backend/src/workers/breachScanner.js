const cron = require('node-cron');
const prisma = require('../utils/prisma');
const { calculateBreach } = require('../utils/riskEngine');
const { notifyBreach } = require('../services/notification.service');
const priceFeed = require('../utils/priceFeed');

/**
 * Breach Scanner Worker
 * Scans all ACTIVE challenges every minute to check for unrealized equity breaches.
 */
const initBreachScanner = () => {
  console.log('🛡️  Breach Scanner Worker Initialized');

  // Run every minute
  cron.schedule('* * * * *', async () => {
    console.log(`⏱️  [${new Date().toLocaleTimeString()}] Running automated breach scan...`);

    try {
      // Find all active challenges
      const activeChallenges = await prisma.challenge.findMany({
        where: { status: 'ACTIVE' },
        include: {
          trades: {
            where: { status: 'OPEN' }
          }
        }
      });

      for (const challenge of activeChallenges) {
        let currentEquity = Number(challenge.currentBalance);

        // Calculate unrealized P&L from open trades
        // Note: For now, we assume mock pricing or the last recorded entry price
        // In reality, this would fetch live market prices.
        if (challenge.trades.length > 0) {
          const unrealizedPnl = challenge.trades.reduce((sum, trade) => {
            const livePrice = priceFeed.getPrice(trade.symbol);
            if (livePrice) {
              const tradePnl = (Number(livePrice) * 100 - Number(trade.entryPrice)) * trade.quantity;
              return sum + (trade.tradeType === 'BUY' ? tradePnl : -tradePnl);
            }
            return sum + Number(trade.pnl);
          }, 0);
          currentEquity += unrealizedPnl / 100;
        }

        // Check for breaches
        const breachResult = calculateBreach(challenge, currentEquity);

        if (breachResult.isBreached) {
          console.log(`❌ Breach detected for Account ${challenge.id}: ${breachResult.reason}`);

          // 1. Update DB Status
          await prisma.challenge.update({
            where: { id: challenge.id },
            data: {
              status: 'FAILED',
              failReason: breachResult.reason + ': ' + breachResult.details
            }
          });

          // 2. Notify User
          notifyBreach(challenge.userId, challenge.id, breachResult.reason, breachResult.details);
        }
      }

      console.log(`✅ Scan complete. Processed ${activeChallenges.length} active accounts.`);
    } catch (error) {
      console.error('⚠️ Breach Scanner Error:', error);
    }
  });
};

module.exports = { initBreachScanner };
