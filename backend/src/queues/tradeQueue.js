const Bull = require('bull')

// Create the trade queue
// Uses Redis as the backend
const tradeQueue = new Bull('trade-processing', {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    retryStrategy: (times) => {
      if (times > 5) return null
      return Math.min(times * 500, 3000)
    },
  },
  
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600,
      count: 1000,
    },
    removeOnFail: {
      age: 86400,
    },
    timeout: 30000,
  },
})

// Queue event handlers for monitoring
tradeQueue.on('error', (error) => {
  console.error('❌ Trade queue error:', error.message)
})

tradeQueue.on('waiting', (jobId) => {
  console.log('⏳ Trade job waiting:', jobId)
})

tradeQueue.on('active', (job) => {
  console.log('⚡ Processing trade job:', job.id, job.data.instrument, job.data.tradeType)
})

tradeQueue.on('completed', (job, result) => {
  console.log('✅ Trade job completed:', job.id, 'P&L:', result?.trade?.pnl || 'N/A')
})

tradeQueue.on('failed', (job, error) => {
  console.error('❌ Trade job failed:', job.id, 'Attempt:', job.attemptsMade, 'Error:', error.message)
})

tradeQueue.on('stalled', (job) => {
  console.warn('⚠️ Trade job stalled:', job.id, '— will retry automatically')
})

// ─────────────────────────────────────
// QUEUE HELPER FUNCTIONS
// ─────────────────────────────────────

// Add open trade job to queue
const addOpenTradeJob = async (data) => {
  const job = await tradeQueue.add(
    'open-trade',
    {
      type: 'OPEN',
      ...data,
      queuedAt: new Date().toISOString(),
    },
    {
      priority: 1,
      jobId: 'open-' + data.userId + '-' + Date.now(),
    }
  )
  return job
}

// Add close trade job to queue
const addCloseTradeJob = async (data) => {
  const job = await tradeQueue.add(
    'close-trade',
    {
      type: 'CLOSE',
      ...data,
      queuedAt: new Date().toISOString(),
    },
    {
      priority: 1,
      jobId: 'close-' + data.tradeId + '-' + Date.now(),
    }
  )
  return job
}

// Get job status by ID
const getJobStatus = async (jobId) => {
  const job = await tradeQueue.getJob(jobId)
  if (!job) return null
  
  const state = await job.getState()
  return {
    id: job.id,
    state,
    data: job.data,
    result: job.returnvalue,
    failReason: job.failedReason,
    progress: job.progress(),
    createdAt: new Date(job.timestamp).toISOString(),
    processedAt: job.processedOn ? new Date(job.processedOn).toISOString() : null,
    finishedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
  }
}

// Get queue stats for health monitoring
const getQueueStats = async () => {
  const [
    waiting, active, completed, 
    failed, delayed
  ] = await Promise.all([
    tradeQueue.getWaitingCount(),
    tradeQueue.getActiveCount(),
    tradeQueue.getCompletedCount(),
    tradeQueue.getFailedCount(),
    tradeQueue.getDelayedCount(),
  ])
  
  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    isHealthy: failed < 10 && waiting < 100,
  }
}

// Graceful shutdown
const closeQueue = async () => {
  await tradeQueue.close()
  console.log('Trade queue closed gracefully')
}

process.on('SIGTERM', closeQueue)
process.on('SIGINT', closeQueue)

module.exports = {
  tradeQueue,
  addOpenTradeJob,
  addCloseTradeJob,
  getJobStatus,
  getQueueStats,
}
