const cron = require('node-cron');
const prisma = require('../utils/prisma');

/**
 * Snapshot Worker
 * Dynamically captures the account state (Balance & Equity) every day at midnight.
 * This data is used to render the Equity Curve on the dashboard.
 */
const initSnapshotWorker = () => {
  console.log('📈 Equity Snapshot Worker Initialized');

  // Run at midnight every day
  cron.schedule('0 0 * * *', async () => {
    console.log(`📸 [${new Date().toLocaleDateString()}] Capturing daily equity snapshots...`);

    try {
      const activeChallenges = await prisma.challenge.findMany({
        where: { status: 'ACTIVE' },
        include: {
          trades: {
            where: { status: 'OPEN' }
          }
        }
      });

      for (const challenge of activeChallenges) {
        // Calculate current equity (Realized + Unrealized)
        let currentEquity = Number(challenge.currentBalance);
        
        // Add unrealized P&L from open trades using LIVE prices
        let unrealizedPnl = 0n;
        for (const trade of challenge.trades) {
          const livePrice = priceFeed.getPrice(trade.symbol);
          if (livePrice) {
            const livePricePaise = BigInt(Math.round(Number(livePrice) * 100));
            const tradePnlPaise = (livePricePaise - BigInt(trade.entryPrice)) * BigInt(trade.quantity);
            unrealizedPnl += (trade.tradeType === 'BUY' ? tradePnlPaise : -tradePnlPaise);
          } else {
            unrealizedPnl += BigInt(trade.pnl || 0);
          }
        }
        
        const finalEquity = BigInt(challenge.currentBalance) + unrealizedPnl;

        // Save Snapshot
        await prisma.equitySnapshot.create({
          data: {
            challengeId: challenge.id,
            balance: challenge.currentBalance,
            equity: BigInt(Math.round(finalEquity * 100)), // Store as BigInt cents
            timestamp: new Date()
          }
        });
      }

      console.log(`✅ Daily snapshots captured for ${activeChallenges.length} accounts.`);
    } catch (error) {
      console.error('⚠️ Snapshot Worker Error:', error);
    }
  });
};

module.exports = { initSnapshotWorker };
