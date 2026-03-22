const prisma = require('../utils/prisma');

const seedPlans = async (req, res) => {
  try {
    const plans = [
      // ── ZERO STEP (Instant Funded) ──────────────────
      { name: 'Seed', challengeType: 'ZERO_STEP', accountSize: BigInt(250000 * 100), challengeFee: BigInt(1499 * 100), profitTarget: 0, phase2Target: 0, dailyLossLimit: 3.0, maxDrawdown: 5.0, minTradingDays: 0, maxTradingDays: 0, profitSplit: 80 },
      { name: 'Starter', challengeType: 'ZERO_STEP', accountSize: BigInt(500000 * 100), challengeFee: BigInt(2699 * 100), profitTarget: 0, phase2Target: 0, dailyLossLimit: 3.0, maxDrawdown: 5.0, minTradingDays: 0, maxTradingDays: 0, profitSplit: 80 },
      { name: 'Pro', challengeType: 'ZERO_STEP', accountSize: BigInt(1000000 * 100), challengeFee: BigInt(4999 * 100), profitTarget: 0, phase2Target: 0, dailyLossLimit: 3.0, maxDrawdown: 5.0, minTradingDays: 0, maxTradingDays: 0, profitSplit: 80 },
      { name: 'Elite', challengeType: 'ZERO_STEP', accountSize: BigInt(1500000 * 100), challengeFee: BigInt(7199 * 100), profitTarget: 0, phase2Target: 0, dailyLossLimit: 3.0, maxDrawdown: 5.0, minTradingDays: 0, maxTradingDays: 0, profitSplit: 80 },
      { name: 'Master', challengeType: 'ZERO_STEP', accountSize: BigInt(2000000 * 100), challengeFee: BigInt(8999 * 100), profitTarget: 0, phase2Target: 0, dailyLossLimit: 3.0, maxDrawdown: 5.0, minTradingDays: 0, maxTradingDays: 0, profitSplit: 80 },

      // ── ONE STEP ────────────────────────────────────
      { name: 'Seed', challengeType: 'ONE_STEP', accountSize: BigInt(250000 * 100), challengeFee: BigInt(999 * 100), profitTarget: 8.0, phase2Target: 0, dailyLossLimit: 4.0, maxDrawdown: 8.0, minTradingDays: 5, maxTradingDays: 45, profitSplit: 80 },
      { name: 'Starter', challengeType: 'ONE_STEP', accountSize: BigInt(500000 * 100), challengeFee: BigInt(1799 * 100), profitTarget: 8.0, phase2Target: 0, dailyLossLimit: 4.0, maxDrawdown: 8.0, minTradingDays: 5, maxTradingDays: 45, profitSplit: 80 },
      { name: 'Pro', challengeType: 'ONE_STEP', accountSize: BigInt(1000000 * 100), challengeFee: BigInt(3299 * 100), profitTarget: 8.0, phase2Target: 0, dailyLossLimit: 4.0, maxDrawdown: 8.0, minTradingDays: 5, maxTradingDays: 45, profitSplit: 80 },
      { name: 'Elite', challengeType: 'ONE_STEP', accountSize: BigInt(1500000 * 100), challengeFee: BigInt(4799 * 100), profitTarget: 8.0, phase2Target: 0, dailyLossLimit: 4.0, maxDrawdown: 8.0, minTradingDays: 5, maxTradingDays: 45, profitSplit: 80 },
      { name: 'Master', challengeType: 'ONE_STEP', accountSize: BigInt(2000000 * 100), challengeFee: BigInt(5999 * 100), profitTarget: 8.0, phase2Target: 0, dailyLossLimit: 4.0, maxDrawdown: 8.0, minTradingDays: 5, maxTradingDays: 45, profitSplit: 80 },

      // ── TWO STEP ────────────────────────────────────
      { name: 'Seed', challengeType: 'TWO_STEP', accountSize: BigInt(250000 * 100), challengeFee: BigInt(799 * 100), profitTarget: 8.0, phase2Target: 5.0, dailyLossLimit: 5.0, maxDrawdown: 10.0, minTradingDays: 3, maxTradingDays: 60, profitSplit: 80 },
      { name: 'Starter', challengeType: 'TWO_STEP', accountSize: BigInt(500000 * 100), challengeFee: BigInt(1499 * 100), profitTarget: 8.0, phase2Target: 5.0, dailyLossLimit: 5.0, maxDrawdown: 10.0, minTradingDays: 3, maxTradingDays: 60, profitSplit: 80 },
      { name: 'Pro', challengeType: 'TWO_STEP', accountSize: BigInt(1000000 * 100), challengeFee: BigInt(2799 * 100), profitTarget: 8.0, phase2Target: 5.0, dailyLossLimit: 5.0, maxDrawdown: 10.0, minTradingDays: 3, maxTradingDays: 60, profitSplit: 80 },
      { name: 'Elite', challengeType: 'TWO_STEP', accountSize: BigInt(1500000 * 100), challengeFee: BigInt(3999 * 100), profitTarget: 8.0, phase2Target: 5.0, dailyLossLimit: 5.0, maxDrawdown: 10.0, minTradingDays: 3, maxTradingDays: 60, profitSplit: 80 },
      { name: 'Master', challengeType: 'TWO_STEP', accountSize: BigInt(2000000 * 100), challengeFee: BigInt(4999 * 100), profitTarget: 8.0, phase2Target: 5.0, dailyLossLimit: 5.0, maxDrawdown: 10.0, minTradingDays: 3, maxTradingDays: 60, profitSplit: 80 },
    ];

    await prisma.plan.deleteMany();
    const created = await prisma.plan.createMany({ data: plans });

    res.json({ success: true, message: `${created.count} plans seeded successfully!` });
  } catch (error) {
    console.error('Seed plans error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
};

const getPlans = async (req, res) => {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: [{ challengeType: 'asc' }, { accountSize: 'asc' }],
    });

    const formatted = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      type: plan.challengeType, // Alias for frontend
      challengeType: plan.challengeType,
      accountSize: Number(plan.accountSize),
      challengeFee: Number(plan.challengeFee),
      profitTarget: plan.profitTarget,
      phase2Target: plan.phase2Target,
      dailyLossLimit: plan.dailyLossLimit,
      maxDrawdown: plan.maxDrawdown,
      minTradingDays: plan.minTradingDays,
      maxTradingDays: plan.maxTradingDays,
      profitSplit: plan.profitSplit,
      isActive: plan.isActive
    }));

    res.json({ success: true, message: 'Plans fetched successfully!', data: formatted });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
};

const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await prisma.plan.findUnique({ where: { id } });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }

    res.json({
      success: true,
      data: {
        id: plan.id,
        name: plan.name,
        type: plan.challengeType,
        challengeType: plan.challengeType,
        accountSize: Number(plan.accountSize),
        challengeFee: Number(plan.challengeFee),
        profitTarget: plan.profitTarget,
        phase2Target: plan.phase2Target,
        dailyLossLimit: plan.dailyLossLimit,
        maxDrawdown: plan.maxDrawdown,
        minTradingDays: plan.minTradingDays,
        maxTradingDays: plan.maxTradingDays,
        profitSplit: plan.profitSplit,
        isActive: plan.isActive
      },
    });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
};

module.exports = { seedPlans, getPlans, getPlanById };