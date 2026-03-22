const { pool } = require('./db');
const { v4: uuidv4 } = require('uuid');

console.log('--- PRISMA MOCK LOADED FROM src/utils/prisma.js ---');

const runQuery = async (text, params) => {
  return await pool.query(text, params);
};

const formatResult = (table, row) => {
  if (!row) return null;
  const r = { ...row };
  // Convert BigInt to Number for JSON serialization compatibility
  // Paise values for accounts/trades fit safely in JS Numbers (< 2^53)
  if (table === 'User') r.walletBalance = r.walletBalance ? Number(r.walletBalance) : 0;
  if (table === 'Plan') {
    r.accountSize = Number(r.accountSize);
    r.challengeFee = Number(r.challengeFee);
  }
  if (table === 'Challenge') {
    if (r.accountSize) r.accountSize = Number(r.accountSize);
    if (r.targetProfit) r.targetProfit = Number(r.targetProfit);
    if (r.currentBalance) r.currentBalance = Number(r.currentBalance);
    if (r.startingBalance) r.startingBalance = Number(r.startingBalance);
    if (r.maxDrawdownAmount) r.maxDrawdownAmount = Number(r.maxDrawdownAmount);
    if (r.dailyLossLimitAmount) r.dailyLossLimitAmount = Number(r.dailyLossLimitAmount);
    if (r.peakBalance) r.peakBalance = Number(r.peakBalance);
    if (r.totalPnl) r.totalPnl = Number(r.totalPnl);
    if (r.dailyPnl) r.dailyPnl = Number(r.dailyPnl);
  }
  if (table === 'Trade') {
    if (r.entryPrice) r.entryPrice = Number(r.entryPrice);
    if (r.exitPrice) r.exitPrice = Number(r.exitPrice);
    if (r.size) r.size = Number(r.size);
    if (r.pnl) r.pnl = Number(r.pnl);
  }
  if (table === 'Payout') {
    if (r.amountRequested) r.amountRequested = Number(r.amountRequested);
    if (r.tdsAmount) r.tdsAmount = Number(r.tdsAmount);
    if (r.netPayoutAmount) r.netPayoutAmount = Number(r.netPayoutAmount);
    if (r.feeRefund) r.feeRefund = Number(r.feeRefund);
  }
  return r;
};

