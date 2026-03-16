const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:indipips123@localhost:5432/indipips_db';

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'admin@indipips.com';
  const password = 'Admin@1234';
  
  console.log('Checking for user:', email);
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (user) {
    console.log('User found:', user.email);
    console.log('Updating password hash...');
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email },
      data: { passwordHash, isActive: true, role: 'ADMIN' }
    });
    console.log('Password updated successfully.');
  } else {
    console.log('User not found. Creating admin user...');
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        fullName: 'Abhishek Admin',
        email,
        phone: '9999999999',
        passwordHash,
        role: 'ADMIN',
        referralCode: 'ADMIN001',
        isActive: true
      }
    });
    console.log('Admin user created successfully.');
  }
}

main()
  .catch(e => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
