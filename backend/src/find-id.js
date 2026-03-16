const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function findId() {
  const challenge = await prisma.challenge.findFirst();
  console.log('CHALLENGE_ID:', challenge?.id);
  await prisma.$disconnect();
}
findId();
