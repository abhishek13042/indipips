const prisma = require('./utils/prisma');

async function debugPlans() {
  const plans = await prisma.plan.findMany();
  console.log(JSON.stringify(plans.map(p => ({
    name: p.name,
    type: p.challengeType,
    accountSize: p.accountSize.toString(),
    challengeFee: p.challengeFee.toString()
  })), null, 2));
}

debugPlans()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
