const { PrismaClient } = require('@prisma/client');
console.log('Class imported');
const prisma = new PrismaClient();
console.log('Client instantiated');
prisma.$connect()
  .then(() => console.log('Successfully connected'))
  .catch(err => console.error('Connection failed:', err))
  .finally(() => prisma.$disconnect());
