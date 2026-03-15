const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
  connectionString: 'postgresql://postgres:indipips123@localhost:5432/indipips_db'
});
const prisma = new PrismaClient({ adapter });

// ── Seed Plans (run once) ──────────────────────────
const seedPlans = async (req, res) => {
  try {
    const plans = [
      {
        name: 'Seed',
        accountSize: BigInt(250000 * 100),
        challengeFee: BigInt(999 * 100),
        profitTarget: 8.0,
        dailyLossLimit: 4.0,
        maxDrawdown: 8.0,
        minTradingDays: 5,
        maxTradingDays: 45,
      },
      {
        name: 'Starter',
        accountSize: BigInt(500000 * 100),
        challengeFee: BigInt(1799 * 100),
        profitTarget: 8.0,
        dailyLossLimit: 4.0,
        maxDrawdown: 8.0,
        minTradingDays: 5,
        maxTradingDays: 45,
      },
      {
        name: 'Pro',
        accountSize: BigInt(1000000 * 100),
        challengeFee: BigInt(3299 * 100),
        profitTarget: 8.0,
        dailyLossLimit: 4.0,
        maxDrawdown: 8.0,
        minTradingDays: 5,
        maxTradingDays: 45,
      },
      {
        name: 'Elite',
        accountSize: BigInt(1500000 * 100),
        challengeFee: BigInt(4799 * 100),
        profitTarget: 8.0,
        dailyLossLimit: 4.0,
        maxDrawdown: 8.0,
        minTradingDays: 5,
        maxTradingDays: 45,
      },
      {
        name: 'Master',
        accountSize: BigInt(2000000 * 100),
        challengeFee: BigInt(5999 * 100),
        profitTarget: 8.0,
        dailyLossLimit: 4.0,
        maxDrawdown: 8.0,
        minTradingDays: 5,
        maxTradingDays: 45,
      },
    ];

    // Delete existing plans first
    await prisma.plan.deleteMany();

    // Create all plans
    const created = await prisma.plan.createMany({ data: plans });

    res.json({
      success: true,
      message: `${created.count} plans seeded successfully!`,
    });
  } catch (error) {
    console.error('Seed plans error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
};

// ── Get All Plans ──────────────────────────────────
const getPlans = async (req, res) => {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { accountSize: 'asc' },
    });

    const formatted = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      accountSize: Number(plan.accountSize) / 100,
      challengeFee: Number(plan.challengeFee) / 100,
      profitTarget: plan.profitTarget,
      dailyLossLimit: plan.dailyLossLimit,
      maxDrawdown: plan.maxDrawdown,
      minTradingDays: plan.minTradingDays,
      maxTradingDays: plan.maxTradingDays,
      profitTargetAmount: (Number(plan.accountSize) / 100) * (plan.profitTarget / 100),
      dailyLossAmount: (Number(plan.accountSize) / 100) * (plan.dailyLossLimit / 100),
      maxDrawdownAmount: (Number(plan.accountSize) / 100) * (plan.maxDrawdown / 100),
    }));

    res.json({
      success: true,
      message: 'Plans fetched successfully!',
      data: formatted,
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
};

// ── Get Single Plan ────────────────────────────────
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
        accountSize: Number(plan.accountSize) / 100,
        challengeFee: Number(plan.challengeFee) / 100,
        profitTarget: plan.profitTarget,
        dailyLossLimit: plan.dailyLossLimit,
        maxDrawdown: plan.maxDrawdown,
        minTradingDays: plan.minTradingDays,
        maxTradingDays: plan.maxTradingDays,
      },
    });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
};

module.exports = { seedPlans, getPlans, getPlanById };