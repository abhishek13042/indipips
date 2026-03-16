const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = new Client({
    connectionString: "postgresql://postgres:indipips123@localhost:5432/indipips_db"
  });

  try {
    await client.connect();
    console.log('Connected to DB via pg');

    const hashedPassword = await bcrypt.hash('Password123!', 10);
    
    // Check if user exists
    const checkUser = await client.query("SELECT id FROM \"User\" WHERE email = 'admin@indipips.com'");
    
    let userId;
    if (checkUser.rows.length === 0) {
      const insertUser = await client.query(
        "INSERT INTO \"User\" (id, email, password, \"firstName\", \"lastName\", role, \"kycStatus\", \"createdAt\", \"updatedAt\") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id",
        [crypto.randomUUID ? crypto.randomUUID() : 'admin-id-123', 'admin@indipips.com', hashedPassword, 'Admin', 'Indipips', 'ADMIN', 'VERIFIED']
      );
      userId = insertUser.rows[0].id;
      console.log('✅ Admin user created.');
    } else {
      userId = checkUser.rows[0].id;
      console.log('✅ Admin user already exists.');
    }

    // Ensure a plan exists
    const checkPlan = await client.query('SELECT id FROM "Plan" LIMIT 1');
    if (checkPlan.rows.length > 0) {
      const planId = checkPlan.rows[0].id;
      
      // Upsert a challenge
      await client.query(
        "INSERT INTO \"Challenge\" (id, \"userId\", \"planId\", \"accountSize\", \"currentBalance\", \"totalPnl\", status, \"nodeAccountId\", \"createdAt\", \"updatedAt\", \"expiryDate\", \"daysTraded\") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), NOW() + interval '30 days', 0) ON CONFLICT (id) DO NOTHING",
        ['sim-challenge-id', userId, planId, 10000000, 11000000, 1000000, 'ACTIVE', 'IP-SIMULATE']
      );
      console.log('✅ Simulation Challenge ensured.');
    } else {
      console.warn('⚠️ No plans found in DB. Challenge creation skipped.');
    }

  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await client.end();
  }
}

seed();
