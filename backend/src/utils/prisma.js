const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

console.log('--- PRISMA MOCK LOADED FROM src/utils/prisma.js ---');

const runQuery = async (text, params) => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    await client.end();
  }
};

const formatResult = (table, row) => {
  if (!row) return null;
  const r = { ...row };
  // BigInt conversions
  if (table === 'User') r.walletBalance = r.walletBalance ? BigInt(r.walletBalance) : 0n;
  if (table === 'Plan') {
    r.accountSize = BigInt(r.accountSize);
    r.challengeFee = BigInt(r.challengeFee);
  }
  if (table === 'Challenge') {
    if (r.accountSize) r.accountSize = BigInt(r.accountSize);
    if (r.targetProfit) r.targetProfit = BigInt(r.targetProfit);
    if (r.currentBalance) r.currentBalance = BigInt(r.currentBalance);
    if (r.startingBalance) r.startingBalance = BigInt(r.startingBalance);
    if (r.maxDrawdownAmount) r.maxDrawdownAmount = BigInt(r.maxDrawdownAmount);
    if (r.dailyLossLimitAmount) r.dailyLossLimitAmount = BigInt(r.dailyLossLimitAmount);
  }
  if (table === 'Trade') {
    if (r.entryPrice) r.entryPrice = BigInt(r.entryPrice);
    if (r.exitPrice) r.exitPrice = BigInt(r.exitPrice);
    if (r.size) r.size = BigInt(r.size);
    if (r.pnl) r.pnl = BigInt(r.pnl);
  }
  if (table === 'Payout') {
    if (r.amountRequested) r.amountRequested = BigInt(r.amountRequested);
    if (r.tdsAmount) r.tdsAmount = BigInt(r.tdsAmount);
    if (r.netPayoutAmount) r.netPayoutAmount = BigInt(r.netPayoutAmount);
    if (r.feeRefund) r.feeRefund = BigInt(r.feeRefund);
  }
  return r;
};

const createMockModel = (table) => ({
  findUnique: async ({ where }) => {
    const keys = Object.keys(where);
    const text = `SELECT * FROM "${table}" WHERE "${keys[0]}" = $1`;
    const res = await runQuery(text, [where[keys[0]]]);
    return formatResult(table, res.rows[0]);
  },
  findFirst: async ({ where = {} }) => {
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
    return formatResult(table, res.rows[0]);
  },
  findMany: async ({ where = {}, orderBy } = {}) => {
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
    return res.rows.map(r => formatResult(table, r));
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
