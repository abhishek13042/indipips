const redis = require('ioredis')

const redisClient = new redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  
  // Reconnection strategy
  retryStrategy: (times) => {
    if (times > 10) {
      console.error('Redis max retries reached — running without cache')
      return null // Stop retrying
    }
    return Math.min(times * 200, 3000) // Exponential backoff
  },
  
  // Timeouts
  connectTimeout: 5000,
  commandTimeout: 3000,
  
  // Lazy connect — don't fail if Redis not available at startup
  lazyConnect: true,
  
  // Don't queue commands when offline
  // Return error immediately
  enableOfflineQueue: false,
})

let redisAvailable = false

redisClient.on('connect', () => {
  redisAvailable = true
  console.log('✅ Redis connected')
})

redisClient.on('error', (err) => {
  redisAvailable = false
  // Don't crash — graceful degradation
  // Fall back to DB when Redis unavailable
})

// ─────────────────────────────────────
// CHALLENGE CACHE
// ─────────────────────────────────────
// Cache challenge for 30 seconds
// Risk Engine reads this instead of DB

const CHALLENGE_TTL = 30 // seconds

const getCachedChallenge = async (id) => {
  if (!redisAvailable) return null
  try {
    const cached = await redisClient.get('challenge:' + id)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null // Cache miss = use DB
  }
}

const setCachedChallenge = async (id, challenge) => {
  if (!redisAvailable) return
  try {
    await redisClient.setex(
      'challenge:' + id,
      CHALLENGE_TTL,
      JSON.stringify(challenge)
    )
  } catch {
    // Cache write fail = not critical
  }
}

const invalidateChallengeCache = async (id) => {
  if (!redisAvailable) return
  try {
    await redisClient.del('challenge:' + id)
  } catch {}
}

// ─────────────────────────────────────
// DAILY P&L CACHE
// ─────────────────────────────────────
// Store today's P&L in Redis
// Use atomic INCRBY for thread safety
// Prevents race conditions

const getDailyPnl = async (challengeId, date) => {
  if (!redisAvailable) return null
  try {
    const key = 'dailypnl:' + challengeId + ':' + date
    const val = await redisClient.get(key)
    return val ? parseInt(val) : null
  } catch {
    return null
  }
}

const incrementDailyPnl = async (challengeId, date, amount) => {
  // amount in paise (integer)
  if (!redisAvailable) return null
  try {
    const key = 'dailypnl:' + challengeId + ':' + date
    const newVal = await redisClient.incrby(key, amount)
    // Set TTL to end of trading day
    // Expires at midnight IST
    await redisClient.expire(key, 86400)
    return newVal
  } catch {
    return null
  }
}

const resetDailyPnl = async (challengeId, date) => {
  if (!redisAvailable) return
  try {
    const key = 'dailypnl:' + challengeId + ':' + date
    await redisClient.set(key, 0)
    await redisClient.expire(key, 86400)
  } catch {}
}

// ─────────────────────────────────────
// PEAK BALANCE CACHE
// ─────────────────────────────────────
// Track peak balance for drawdown calc
// Only updates when new peak reached

const getPeakBalance = async (challengeId) => {
  if (!redisAvailable) return null
  try {
    const val = await redisClient.get('peak:' + challengeId)
    return val ? parseInt(val) : null
  } catch {
    return null
  }
}

const updatePeakBalance = async (challengeId, balance) => {
  if (!redisAvailable) return
  try {
    const current = await getPeakBalance(challengeId)
    if (!current || balance > current) {
      await redisClient.set('peak:' + challengeId, balance)
    }
  } catch {}
}

// ─────────────────────────────────────
// RATE LIMIT CACHE
// ─────────────────────────────────────
// Track orders per trader per minute
// Prevents spam/abuse

const checkTraderRateLimit = async (userId) => {
  if (!redisAvailable) return { allowed: true, count: 0 }
  try {
    const key = 'ratelimit:trade:' + userId
    const count = await redisClient.incr(key)
    if (count === 1) {
      // First request this minute
      await redisClient.expire(key, 60)
    }
    return {
      allowed: count <= 10,
      // Max 10 orders per minute per trader
      count,
      resetIn: await redisClient.ttl(key)
    }
  } catch {
    return { allowed: true, count: 0 }
    // If Redis fails = allow trade
    // Don't block traders due to cache issue
  }
}

// ─────────────────────────────────────
// MARKET STATUS CACHE
// ─────────────────────────────────────
// Cache market open/close status
// Recalculated every minute via cron

const getMarketStatus = () => {
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000
  const ist = new Date(now.getTime() + istOffset)
  
  const day = ist.getUTCDay()
  if (day === 0 || day === 6) {
    return {
      isOpen: false,
      reason: 'Weekend',
      nextOpen: 'Monday 9:15 AM IST'
    }
  }
  
  const hours = ist.getUTCHours()
  const mins = ist.getUTCMinutes()
  const total = hours * 60 + mins
  
  const open = 9 * 60 + 15   // 555 mins
  const close = 15 * 60 + 15  // 915 mins
  
  if (total < open) {
    return {
      isOpen: false,
      reason: 'Pre-market',
      nextOpen: '9:15 AM IST today'
    }
  }
  if (total > close) {
    return {
      isOpen: false,
      reason: 'Post-market',
      nextOpen: 'Tomorrow 9:15 AM IST'
    }
  }
  return {
    isOpen: true,
    reason: 'Market hours',
    closesAt: '3:15 PM IST'
  }
}

// ─────────────────────────────────────
// CACHE HEALTH CHECK
// ─────────────────────────────────────

const getCacheHealth = async () => {
  if (!redisAvailable) {
    return { 
      status: 'unavailable',
      message: 'Running without cache'
    }
  }
  try {
    await redisClient.ping()
    return { 
      status: 'healthy',
      available: redisAvailable
    }
  } catch {
    return { 
      status: 'error',
      message: 'Redis ping failed'
    }
  }
}

module.exports = {
  redisClient,
  redisAvailable: () => redisAvailable,
  getCachedChallenge,
  setCachedChallenge,
  invalidateChallengeCache,
  getDailyPnl,
  incrementDailyPnl,
  resetDailyPnl,
  getPeakBalance,
  updatePeakBalance,
  checkTraderRateLimit,
  getMarketStatus,
  getCacheHealth,
}
