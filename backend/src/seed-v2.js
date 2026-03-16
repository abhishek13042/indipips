const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function seed() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@indipips.com' }
    });

    if (!user) {
      console.log('Admin user not found!');
      return;
    }

    const plan = await prisma.plan.findFirst();
    if (!plan) {
      console.log('No plan found to link challenge to!');
      return;
    }

    const challenge = await prisma.challenge.create({
      data: {
        userId: user.id,
        planId: plan.id,
        accountNodeId: 'IP-20230316',
        accountSize: plan.accountSize,
        currentBalance: plan.accountSize,
        peakBalance: plan.accountSize,
        status: 'ACTIVE',
        phase: 1,
        totalPnl: BigInt(0),
        dailyPnl: BigInt(0),
        daysTraded: 0,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        trades: {
          create: [
            {
              instrument: 'BTCUSD',
              tradeType: 'BUY',
              quantity: 1,
              entryPrice: BigInt(6500000),
              exitPrice: BigInt(6550000),
              pnl: BigInt(50000),
              tradeDate: new Date(),
              entryTime: new Date(Date.now() - 3600000),
              exitTime: new Date(),
              userId: user.id
            }
          ]
        }
      }
    });

    console.log('Successfully seeded challenge for admin:', challenge.id, '| Node ID:', challenge.accountNodeId);
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
