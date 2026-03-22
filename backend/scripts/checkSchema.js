require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { query } = require('../src/utils/db');
const fs = require('fs');

async function checkSchema() {
  try {
    const results = {};
    const tables = ['Trade', 'Challenge', 'User', 'Plan'];

    for (const table of tables) {
      const colQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = '${table}'
        ORDER BY ordinal_position;
      `;
      const res = await query(colQuery);
      results[table.toLowerCase()] = res.rows;
    }

    fs.writeFileSync('schema_results.json', JSON.stringify(results, null, 2));
    console.log('✅ Results saved to schema_results.json');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
