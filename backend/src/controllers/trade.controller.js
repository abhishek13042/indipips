const prisma = require('../utils/prisma');
const { calculateBreach } = require('../utils/riskEngine');
const { emitToUser } = require('../utils/socket');
const brokerService = require('../services/broker.service');

/**
 * Open a new trade
 * POST /api/v1/trades/open
 */
const openTrade = async (req, res) => {
  try {
    const { challengeId, symbol, tradeType, quantity, entryPrice } = req.body;

    if (!challengeId || !symbol || !tradeType || !quantity || !entryPrice) {
      return res.status(400).json({ success: false, message: 'Missing required trade details.' });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge || challenge.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Account is not active or suspended.' });
    }

    if (challenge.userId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this account.' });
    }

    // Use Broker Service to place order
    const trade = await brokerService.placeOrder(
      req.userId,
      challengeId,
      symbol,
      tradeType,
      parseInt(quantity),
      parseFloat(entryPrice)
    );

    // Update total trades count
    await prisma.challenge.update({
      where: { id: challengeId },
      data: { totalTrades: { increment: 1 } },
    });

    // Notify Frontend
    emitToUser(req.userId, 'account_update', {
      type: 'TRADE_OPENED',
      challengeId,
      symbol,
    });

    res.json({
      success: true,
      message: 'Trade opened successfully.',
      data: {
        id: trade.id,
        symbol: trade.symbol,
        entryPrice: Number(trade.entryPrice) / 100,
      },
    });
  } catch (error) {
    console.error('Open trade error:', error);
    res.status(500).json({ success: false, message: 'Failed to open trade.' });
  }
};

/**
 * Close an active trade
 * POST /api/v1/trades/close
 */
const closeTrade = async (req, res) => {
  try {
    const { tradeId, exitPrice } = req.body;

    if (!tradeId || !exitPrice) {
      return res.status(400).json({ success: false, message: 'Trade ID and exit price are required.' });
    }

    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: { challenge: true },
    });

    if (!trade || trade.status !== 'OPEN') {
      return res.status(404).json({ success: false, message: 'Open trade not found.' });
    }

    if (trade.userId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    // Use Broker Service to close order
    const updatedTrade = await brokerService.closeOrder(tradeId, parseFloat(exitPrice));
    const pnlBigInt = BigInt(updatedTrade.pnl);

    // Update Challenge Balance
    const newBalance = BigInt(trade.challenge.currentBalance) + pnlBigInt;
    const updatedChallenge = await prisma.challenge.update({
      where: { id: trade.challengeId },
      data: {
        currentBalance: newBalance,
        totalPnl: { increment: pnlBigInt },
        peakBalance: newBalance > BigInt(trade.challenge.peakBalance) ? newBalance : trade.challenge.peakBalance,
        winCount: pnlBigInt > 0n ? { increment: 1 } : undefined,
        lossCount: pnlBigInt <= 0n ? { increment: 1 } : undefined,
      },
    });

    // Check for Breaches
    const breachResult = calculateBreach(updatedChallenge, newBalance);
    
    if (breachResult.isBreached) {
      await prisma.challenge.update({
        where: { id: trade.challengeId },
        data: {
          status: 'FAILED',
          failReason: breachResult.reason + ': ' + breachResult.details,
        },
      });
      console.log(`❌ Account ${trade.challengeId} FAILED due to ${breachResult.reason}`);
    }

    // Notify Frontend
    emitToUser(req.userId, 'account_update', {
      type: pnlNum > 0 ? 'TRADE_WON' : 'TRADE_LOST',
      challengeId: trade.challengeId,
      newBalance: newBalance / 100,
      isBreached: breachResult.isBreached,
    });

    res.json({
      success: true,
      message: 'Trade closed successfully.',
      data: {
        pnl: pnlNum,
        isBreached: breachResult.isBreached,
        newBalance: newBalance / 100,
        failReason: breachResult.isBreached ? breachResult.details : null
      },
    });
  } catch (error) {
    console.error('Close trade error:', error);
    res.status(500).json({ success: false, message: 'Failed to close trade.' });
  }
};

/**
 * Get all active (open) trades for a challenge
 * GET /api/v1/trades/active/:challengeId?
 */
const getActiveTrades = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const where = {
      userId: req.userId,
      status: 'OPEN',
    };

    if (challengeId) {
      where.challengeId = challengeId;
    }

    const trades = await prisma.trade.findMany({
      where,
      include: {
        challenge: true,
      },
      orderBy: {
        entryTime: 'desc',
      },
    });

    res.json({
      success: true,
      data: trades.map((t) => ({
        id: t.id,
        challengeId: t.challengeId,
        symbol: t.symbol,
        tradeType: t.tradeType,
        quantity: t.quantity,
        entryPrice: Number(t.entryPrice) / 100,
        entryTime: t.entryTime,
        status: t.status,
      })),
    });
  } catch (error) {
    console.error('Get active trades error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active trades.' });
  }
};

module.exports = { openTrade, closeTrade, getActiveTrades };
