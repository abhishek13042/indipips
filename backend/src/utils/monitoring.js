const { getPoolStats } = require('./db')
const { getCacheHealth, getMarketStatus } 
  = require('./cache.service')
const { getQueueStats } = require(
  '../queues/tradeQueue'
)
const { getAllBreakerStats } = require(
  './circuitBreaker'
)

// ─────────────────────────────────────
// METRICS STORAGE
// In-memory rolling window (last 1 hour)
// ─────────────────────────────────────
const metrics = {
  requests: {
    total: 0,
    success: 0,
    errors: 0,
    slow: 0, // > 500ms
  },
  trades: {
    opened: 0,
    closed: 0,
    failed: 0,
    totalVolume: 0, // in paise
  },
  errors: [],
  // Last 100 errors stored
  responseTimes: [],
  // Last 1000 response times
}

// ─────────────────────────────────────
// REQUEST TRACKING MIDDLEWARE
// Add to Express app
// ─────────────────────────────────────
const requestTracker = (req, res, next) => {
  const start = Date.now()
  metrics.requests.total++

  // Override res.end to capture stats
  const originalEnd = res.end
  res.end = function(...args) {
    const duration = Date.now() - start
    
    // Track response time
    metrics.responseTimes.push(duration)
    if (metrics.responseTimes.length > 1000) {
      metrics.responseTimes.shift()
      // Keep only last 1000
    }

    // Track success/error
    if (res.statusCode >= 400) {
      metrics.requests.errors++
    } else {
      metrics.requests.success++
    }

    // Track slow requests
    if (duration > 500) {
      metrics.requests.slow++
      console.warn('🐌 Slow request:', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: duration + 'ms',
        userId: req.user?.id,
      })
    }

    // Call original end
    originalEnd.apply(this, args)
  }

  next()
}

// ─────────────────────────────────────
// TRACK TRADE EVENTS
// Called from trade worker
// ─────────────────────────────────────
const trackTradeOpened = (amount) => {
  metrics.trades.opened++
  metrics.trades.totalVolume += amount
}

const trackTradeClosed = () => {
  metrics.trades.closed++
}

const trackTradeFailed = (error) => {
  metrics.trades.failed++
  addError('TRADE_FAILED', error.message)
}

const addError = (type, message) => {
  metrics.errors.push({
    type,
    message,
    timestamp: new Date().toISOString(),
  })
  if (metrics.errors.length > 100) {
    metrics.errors.shift()
    // Keep only last 100 errors
  }
}

// ─────────────────────────────────────
// CALCULATE METRICS SUMMARY
// ─────────────────────────────────────
const getMetricsSummary = () => {
  const times = metrics.responseTimes
  
  if (times.length === 0) {
    return {
      ...metrics,
      performance: {
        avgResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
      }
    }
  }

  const sorted = [...times].sort(
    (a, b) => a - b
  )
  const avg = times.reduce(
    (a, b) => a + b, 0
  ) / times.length
  const p95 = sorted[
    Math.floor(sorted.length * 0.95)
  ]
  const p99 = sorted[
    Math.floor(sorted.length * 0.99)
  ]

  return {
    requests: {
      ...metrics.requests,
      errorRate: metrics.requests.total > 0
        ? (
            (metrics.requests.errors / 
             metrics.requests.total) * 100
          ).toFixed(1) + '%'
        : '0%',
    },
    trades: {
      ...metrics.trades,
      totalVolumeINR: 
        (metrics.trades.totalVolume / 100)
          .toLocaleString('en-IN'),
    },
    performance: {
      avgResponseTime: 
        Math.round(avg) + 'ms',
      p95ResponseTime: p95 + 'ms',
      p99ResponseTime: p99 + 'ms',
      sampleSize: times.length,
    },
    recentErrors: metrics.errors
      .slice(-10),
    // Last 10 errors
  }
}

