const prisma = require('../utils/prisma');
const cache = require('../services/cache.service');
const { calculatePerformanceStats } = require('../utils/statsEngine');

// Get all challenges for logged in trader
const getMyChallenges = async (req, res) => {
  try {
    const userId = req.userId; // Matches existing middleware

    const challenges = await prisma.challenge.findMany({
      where: { userId },
      include: {
        plan: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = challenges.map(c => {
      const accountSize = Number(c.accountSize) / 100
      const currentBalance = Number(c.currentBalance) / 100
      const peakBalance = Number(c.peakBalance) / 100
      const totalPnl = Number(c.totalPnl) / 100
      const dailyPnl = Number(c.dailyPnl) / 100

      // Calculate profit target amount
      const profitTargetAmount = accountSize * (c.plan.profitTarget / 100)
      const dailyLossLimitAmount = accountSize * (c.plan.dailyLossLimit / 100)
      const maxDrawdownAmount = accountSize * (c.plan.maxDrawdown / 100)

      // Calculate percentages for display
      const profitTargetPct = profitTargetAmount > 0
        ? Math.min(100, (totalPnl / profitTargetAmount) * 100).toFixed(1)
        : '0.0'

      const drawdownAmount = peakBalance - currentBalance
      const drawdownPct = accountSize > 0
        ? ((drawdownAmount / accountSize) * 100).toFixed(2)
        : '0.00'

      const dailyLossPct = accountSize > 0
        ? ((Math.abs(Math.min(0, dailyPnl)) / accountSize) * 100).toFixed(2)
        : '0.00'

      // Days remaining
      const now = new Date()
      const expiry = c.expiryDate ? new Date(c.expiryDate) : null
      const daysRemaining = expiry
        ? Math.max(0, Math.ceil((expiry - now) / 86400000))
        : null

      return {
        id: c.id,
        userId: c.userId,
        planId: c.planId,
        status: c.status,
        phase: c.phase,

        // Money values (in rupees)
        accountSize,
        currentBalance,
        peakBalance,
        totalPnl,
        dailyPnl,
        dailyStartingBalance: Number(c.dailyStartingBalance || c.accountSize) / 100,

        // Rule values
        daysTraded: c.daysTraded,
        consistencyViolations: c.consistencyViolations,
        profitSplitPct: c.profitSplitPct,
        isFunded: c.isFunded,

        // Plan details
        planName: c.plan.name || 'Unknown',
        planType: c.plan.challengeType || 'ONE_STEP',
        profitTarget: c.plan.profitTarget,
        dailyLossLimit: c.plan.dailyLossLimit,
        maxDrawdown: c.plan.maxDrawdown,
        minTradingDays: c.plan.minTradingDays,
        maxTradingDays: c.plan.maxTradingDays,

        // Calculated amounts
        profitTargetAmount,
        dailyLossLimitAmount,
        maxDrawdownAmount,

        // Calculated percentages
        profitTargetPct: parseFloat(profitTargetPct),
        drawdownPct: parseFloat(drawdownPct),
        dailyLossPct: parseFloat(dailyLossPct),

        // Dates
        startDate: c.startDate,
        expiryDate: c.expiryDate,
        passedAt: c.passedAt,
        failReason: c.failReason,
        daysRemaining,

        createdAt: c.createdAt,
      }
    })

    return res.status(200).json({
      success: true,
      message: formatted.length + ' challenge(s) found.',
      data: formatted,
    })
  } catch (error) {
    console.error('getMyChallenges ERROR:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch challenges: ' + error.message,
    });
  }
};

// Get single challenge detail
const getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;

    const challenge = await prisma.challenge.findFirst({
      where: { id, userId: req.userId },
      include: {
        plan: true,
        trades: {
          orderBy: { createdAt: 'desc' },
        },
        equitySnapshots: {
          orderBy: { timestamp: 'asc' },
          take: 30, // Last 30 days of history
        }
      }
    });

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    // Calculate drawdown percentage
    const drawdownPct = challenge.peakBalance > 0
      ? ((Number(challenge.peakBalance) - Number(challenge.currentBalance)) / Number(challenge.peakBalance)) * 100
      : 0;

    // Calculate profit percentage
    const profitPct = challenge.accountSize > 0
      ? (Number(challenge.totalPnl) / Number(challenge.accountSize)) * 100
      : 0;

    // Calculate daily loss percentage
    const dailyLossPct = challenge.accountSize > 0
      ? (Math.abs(Number(challenge.dailyPnl)) / Number(challenge.accountSize)) * 100
      : 0;

    // Calculate Advanced Performance Stats
    const stats = calculatePerformanceStats(challenge.trades, Number(challenge.accountSize) / 100);

    res.json({
      success: true,
      data: {
        id: challenge.id,
        status: challenge.status,
        phase: challenge.phase,
        startDate: challenge.startDate,
        expiryDate: challenge.expiryDate,
        currentBalance: Number(challenge.currentBalance) / 100,
        accountSize: Number(challenge.accountSize) / 100,
        peakBalance: Number(challenge.peakBalance) / 100,
        totalPnl: Number(challenge.totalPnl) / 100,
        dailyPnl: Number(challenge.dailyPnl) / 100,
        daysTraded: challenge.daysTraded,
        brokerConnected: challenge.brokerConnected,
        passedAt: challenge.passedAt,
        failReason: challenge.failReason,
        // Calculated fields for dashboard
        drawdownPercentage: Math.round(drawdownPct * 100) / 100,
        profitPercentage: Math.round(profitPct * 100) / 100,
        dailyLossPercentage: Math.round(dailyLossPct * 100) / 100,
        // Advanced Analytics
        stats,
        equityHistory: challenge.equitySnapshots.map(s => ({
          balance: Number(s.balance) / 100,
          equity: Number(s.equity) / 100,
          timestamp: s.timestamp
        })),
        plan: {
          name: challenge.plan.name,
          challengeType: challenge.plan.challengeType,
          accountSize: Number(challenge.plan.accountSize) / 100,
          profitTarget: challenge.plan.profitTarget,
          dailyLossLimit: challenge.plan.dailyLossLimit,
          maxDrawdown: challenge.plan.maxDrawdown,
          minTradingDays: challenge.plan.minTradingDays,
          maxTradingDays: challenge.plan.maxTradingDays,
          profitSplit: challenge.plan.profitSplit,
        },
        recentTrades: challenge.trades.map(t => ({
          id: t.id,
          instrument: t.instrument,
          tradeType: t.tradeType,
          quantity: t.quantity,
          entryPrice: Number(t.entryPrice) / 100,
          exitPrice: t.exitPrice ? Number(t.exitPrice) / 100 : null,
          pnl: Number(t.pnl) / 100,
          tradeDate: t.tradeDate,
          entryTime: t.entryTime,
          exitTime: t.exitTime,
        })),
      }
    });
  } catch (error) {
    console.error('Get challenge error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
};

module.exports = { getMyChallenges, getChallengeById };