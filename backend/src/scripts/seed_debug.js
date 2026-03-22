const { Client } = require('pg');
require('dotenv').config();

const main = async () => {
  console.log('🌱 Seeding database with hardcoded SQL...');
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    
    // Cleanup
    await client.query('DELETE FROM "Plan"');

    const query = `
      INSERT INTO "Plan" (
        "id", "name", "challengeType", "accountSize", "challengeFee", 
        "profitTarget", "phase2Target", "dailyLossLimit", "maxDrawdown", 
        "minTradingDays", "maxTradingDays", "profitSplit", "isActive"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      )
    `;

    const plans = [
        ['plan1', 'Seed', 'ZERO_STEP', 25000000, 149900, 0, 0, 3, 5, 0, 0, 80, true],
        ['plan2', 'Starter', 'ZERO_STEP', 50000000, 269900, 0, 0, 3, 5, 0, 0, 80, true]
    ];

    for (const p of plans) {
      await client.query(query, p);
    }

    console.log('✅ Hardcoded plans seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ SEEDING FAILED:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
};

main();