// ─────────────────────────────────────
// COMPREHENSIVE HEALTH CHECK
// ─────────────────────────────────────
const getFullHealthReport = async () => {
  const [
    cacheHealth,
    queueStats,
  ] = await Promise.all([
    getCacheHealth(),
    getQueueStats().catch(() => null),
  ])

  const dbPool = getPoolStats()
  const marketStatus = getMarketStatus()
  const circuitBreakers = getAllBreakerStats()
  const metricsSummary = getMetricsSummary()

  // Determine overall health
  const issues = []
  
  if (dbPool.waiting > 10) {
    issues.push('DB pool queue backing up')
  }
  if (queueStats?.failed > 10) {
    issues.push('High queue failure rate')
  }
  if (circuitBreakers.database?.state 
      === 'OPEN') {
    issues.push('Database circuit OPEN')
  }
  if (circuitBreakers.razorpay?.state 
      === 'OPEN') {
    issues.push('Razorpay circuit OPEN')
  }
  if (parseFloat(
    metricsSummary.requests?.errorRate
  ) > 10) {
    issues.push('High error rate >10%')
  }

  const overallStatus = issues.length === 0
    ? 'healthy'
    : issues.length <= 2
      ? 'degraded'
      : 'critical'

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(
      process.uptime()
    ) + ' seconds',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    
    issues: issues.length > 0 
      ? issues : undefined,

    services: {
      database: {
        status: circuitBreakers.database
          ?.state === 'CLOSED' 
          ? 'healthy' : 'degraded',
        pool: {
          total: dbPool.total,
          idle: dbPool.idle,
          waiting: dbPool.waiting,
        },
        circuit: circuitBreakers.database,
      },
      
      redis: {
        status: cacheHealth.status,
        circuit: circuitBreakers.redis,
      },
      
      queue: queueStats ? {
        status: queueStats.isHealthy
          ? 'healthy' : 'degraded',
        stats: queueStats,
      } : {
        status: 'unavailable',
      },
      
      market: {
        status: marketStatus.isOpen
          ? 'open' : 'closed',
        ...marketStatus,
      },

      payments: {
        circuit: circuitBreakers.razorpay,
        status: circuitBreakers.razorpay
          ?.state === 'CLOSED'
          ? 'healthy' : 'degraded',
      },

      broker: {
        circuit: circuitBreakers.upstox,
        status: circuitBreakers.upstox
          ?.state === 'CLOSED'
          ? 'healthy' : 'degraded',
      },
    },

    performance: metricsSummary.performance,

    platform: {
      trades: metricsSummary.trades,
      requests: metricsSummary.requests,
    },

    memory: {
      heapUsed: Math.round(
        process.memoryUsage().heapUsed 
        / 1024 / 1024
      ) + 'MB',
      heapTotal: Math.round(
        process.memoryUsage().heapTotal 
        / 1024 / 1024
      ) + 'MB',
      rss: Math.round(
        process.memoryUsage().rss 
        / 1024 / 1024
      ) + 'MB',
      external: Math.round(
        process.memoryUsage().external 
        / 1024 / 1024
      ) + 'MB',
    },

    node: {
      version: process.version,
      pid: process.pid,
    },
  }
}

// ─────────────────────────────────────
// PERIODIC HEALTH LOGGING
// Log every 5 minutes to console
// ─────────────────────────────────────
setInterval(async () => {
  try {
    const report = await getFullHealthReport()
    
    if (report.status !== 'healthy') {
      console.error('🚨 Health degraded:', {
        status: report.status,
        issues: report.issues,
      })
    } else {
      console.log('💚 Platform healthy:', {
        uptime: report.uptime,
        trades: report.platform.trades,
        memory: report.memory.heapUsed,
        errorRate: report.platform
          .requests.errorRate,
      })
    }
  } catch (err) {
    console.error('Health check failed:', 
      err.message)
  }
}, 5 * 60 * 1000) // Every 5 minutes

// ─────────────────────────────────────
// MEMORY LEAK PREVENTION
// Alert if memory grows too large
// ─────────────────────────────────────
setInterval(() => {
  const heapUsed = 
    process.memoryUsage().heapUsed
  const heapMB = heapUsed / 1024 / 1024
  
  if (heapMB > 500) {
    console.error('🚨 HIGH MEMORY USAGE:', 
      Math.round(heapMB) + 'MB')
    // Alert admin if critical
    // In production: notify Sentry
  } else if (heapMB > 300) {
    console.warn('⚠️ Memory warning:', 
      Math.round(heapMB) + 'MB')
  }
}, 60 * 1000) // Check every minute

module.exports = {
  requestTracker,
  trackTradeOpened,
  trackTradeClosed,
  trackTradeFailed,
  addError,
  getFullHealthReport,
  getMetricsSummary,
}
