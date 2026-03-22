const bcrypt = require('bcryptjs');
const prisma = require('./utils/prisma');

async function seedTestUsers() {
  try {
    const passwordHashTest = await bcrypt.hash('Test@1234', 10);
    const passwordHashAdmin = await bcrypt.hash('Admin@1234', 10);

    // Seed test@indipips.com
    let testUser = await prisma.user.findFirst({ where: { email: 'test@indipips.com' } });
    if (testUser) {
      await prisma.user.update({ where: { id: testUser.id }, data: { passwordHash: passwordHashTest, emailVerified: true } });
    } else {
      await prisma.user.create({ data: {
        email: 'test@indipips.com', fullName: 'Test User', passwordHash: passwordHashTest, role: 'TRADER', kycStatus: 'VERIFIED', referralCode: 'TESTREF123', emailVerified: true
      }});
    }
    console.log('✅ test@indipips.com password set to Test@1234');

    // Seed admin@indipips.com
    let adminUser = await prisma.user.findFirst({ where: { email: 'admin@indipips.com' } });
    if (adminUser) {
      await prisma.user.update({ where: { id: adminUser.id }, data: { passwordHash: passwordHashAdmin, role: 'ADMIN', emailVerified: true } });
    } else {
      await prisma.user.create({ data: {
        email: 'admin@indipips.com', fullName: 'Admin User', passwordHash: passwordHashAdmin, role: 'ADMIN', kycStatus: 'VERIFIED', referralCode: 'ADMINREF123', emailVerified: true
      }});
    }
    console.log('✅ admin@indipips.com password set to Admin@1234');

  } catch (error) {
    console.log('Error seeding users:', error.message);
    if (error.stack) console.log(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestUsers();
