const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const main = async () => {
  console.log('🌱 Seeding 15 Production Plans...');
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
      // ZERO STEP (Instant Funded)
      [uuidv4(), 'Seed', 'ZERO_STEP', 25000000, 149900, 0, 0, 3.0, 5.0, 0, 0, 80, true],
      [uuidv4(), 'Starter', 'ZERO_STEP', 50000000, 269900, 0, 0, 3.0, 5.0, 0, 0, 80, true],
      [uuidv4(), 'Pro', 'ZERO_STEP', 100000000, 499900, 0, 0, 3.0, 5.0, 0, 0, 80, true],
      [uuidv4(), 'Elite', 'ZERO_STEP', 150000000, 719900, 0, 0, 3.0, 5.0, 0, 0, 80, true],
      [uuidv4(), 'Master', 'ZERO_STEP', 200000000, 899900, 0, 0, 3.0, 5.0, 0, 0, 80, true],

      // ONE STEP
      [uuidv4(), 'Seed', 'ONE_STEP', 25000000, 99900, 8.0, 0, 4.0, 8.0, 5, 45, 80, true],
      [uuidv4(), 'Starter', 'ONE_STEP', 50000000, 179900, 8.0, 0, 4.0, 8.0, 5, 45, 80, true],
      [uuidv4(), 'Pro', 'ONE_STEP', 100000000, 329900, 8.0, 0, 4.0, 8.0, 5, 45, 80, true],
      [uuidv4(), 'Elite', 'ONE_STEP', 150000000, 479900, 8.0, 0, 4.0, 8.0, 5, 45, 80, true],
      [uuidv4(), 'Master', 'ONE_STEP', 200000000, 599900, 8.0, 0, 4.0, 8.0, 5, 45, 80, true],

      // TWO STEP
      [uuidv4(), 'Seed', 'TWO_STEP', 25000000, 79900, 8.0, 5.0, 5.0, 10.0, 3, 60, 80, true],
      [uuidv4(), 'Starter', 'TWO_STEP', 50000000, 149900, 8.0, 5.0, 5.0, 10.0, 3, 60, 80, true],
      [uuidv4(), 'Pro', 'TWO_STEP', 100000000, 279900, 8.0, 5.0, 5.0, 10.0, 3, 60, 80, true],
      [uuidv4(), 'Elite', 'TWO_STEP', 150000000, 399900, 8.0, 5.0, 5.0, 10.0, 3, 60, 80, true],
      [uuidv4(), 'Master', 'TWO_STEP', 200000000, 499900, 8.0, 5.0, 5.0, 10.0, 3, 60, 80, true]
    ];

    for (const p of plans) {
      await client.query(query, p);
    }

    console.log('✅ ALL 15 Production Plans seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ SEEDING FAILED:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
};

main();
