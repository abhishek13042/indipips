const prisma = require('../utils/prisma');
console.log('Testing prisma mock resolution...');
console.log('Keys in prisma object:', Object.keys(prisma));
if (prisma.user && prisma.user.findUnique) {
    console.log('✅ prisma.user.findUnique exists');
} else {
    console.log('❌ prisma.user.findUnique NOT found');
}
if (prisma.plan && prisma.plan.createMany) {
    console.log('✅ prisma.plan.createMany exists');
} else {
    console.log('❌ prisma.plan.createMany NOT found');
}
process.exit(0);
