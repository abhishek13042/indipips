const { Client } = require('pg');
require('dotenv').config();

// Temporary wrapper to unblock login and basic dashboard while Prisma is broken on Node 25
const prismaMock = {
  user: {
    findUnique: async ({ where }) => {
      const client = new Client({ connectionString: process.env.DATABASE_URL });
      await client.connect();
      try {
        const query = where.id 
          ? 'SELECT * FROM "User" WHERE id = $1' 
          : 'SELECT * FROM "User" WHERE email = $1';
        const res = await client.query(query, [where.id || where.email]);
        if (res.rows[0]) {
          const u = res.rows[0];
          return { ...u, walletBalance: u.walletBalance ? BigInt(u.walletBalance) : 0n };
        }
        return null;
      } finally { await client.end(); }
    },
    findFirst: async ({ where }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const res = await client.query('SELECT * FROM "User" WHERE "googleId" = $1 OR email = $2 LIMIT 1', [where.OR[0].googleId, where.OR[1].email]);
            return res.rows[0] ? { ...res.rows[0], walletBalance: BigInt(res.rows[0].walletBalance || 0) } : null;
        } finally { await client.end(); }
    },
    create: async ({ data }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const cols = Object.keys(data).map(k => `"${k}"`).join(', ');
            const vals = Object.values(data);
            const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
            const res = await client.query(`INSERT INTO "User" (${cols}) VALUES (${placeholders}) RETURNING *`, vals);
            return res.rows[0];
        } finally { await client.end(); }
    },
    update: async ({ where, data }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const keys = Object.keys(data);
            const sets = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
            const vals = [...Object.values(data), where.id];
            const res = await client.query(`UPDATE "User" SET ${sets} WHERE id = $${vals.length} RETURNING *`, vals);
            return res.rows[0];
        } finally { await client.end(); }
    }
  },
  plan: {
    findMany: async ({ where = {} }) => {
      const client = new Client({ connectionString: process.env.DATABASE_URL });
      await client.connect();
      try {
        const res = await client.query('SELECT * FROM "Plan" WHERE "isActive" = $1 ORDER BY "challengeType" ASC, "accountSize" ASC', [where.isActive ?? true]);
        return res.rows.map(p => ({ ...p, accountSize: BigInt(p.accountSize), challengeFee: BigInt(p.challengeFee) }));
      } finally { await client.end(); }
    },
    findUnique: async ({ where }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const res = await client.query('SELECT * FROM "Plan" WHERE id = $1', [where.id]);
            return res.rows[0] ? { ...res.rows[0], accountSize: BigInt(res.rows[0].accountSize), challengeFee: BigInt(res.rows[0].challengeFee) } : null;
        } finally { await client.end(); }
    },
    findFirst: async ({ where }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const res = await client.query('SELECT * FROM "Plan" WHERE "challengeType" = $1 AND "accountSize" = $2 AND "isActive" = $3 LIMIT 1', [where.challengeType, where.accountSize, where.isActive]);
            return res.rows[0] ? { ...res.rows[0], accountSize: BigInt(res.rows[0].accountSize), challengeFee: BigInt(res.rows[0].challengeFee) } : null;
        } finally { await client.end(); }
    },
    deleteMany: async () => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try { return await client.query('DELETE FROM "Plan"'); } finally { await client.end(); }
    },
    createMany: async ({ data }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            for (const item of data) {
                const cols = Object.keys(item).map(k => `"${k}"`).join(', ');
                const vals = Object.values(item);
                const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
                await client.query(`INSERT INTO "Plan" (${cols}) VALUES (${placeholders})`, vals);
            }
            return { count: data.length };
        } finally { await client.end(); }
    }
  },
  challenge: {
    findUnique: async ({ where, include }) => {
      const client = new Client({ connectionString: process.env.DATABASE_URL });
      await client.connect();
      try {
        const res = await client.query('SELECT * FROM "Challenge" WHERE id = $1', [where.id]);
        if (!res.rows[0]) return null;
        const c = res.rows[0];
        const challenge = { 
            ...c, 
            accountSize: BigInt(c.accountSize), 
            currentBalance: BigInt(c.currentBalance),
            peakBalance: BigInt(c.peakBalance),
            totalPnl: BigInt(c.totalPnl || 0),
            dailyPnl: BigInt(c.dailyPnl || 0)
        };
        if (include?.user) {
            const uRes = await client.query('SELECT * FROM "User" WHERE id = $1', [c.userId]);
            challenge.user = uRes.rows[0];
        }
        if (include?.plan) {
            const pRes = await client.query('SELECT * FROM "Plan" WHERE id = $1', [c.planId]);
            challenge.plan = pRes.rows[0];
        }
        return challenge;
      } finally { await client.end(); }
    },
    findMany: async ({ where, include }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const res = await client.query('SELECT * FROM "Challenge" WHERE "status" = $1', [where.status]);
            const rows = [];
            for (let c of res.rows) {
                const challenge = { ...c, accountSize: BigInt(c.accountSize), currentBalance: BigInt(c.currentBalance) };
                if (include?.trades) {
                    const tRes = await client.query('SELECT * FROM "Trade" WHERE "challengeId" = $1 AND "status" = $2', [c.id, include.trades.where.status]);
                    challenge.trades = tRes.rows.map(t => ({ ...t, entryPrice: BigInt(t.entryPrice), pnl: BigInt(t.pnl) }));
                }
                rows.push(challenge);
            }
            return rows;
        } finally { await client.end(); }
    },
    create: async ({ data }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const cols = Object.keys(data).map(k => `"${k}"`).join(', ');
            const vals = Object.values(data);
            const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
            const res = await client.query(`INSERT INTO "Challenge" (${cols}) VALUES (${placeholders}) RETURNING *`, vals);
            return res.rows[0];
        } finally { await client.end(); }
    },
    update: async ({ where, data }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const keys = Object.keys(data);
            const vals = [];
            const setClauses = [];
            keys.forEach((k, i) => {
                const val = data[k];
                if (typeof val === 'object' && val.increment) {
                    setClauses.push(`"${k}" = "${k}" + $${i + 1}`);
                    vals.push(val.increment);
                } else {
                    setClauses.push(`"${k}" = $${i + 1}`);
                    vals.push(val);
                }
            });
            vals.push(where.id);
            const res = await client.query(`UPDATE "Challenge" SET ${setClauses.join(', ')} WHERE id = $${vals.length} RETURNING *`, vals);
            return res.rows[0];
        } finally { await client.end(); }
    }
  },
  trade: {
    findMany: async ({ where }) => {
      const client = new Client({ connectionString: process.env.DATABASE_URL });
      await client.connect();
      try {
        const query = where.challengeId 
            ? 'SELECT * FROM "Trade" WHERE "userId" = $1 AND "status" = $2 AND "challengeId" = $3'
            : 'SELECT * FROM "Trade" WHERE "userId" = $1 AND "status" = $2';
        const params = where.challengeId ? [where.userId, where.status, where.challengeId] : [where.userId, where.status];
        const res = await client.query(query, params);
        return res.rows.map(t => ({
            ...t,
            entryPrice: BigInt(t.entryPrice),
            exitPrice: t.exitPrice ? BigInt(t.exitPrice) : null,
            pnl: BigInt(t.pnl)
        }));
      } finally { await client.end(); }
    },
    findUnique: async ({ where, include }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const res = await client.query('SELECT * FROM "Trade" WHERE id = $1', [where.id]);
            if (!res.rows[0]) return null;
            const t = res.rows[0];
            const trade = { ...t, entryPrice: BigInt(t.entryPrice), pnl: BigInt(t.pnl) };
            if (include?.challenge) {
                const cRes = await client.query('SELECT * FROM "Challenge" WHERE id = $1', [t.challengeId]);
                trade.challenge = cRes.rows[0] ? { ...cRes.rows[0], currentBalance: BigInt(cRes.rows[0].currentBalance), accountSize: BigInt(cRes.rows[0].accountSize) } : null;
            }
            return trade;
        } finally { await client.end(); }
    },
    create: async ({ data }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const cols = Object.keys(data).map(k => `"${k}"`).join(', ');
            const vals = Object.values(data);
            const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
            const res = await client.query(`INSERT INTO "Trade" (${cols}) VALUES (${placeholders}) RETURNING *`, vals);
            return res.rows[0];
        } finally { await client.end(); }
    },
    update: async ({ where, data }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const keys = Object.keys(data);
            const sets = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
            const vals = [...Object.values(data), where.id];
            const res = await client.query(`UPDATE "Trade" SET ${sets} WHERE id = $${vals.length} RETURNING *`, vals);
            return res.rows[0];
        } finally { await client.end(); }
    }
  },
  payment: {
    create: async ({ data }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const cols = Object.keys(data).map(k => `"${k}"`).join(', ');
            const vals = Object.values(data);
            const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
            const res = await client.query(`INSERT INTO "Payment" (${cols}) VALUES (${placeholders}) RETURNING *`, vals);
            return res.rows[0];
        } finally { await client.end(); }
    },
    update: async ({ where, data }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const col = Object.keys(where)[0];
            const keys = Object.keys(data);
            const sets = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
            const vals = [...Object.values(data), where[col]];
            const res = await client.query(`UPDATE "Payment" SET ${sets} WHERE "${col}" = $${vals.length} RETURNING *`, vals);
            return res.rows[0];
        } finally { await client.end(); }
    },
    updateMany: async ({ where, data }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const col = Object.keys(where)[0];
            const keys = Object.keys(data);
            const sets = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
            const vals = [...Object.values(data), where[col]];
            const res = await client.query(`UPDATE "Payment" SET ${sets} WHERE "${col}" = $${vals.length} RETURNING *`, vals);
            return { count: res.rowCount };
        } finally { await client.end(); }
    },
    findUnique: async ({ where }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const col = Object.keys(where)[0];
            const res = await client.query(`SELECT * FROM "Payment" WHERE "${col}" = $1`, [where[col]]);
            return res.rows[0] ? { ...res.rows[0], amount: BigInt(res.rows[0].amount) } : null;
        } finally { await client.end(); }
    },
    findMany: async ({ where }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const res = await client.query('SELECT * FROM "Payment" WHERE "userId" = $1 ORDER BY "createdAt" DESC', [where.userId]);
            return res.rows.map(p => ({ ...p, amount: BigInt(p.amount) }));
        } finally { await client.end(); }
    }
  },
  payout: {
    create: async ({ data }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const cols = Object.keys(data).map(k => `"${k}"`).join(', ');
            const vals = Object.values(data);
            const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
            const res = await client.query(`INSERT INTO "Payout" (${cols}) VALUES (${placeholders}) RETURNING *`, vals);
            return res.rows[0];
        } finally { await client.end(); }
    },
    findMany: async ({ where }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const res = await client.query('SELECT * FROM "Payout" WHERE "userId" = $1 ORDER BY "requestedAt" DESC', [where.userId]);
            return res.rows.map(p => ({ ...p, amountRequested: BigInt(p.amountRequested), amountAfterTds: BigInt(p.amountAfterTds) }));
        } finally { await client.end(); }
    }
  },
  auditLog: {
    create: async ({ data }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const cols = Object.keys(data).map(k => `"${k}"`).join(', ');
            const vals = Object.values(data);
            const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
            const res = await client.query(`INSERT INTO "AuditLog" (${cols}) VALUES (${placeholders}) RETURNING *`, vals);
            return res.rows[0];
        } finally { await client.end(); }
    }
  },
  emailVerification: {
    create: async ({ data }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const cols = Object.keys(data).map(k => `"${k}"`).join(', ');
            const vals = Object.values(data);
            const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
            const res = await client.query(`INSERT INTO "EmailVerification" (${cols}) VALUES (${placeholders}) RETURNING *`, vals);
            return res.rows[0];
        } finally { await client.end(); }
    },
    findFirst: async ({ where }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const res = await client.query('SELECT * FROM "EmailVerification" WHERE "userId" = $1 AND "token" = $2 AND "verified" = $3 AND "expiresAt" > $4', [where.userId, where.token, where.verified, new Date()]);
            return res.rows[0];
        } finally { await client.end(); }
    },
    update: async ({ where, data }) => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const res = await client.query('UPDATE "EmailVerification" SET "verified" = $1 WHERE id = $2 RETURNING *', [data.verified, where.id]);
            return res.rows[0];
        } finally { await client.end(); }
    }
  },
  $disconnect: async () => {},
  $transaction: async (calls) => {
    // Basic mock for transactions (serial execution for now)
    const results = [];
    for (const call of calls) {
      results.push(await call);
    }
    return results;
  }
};

console.warn('⚠️ WARNING: Using robust raw PG fallback due to Prisma initialization failure on Node 25');
module.exports = prismaMock;
