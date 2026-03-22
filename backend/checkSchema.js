require('dotenv').config();
const { query } = require('./src/utils/db');

async function checkSchema() {
  try {
    const result = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    result.rows.forEach(r => console.log('- ' + r.table_name));
  } catch (err) {
    console.error(err);
  }
}

checkSchema();
