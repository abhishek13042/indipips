const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
  connectionString: 'postgresql://postgres:indipips123@localhost:5432/indipips_db'
});
const prisma = new PrismaClient({ adapter });

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
            profitTarget: true,
            dailyLossLimit: true,
            maxDrawdown: true,
            minTradingDays: true,
            maxTradingDays: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = challenges.map(c => ({
      id: c.id,
      status: c.status,
      startDate: c.startDate,
      endDate: c.endDate,
      currentBalance: Number(c.currentBalance) / 100,
      startingBalance: Number(c.startingBalance) / 100,
      highWaterMark: Number(c.highWaterMark) / 100,
      totalPnl: Number(c.totalPnl) / 100,
      todayPnl: Number(c.todayPnl) / 100,
      tradingDays: c.tradingDays,
      createdAt: c.createdAt,
      plan: {
        ...c.plan,
        accountSize: Number(c.plan.accountSize) / 100,
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
      }
    });

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    res.json({
      success: true,
      data: {
        id: challenge.id,
        status: challenge.status,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        currentBalance: Number(challenge.currentBalance) / 100,
        startingBalance: Number(challenge.startingBalance) / 100,
        highWaterMark: Number(challenge.highWaterMark) / 100,
        totalPnl: Number(challenge.totalPnl) / 100,
        todayPnl: Number(challenge.todayPnl) / 100,
        tradingDays: challenge.tradingDays,
        plan: {
          name: challenge.plan.name,
          accountSize: Number(challenge.plan.accountSize) / 100,
          profitTarget: challenge.plan.profitTarget,
          dailyLossLimit: challenge.plan.dailyLossLimit,
          maxDrawdown: challenge.plan.maxDrawdown,
          minTradingDays: challenge.plan.minTradingDays,
          maxTradingDays: challenge.plan.maxTradingDays,
        }
      }
    });
  } catch (error) {
    console.error('Get challenge error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
};

module.exports = { getMyChallenges, getChallengeById };