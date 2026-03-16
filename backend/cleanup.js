const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database...');
  try {
    await prisma.$connect();
    console.log('Connected successfully!');
    
    console.log('Deleting trades...');
    const trades = await prisma.trade.deleteMany();
    console.log(`Deleted ${trades.count} trades.`);
    
    console.log('Deleting challenges...');
    const challenges = await prisma.challenge.deleteMany();
    console.log(`Deleted ${challenges.count} challenges.`);
    
  } catch (error) {
    console.error('CRITICAL ERROR DURING CLEANUP:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected.');
  }
}

main();
