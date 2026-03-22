const { tradeQueue } = require('../queues/tradeQueue')
const { processTrade, closeTrade, emitTradeEvents } = require('../utils/riskEngine')
const socketIO = require('../utils/socket')

// ─────────────────────────────────────
// WORKER CONFIGURATION
// ─────────────────────────────────────
const CONCURRENCY = 10

// ─────────────────────────────────────
// PROCESS OPEN TRADE JOBS
// ─────────────────────────────────────
tradeQueue.process('open-trade', CONCURRENCY, async (job) => {
  const {
    userId,
    challengeId,
    instrument,
    tradeType,
    quantity,
    entryPrice,
    orderType,
  } = job.data

  console.log('🔄 Processing open trade:', {
    jobId: job.id,
    userId,
    instrument,
    tradeType,
    quantity,
  })

  try {
    await job.progress(25)

    const trade = await processTrade({
      userId,
      challengeId,
      instrument,
      tradeType,
      quantity,
      entryPrice: BigInt(entryPrice),
      orderType,
    })

    await job.progress(75)

    const io = socketIO.getIO()
    if (io) {
      io.to('user:' + userId).emit('order:confirmed', {
        jobId: job.id,
        status: 'CONFIRMED',
        trade: {
          id: trade.id,
          instrument: trade.instrument,
          tradeType: trade.tradeType,
          quantity: trade.quantity,
          entryPrice: Number(trade.entryPrice) / 100,
          status: 'OPEN',
          tradeDate: trade.tradeDate,
        },
        message: 'Order confirmed! ' + tradeType + ' ' + quantity + ' ' + instrument + ' @ ₹' + (Number(entryPrice)/100).toFixed(2),
        timestamp: new Date().toISOString(),
      })
    }

    await job.progress(100)

    return {
      success: true,
      trade: {
        id: trade.id,
        instrument: trade.instrument,
        tradeType: trade.tradeType,
        quantity: trade.quantity,
        entryPrice: Number(trade.entryPrice) / 100,
      },
    }

  } catch (error) {
    console.error('❌ Open trade job failed:', job.id, error.message)

    const io = socketIO.getIO()
    if (io) {
      io.to('user:' + userId).emit('order:failed', {
        jobId: job.id,
        status: 'FAILED',
        message: error.message,
        timestamp: new Date().toISOString(),
      })
    }

    throw error
  }
})

// ─────────────────────────────────────
// PROCESS CLOSE TRADE JOBS
// ─────────────────────────────────────
tradeQueue.process('close-trade', CONCURRENCY, async (job) => {
  const { userId, tradeId, exitPrice } = job.data

  console.log('🔄 Processing close trade:', {
    jobId: job.id,
    userId,
    tradeId,
    exitPrice: Number(exitPrice)/100,
  })

  try {
    await job.progress(25)

    const result = await closeTrade({
      tradeId,
      userId,
      exitPrice: BigInt(exitPrice),
    })

    await job.progress(75)

    emitTradeEvents(userId, result.challenge.id, result)

    const io = socketIO.getIO()
    if (io) {
      io.to('user:' + userId).emit('order:confirmed', {
        jobId: job.id,
        status: 'CLOSED',
        trade: result.trade,
        challenge: result.challenge,
        riskEvents: result.riskEvents,
        message: 'Position closed. P&L: ' + (result.trade.pnl >= 0 ? '+' : '') + '₹' + result.trade.pnl.toFixed(2),
        timestamp: new Date().toISOString(),
      })
    }

    await job.progress(100)

    return {
      success: true,
      trade: result.trade,
      challenge: result.challenge,
    }

  } catch (error) {
    console.error('❌ Close trade job failed:', job.id, error.message)

    const io = socketIO.getIO()
    if (io) {
      io.to('user:' + userId).emit('order:failed', {
        jobId: job.id,
        status: 'FAILED',
        message: error.message,
        timestamp: new Date().toISOString(),
      })
    }

    throw error
  }
})

tradeQueue.on('completed', (job) => {
  const duration = job.finishedOn - job.processedOn
  if (duration > 5000) {
    console.warn('⚠️ Slow job detected:', {
      jobId: job.id,
      type: job.data.type,
      duration: duration + 'ms',
    })
  }
})

console.log('⚡ Trade Worker initialized — processing up to ' + CONCURRENCY + ' concurrent trades')

module.exports = { 
  name: 'Trade Processing Worker',
  concurrency: CONCURRENCY,
}
