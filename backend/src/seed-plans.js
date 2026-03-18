const prisma = require('./utils/prisma');

async function seedPlans() {
  console.log('🌱 Seeding Indipips Localized Plans...');
  
  const plans = [
    // Two Step Plans
    { name: 'IndiPips 5L', challengeType: 'TWO_STEP', accountSize: 500000, challengeFee: 4150, profitTarget: 8, phase2Target: 5, dailyLossLimit: 5, maxDrawdown: 10, minTradingDays: 0, maxTradingDays: 365, profitSplit: 80 },
    { name: 'IndiPips 10L', challengeType: 'TWO_STEP', accountSize: 1000000, challengeFee: 8300, profitTarget: 8, phase2Target: 5, dailyLossLimit: 5, maxDrawdown: 10, minTradingDays: 0, maxTradingDays: 365, profitSplit: 80 },
    { name: 'IndiPips 25L', challengeType: 'TWO_STEP', accountSize: 2500000, challengeFee: 20750, profitTarget: 8, phase2Target: 5, dailyLossLimit: 5, maxDrawdown: 10, minTradingDays: 0, maxTradingDays: 365, profitSplit: 80 },
    { name: 'IndiPips 50L', challengeType: 'TWO_STEP', accountSize: 5000000, challengeFee: 41500, profitTarget: 8, phase2Target: 5, dailyLossLimit: 5, maxDrawdown: 10, minTradingDays: 0, maxTradingDays: 365, profitSplit: 80 },
    { name: 'IndiPips 1C', challengeType: 'TWO_STEP', accountSize: 10000000, challengeFee: 83000, profitTarget: 8, phase2Target: 5, dailyLossLimit: 5, maxDrawdown: 10, minTradingDays: 0, maxTradingDays: 365, profitSplit: 80 },

    // One Step Plans
    { name: 'IndiPips 5L (1-Step)', challengeType: 'ONE_STEP', accountSize: 500000, challengeFee: 4500, profitTarget: 10, dailyLossLimit: 4, maxDrawdown: 6, minTradingDays: 0, maxTradingDays: 365, profitSplit: 80 },
    { name: 'IndiPips 10L (1-Step)', challengeType: 'ONE_STEP', accountSize: 1000000, challengeFee: 9000, profitTarget: 10, dailyLossLimit: 4, maxDrawdown: 6, minTradingDays: 0, maxTradingDays: 365, profitSplit: 80 },
    { name: 'IndiPips 25L (1-Step)', challengeType: 'ONE_STEP', accountSize: 2500000, challengeFee: 22000, profitTarget: 10, dailyLossLimit: 4, maxDrawdown: 6, minTradingDays: 0, maxTradingDays: 365, profitSplit: 80 },
    { name: 'IndiPips 50L (1-Step)', challengeType: 'ONE_STEP', accountSize: 5000000, challengeFee: 44000, profitTarget: 10, dailyLossLimit: 4, maxDrawdown: 6, minTradingDays: 0, maxTradingDays: 365, profitSplit: 80 },
    { name: 'IndiPips 1C (1-Step)', challengeType: 'ONE_STEP', accountSize: 10000000, challengeFee: 88000, profitTarget: 10, dailyLossLimit: 4, maxDrawdown: 6, minTradingDays: 0, maxTradingDays: 365, profitSplit: 80 },
  ];

  for (const p of plans) {
    await prisma.plan.upsert({
      where: { id: p.id || 'placeholder' }, // This won't match, creating new
      create: {
        ...p,
        accountSize: BigInt(p.accountSize),
        challengeFee: BigInt(p.challengeFee),
      },
      update: {
        ...p,
        accountSize: BigInt(p.accountSize),
        challengeFee: BigInt(p.challengeFee),
      },
      // Since I don't have IDs, I'll use a better approach: find by name
    }).catch(async () => {
         const existing = await prisma.plan.findFirst({ where: { name: p.name, challengeType: p.challengeType } });
         if (!existing) {
            await prisma.plan.create({
                data: {
                    ...p,
                    accountSize: BigInt(p.accountSize),
                    challengeFee: BigInt(p.challengeFee),
                }
            });
         }
    });
  }

  console.log('✅ Plans seeded successfully!');
}

seedPlans()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
