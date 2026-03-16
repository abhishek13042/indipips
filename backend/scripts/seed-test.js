const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seed() {
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@indipips.com' },
    update: {},
    create: {
      email: 'admin@indipips.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Indipips',
      role: 'ADMIN',
      kycStatus: 'VERIFIED'
    }
  });

  console.log('✅ Admin user created/verified:', admin.email);

  // Ensure at least one challenge exists for testing
  const plan = await prisma.plan.findFirst();
  if (plan) {
    const challenge = await prisma.challenge.create({
      data: {
        userId: admin.id,
        planId: plan.id,
        accountSize: 10000000n, // $100k
        currentBalance: 11000000n, // $110k (Profitable)
        totalPnl: 1000000n,
        status: 'ACTIVE',
        nodeAccountId: 'IP-SIMULATE'
      }
    });
    console.log('✅ Simulation Challenge created:', challenge.nodeAccountId);
  }

  await prisma.$disconnect();
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