const createMockModel = (table) => ({
  findUnique: async ({ where, include }) => {
    const keys = Object.keys(where);
    const text = `SELECT * FROM "${table}" WHERE "${keys[0]}" = $1`;
    const res = await runQuery(text, [where[keys[0]]]);
    const row = res.rows[0];
    if (!row) return null;
    const result = formatResult(table, row);
    
    if (include) {
      for (const key of Object.keys(include)) {
        // Simple 1-level include support
        const relatedTable = key.charAt(0).toUpperCase() + key.slice(1);
        const foreignKey = key + 'Id';
        if (row[foreignKey]) {
          const relRes = await runQuery(`SELECT * FROM "${relatedTable}" WHERE "id" = $1`, [row[foreignKey]]);
          result[key] = formatResult(relatedTable, relRes.rows[0]);
        }
      }
    }
    return result;
  },
  findFirst: async ({ where = {}, include }) => {
    let text = `SELECT * FROM "${table}"`;
    const params = [];
    if (where.OR) {
        const clauses = where.OR.map((o, i) => {
            const k = Object.keys(o)[0];
            params.push(o[k]);
            return `"${k}" = $${params.length}`;
        });
        text += ` WHERE ${clauses.join(' OR ')}`;
    } else {
        const keys = Object.keys(where);
        if (keys.length > 0) {
            const clauses = keys.map((k, i) => {
                const val = where[k];
                if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
                    const op = Object.keys(val)[0];
                    const pgOp = { gt: '>', lt: '<', gte: '>=', lte: '<=' }[op] || '=';
                    params.push(val[op]);
                    return `"${k}" ${pgOp} $${params.length}`;
                }
                params.push(val);
                return `"${k}" = $${params.length}`;
            });
            text += ` WHERE ${clauses.join(' AND ')}`;
        }
    }
    text += ' LIMIT 1';
    const res = await runQuery(text, params);
    const row = res.rows[0];
    if (!row) return null;
    const result = formatResult(table, row);

    if (include) {
      for (const key of Object.keys(include)) {
        const relatedTable = key.charAt(0).toUpperCase() + key.slice(1);
        const foreignKey = key + 'Id';
        if (row[foreignKey]) {
          const relRes = await runQuery(`SELECT * FROM "${relatedTable}" WHERE "id" = $1`, [row[foreignKey]]);
          result[key] = formatResult(relatedTable, relRes.rows[0]);
        }
      }
    }
    return result;
  },
  findMany: async ({ where = {}, orderBy, include } = {}) => {
    let text = `SELECT * FROM "${table}"`;
    const params = [];
    const keys = Object.keys(where);
    if (keys.length > 0) {
        const clauses = keys.map((k, i) => {
            params.push(where[k]);
            return `"${k}" = $${params.length}`;
        });
        text += ` WHERE ${clauses.join(' AND ')}`;
    }
    if (orderBy) {
        const ob = Array.isArray(orderBy) ? orderBy[0] : orderBy;
        const key = Object.keys(ob)[0];
        text += ` ORDER BY "${key}" ${ob[key].toUpperCase()}`;
    }
    const res = await runQuery(text, params);
    const rows = res.rows.map(r => formatResult(table, r));

    if (include && rows.length > 0) {
      for (const row of rows) {
        for (const key of Object.keys(include)) {
          const relatedTable = key.charAt(0).toUpperCase() + key.slice(1);
          const foreignKey = key + 'Id';
          if (row[foreignKey]) {
            const relRes = await runQuery(`SELECT * FROM "${relatedTable}" WHERE "id" = $1`, [row[foreignKey]]);
            row[key] = formatResult(relatedTable, relRes.rows[0]);
          }
        }
      }
    }
    return rows;
  },
  create: async ({ data }) => {
    const now = new Date();
    const d = { id: uuidv4(), createdAt: now, ...data };
    if (!['EmailVerification', 'AuditLog'].includes(table)) {
        d.updatedAt = now;
    }
    const cols = Object.keys(d).map(k => `"${k}"`).join(', ');
    const vals = Object.values(d);
    const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
    const res = await runQuery(`INSERT INTO "${table}" (${cols}) VALUES (${placeholders}) RETURNING *`, vals);
    return formatResult(table, res.rows[0]);
  },
  update: async ({ where, data }) => {
    const d = { ...data };
    if (!['EmailVerification', 'AuditLog'].includes(table)) {
        d.updatedAt = new Date();
    }
    const keys = Object.keys(d);
    const sets = [];
    const params = [];
    keys.forEach((k, i) => {
        const val = d[k];
        if (val && typeof val === 'object' && val.increment) {
            sets.push(`"${k}" = "${k}" + $${i + 1}`);
            params.push(val.increment);
        } else {
            sets.push(`"${k}" = $${i + 1}`);
            params.push(val);
        }
    });
    params.push(where.id || where.email); // Basic fallback for where
    const whereKey = where.id ? 'id' : 'email';
    const res = await runQuery(`UPDATE "${table}" SET ${sets.join(', ')} WHERE ${whereKey} = $${params.length} RETURNING *`, params);
    return formatResult(table, res.rows[0]);
  },
  deleteMany: async () => {
    return await runQuery(`DELETE FROM "${table}"`);
  },
  createMany: async ({ data }) => {
    const now = new Date();
    for (const item of data) {
      const d = { id: uuidv4(), createdAt: now, ...item };
      if (!['EmailVerification', 'AuditLog'].includes(table)) {
          d.updatedAt = now;
      }
      const cols = Object.keys(d).map(k => `"${k}"`).join(', ');
      const vals = Object.values(d);
      const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
      await runQuery(`INSERT INTO "${table}" (${cols}) VALUES (${placeholders})`, vals);
    }
    return { count: data.length };
  },
  count: async ({ where = {} } = {}) => {
    let text = `SELECT COUNT(*) FROM "${table}"`;
    const params = [];
    const keys = Object.keys(where);
    if (keys.length > 0) {
        const clauses = keys.map((k, i) => {
            params.push(where[k]);
            return `"${k}" = $${params.length}`;
        });
        text += ` WHERE ${clauses.join(' AND ')}`;
    }
    const res = await runQuery(text, params);
    return parseInt(res.rows[0].count);
  }
});

const prismaMock = {
  user: createMockModel('User'),
  plan: createMockModel('Plan'),
  challenge: createMockModel('Challenge'),
  trade: createMockModel('Trade'),
  payment: createMockModel('Payment'),
  payout: createMockModel('Payout'),
  emailVerification: createMockModel('EmailVerification'),
  auditLog: createMockModel('AuditLog'),
  $connect: async () => {},
  $disconnect: async () => {},
  $transaction: async (calls) => {
    const results = [];
    for (const call of calls) {
      results.push(await call);
    }
    return results;
  }
};

console.warn('⚠️ WARNING: Using robust raw PG fallback due to Prisma initialization failure on Node 25');
module.exports = prismaMock;
