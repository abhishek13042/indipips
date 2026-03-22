require('dotenv').config();
const { query } = require('./src/utils/db');

async function checkUser() {
  try {
    const result = await query('SELECT id, email FROM "User"');
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (err) {
    console.error(err);
  }
}

checkUser();
