const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
  // Pool configuration
  max: 20,
  // Maximum connections in pool
  // 20 connections handle 1000+ traders
  // via queuing
  
  min: 5,
  // Keep 5 connections warm always
  // Prevents cold start latency
  
  idleTimeoutMillis: 30000,
  // Close idle connections after 30s
  
  connectionTimeoutMillis: 5000,
  // Throw error if can't get connection
  // in 5 seconds (don't hang forever)
  
  maxUses: 7500,
  // Recycle connection after 7500 uses
  // Prevents connection memory leaks
  
  allowExitOnIdle: false,
  // Keep pool alive when idle
})

// Test connection on startup
pool.on('connect', (client) => {
  console.log('✅ New DB client connected to pool')
})

pool.on('error', (err, client) => {
  console.error('❌ Unexpected DB pool error:', err.message)
  // Don't crash — pool will retry
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  await pool.end()
  console.log('DB pool closed gracefully')
})

// Helper: run a single query
const query = async (text, params) => {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    if (duration > 1000) {
      console.warn('⚠️ Slow query detected:', {
        text: text.substring(0, 100),
        duration: duration + 'ms',
        rows: result.rowCount
      })
    }
    return result
  } catch (error) {
    console.error('❌ DB query error:', {
      text: text.substring(0, 100),
      error: error.message
    })
    throw error
  }
}

// Helper: run multiple queries in a transaction (ATOMIC)
const transaction = async (callback) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Helper: get pool stats for monitoring
const getPoolStats = () => ({
  total: pool.totalCount,
  idle: pool.idleCount,
  waiting: pool.waitingCount,
})

module.exports = { pool, query, transaction, getPoolStats }
