const prisma = require('../utils/prisma');

// Get all challenges for logged in trader
const getMyChallenges = async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany({
      where: { userId: req.userId },
      include: {
        plan: {
          select: {
            name: true,
            accountSize: true,
            challengeType: true,
            profitTarget: true,
            dailyLossLimit: true,
            maxDrawdown: true,
            minTradingDays: true,
            maxTradingDays: true,
            profitSplit: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = challenges.map(c => ({
      id: c.id,
      status: c.status,
      phase: c.phase,
      startDate: c.startDate,
      expiryDate: c.expiryDate,
      currentBalance: Number(c.currentBalance) / 100,
      accountSize: Number(c.accountSize) / 100,
      peakBalance: Number(c.peakBalance) / 100,
      totalPnl: Number(c.totalPnl) / 100,
      dailyPnl: Number(c.dailyPnl) / 100,
      daysTraded: c.daysTraded,
      brokerConnected: c.brokerConnected,
      passedAt: c.passedAt,
      failReason: c.failReason,
      createdAt: c.createdAt,
      plan: {
        name: c.plan.name,
        challengeType: c.plan.challengeType,
        accountSize: Number(c.plan.accountSize) / 100,
        profitTarget: c.plan.profitTarget,
        dailyLossLimit: c.plan.dailyLossLimit,
        maxDrawdown: c.plan.maxDrawdown,
        minTradingDays: c.plan.minTradingDays,
        maxTradingDays: c.plan.maxTradingDays,
        profitSplit: c.plan.profitSplit,
      }
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
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
          take: 20,
        },
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
      ? (Math.abs(Math.min(0, Number(challenge.dailyPnl))) / Number(challenge.accountSize)) * 100
      : 0;

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