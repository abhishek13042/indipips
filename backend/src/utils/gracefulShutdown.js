const { pool } = require('./db')
const { redisClient } = require(
  './cache.service'
)
const { tradeQueue } = require(
  '../queues/tradeQueue'
)

let server // Will be set from server.js
let io // Socket.io instance

const setServer = (httpServer) => {
  server = httpServer
}

const setIO = (socketIO) => {
  io = socketIO
}

const gracefulShutdown = async (signal) => {
  console.log('\n📴 ' + signal + 
    ' received — starting graceful shutdown')
  
  // Step 1: Stop accepting new connections
  if (server) {
    server.close(() => {
      console.log('✅ HTTP server closed — ' +
        'no new connections accepted')
    })
  }

  // Step 2: Notify active traders
  if (io) {
    io.emit('server:maintenance', {
      message: 'Platform maintenance in ' +
        'progress. Please save your work. ' +
        'We will be back shortly.',
      timestamp: new Date().toISOString(),
    })
    console.log('📢 Traders notified via ' +
      'Socket.io')
  }

  // Step 3: Pause trade queue
  // Stop accepting new jobs
  // But finish current ones
  try {
    await tradeQueue.pause()
    console.log('⏸️ Trade queue paused')
    
    // Wait for active jobs to finish
    // Max 30 seconds
    const activeJobs = await 
      tradeQueue.getActive()
    
    if (activeJobs.length > 0) {
      console.log('⏳ Waiting for ' + 
        activeJobs.length + 
        ' active jobs to complete...')
      
      await new Promise((resolve) => {
        setTimeout(resolve, 30000)
        // Max 30 second wait
      })
    }
    
    await tradeQueue.close()
    console.log('✅ Trade queue closed')
  } catch (err) {
    console.error('Queue shutdown error:', 
      err.message)
  }

  // Step 4: Close Redis connection
  try {
    await redisClient.quit()
    console.log('✅ Redis disconnected')
  } catch (err) {
    console.error('Redis shutdown error:', 
      err.message)
  }

  // Step 5: Close DB pool
  try {
    await pool.end()
    console.log('✅ DB pool closed')
  } catch (err) {
    console.error('DB shutdown error:', 
      err.message)
  }

  console.log('✅ Graceful shutdown complete')
  process.exit(0)
}

// Register shutdown handlers
const registerShutdownHandlers = () => {
  // Normal termination (Docker, Railway)
  process.on('SIGTERM', () => 
    gracefulShutdown('SIGTERM'))
  
  // Ctrl+C in terminal
  process.on('SIGINT', () => 
    gracefulShutdown('SIGINT'))
  
  // Uncaught errors — log but don't crash
  process.on('uncaughtException', (err) => {
    console.error('🚨 Uncaught Exception:', {
      message: err.message,
      stack: err.stack,
    })
    // Log to Sentry in production
    // Don't exit — try to recover
  })
  
  process.on('unhandledRejection', (
    reason, promise
  ) => {
    console.error('🚨 Unhandled Rejection:', {
      reason: reason?.message || reason,
      promise,
    })
    // Log to Sentry in production
    // Don't exit — try to recover
  })

  console.log('🛡️ Shutdown handlers registered')
}

module.exports = {
  setServer,
  setIO,
  gracefulShutdown,
  registerShutdownHandlers,
}
