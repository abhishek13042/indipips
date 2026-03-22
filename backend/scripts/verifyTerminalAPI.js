require('dotenv').config();
const { query } = require('../src/utils/db');

async function verify() {
  console.log('Verifying Challenge API Data Structures...');
  
  try {
    const userResult = await query('SELECT id FROM "User" WHERE email = $1', ['trader@indipips.com']);
    if (userResult.rows.length === 0) {
      console.error('Test user not found');
      return;
    }
    const userId = userResult.rows[0].id;

    // Simulate the logic in getMyChallenges
    const challenges = await query(`
      SELECT c.*, p.name as "planName", p."challengeType" as "planType", 
             p."profitTarget", p."dailyLossLimit", p."maxDrawdown"
      FROM "Challenge" c
      JOIN "Plan" p ON c."planId" = p.id
      WHERE c."userId" = $1
      ORDER BY c."createdAt" DESC
    `, [userId]);

    console.log(`Found ${challenges.rows.length} challenge(s)`);

    challenges.rows.forEach(c => {
      const accountSize = Number(c.accountSize) / 100;
      const totalPnl = Number(c.totalPnl) / 100;
      const profitTargetAmount = accountSize * (c.profitTarget / 100);
      const profitTargetPct = profitTargetAmount > 0 
        ? Math.min(100, (totalPnl / profitTargetAmount) * 100).toFixed(1)
        : '0.0';

      console.log('--- Challenge ---');
      console.log('ID:', c.id);
      console.log('Plan:', c.planName);
      console.log('Account Size:', accountSize);
      console.log('Total P&L:', totalPnl);
      console.log('Profit Target Amount:', profitTargetAmount);
      console.log('Profit Target %:', profitTargetPct);
      console.log('Daily Loss Pct:', ((Math.abs(Number(c.dailyPnl)/100) / accountSize) * 100).toFixed(2));
    });

    console.log('✅ Structure verification complete.');
  } catch (err) {
    console.error('Verification failed:', err);
  }
}

verify();
