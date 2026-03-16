const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const userCount = await prisma.user.count();
    console.log('Total Users:', userCount);
    
    const users = await prisma.user.findMany({ select: { email: true, role: true } });
    console.log('Users list:', JSON.stringify(users, null, 2));

    const planCount = await prisma.plan.count();
    console.log('Total Plans:', planCount);

  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
