require('dotenv').config();
const { query } = require('./src/utils/db');

async function testInsert() {
  try {
    const res1 = await query('SELECT count(*) FROM "Challenge"');
    console.log('Challenge Count:', res1.rows[0].count);
    const res2 = await query('SELECT count(*) FROM "User"');
    console.log('User Count:', res2.rows[0].count);
    const res3 = await query('SELECT count(*) FROM "Plan"');
    console.log('Plan Count:', res3.rows[0].count);
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

testInsert();
