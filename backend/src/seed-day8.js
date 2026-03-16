require('dotenv').config();
const prisma = require('./utils/prisma');

async function seed() {
  console.log('🌱 Seeding Day 8 Test Data...');
  try {
    // 1. Get or create user
    let user = await prisma.user.findUnique({ where: { email: 'tester@indipips.com' } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          fullName: 'Day 8 Tester',
          email: 'tester@indipips.com',
          referralCode: 'TESTER8',
        }
      });
    }

    // 2. Get a plan
    const plan = await prisma.plan.findFirst();
    if (!plan) {
      console.error('❌ No plan found. Run initial plan seed first.');
      return;
    }

    // 3. Create active challenge
    const challenge = await prisma.challenge.create({
      data: {
        userId: user.id,
        planId: plan.id,
        accountNodeId: 'IP-TEST-D8-' + Math.floor(Math.random() * 1000),
        accountSize: plan.accountSize,
        currentBalance: plan.accountSize,
        peakBalance: plan.accountSize,
        dailyStartingBalance: plan.accountSize,
        status: 'ACTIVE',
        phase: 1,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    });

    console.log(`✅ Seeded Challenge: ${challenge.id} for user ${user.email}`);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
