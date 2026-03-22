const {
  validatePreTrade,
  processTrade,
  closeTrade,
  emitTradeEvents,
  getMarketStatus,
} = require('../utils/riskEngine')
const { query } = require('../utils/db')
const {
  addOpenTradeJob,
  addCloseTradeJob,
  getJobStatus,
  getQueueStats,
} = require('../queues/tradeQueue')

// ─────────────────────────────────────
// OPEN TRADE
// POST /api/v1/trades/open
// ─────────────────────────────────────
const openTrade = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      challengeId,
      instrument,
      tradeType,
      quantity,
      entryPrice,
      orderType,
    } = req.body

    // Basic presence check
    if (!challengeId || !instrument || !tradeType || !quantity || !entryPrice) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields.',
      })
    }

    // Step 1: Fast pre-validation
    const preCheck = await validatePreTrade({
      userId,
      challengeId,
      instrument,
      quantity: parseInt(quantity),
      tradeType: tradeType.toUpperCase(),
    })

    if (!preCheck.valid) {
      return res.status(422).json({
        success: false,
        message: preCheck.message,
        code: preCheck.code,
        data: preCheck.data,
      })
    }

    // Step 2: Add to queue (non-blocking)
    try {
      const job = await addOpenTradeJob({
        userId,
        challengeId,
        instrument: instrument.toUpperCase(),
        tradeType: tradeType.toUpperCase(),
        quantity: parseInt(quantity),
        entryPrice: Math.round(parseFloat(entryPrice) * 100),
        orderType: orderType || 'MARKET',
      })

      return res.status(202).json({
        success: true,
        message: 'Order submitted! You will receive confirmation shortly.',
        data: {
          jobId: job.id,
          status: 'QUEUED',
          instrument: instrument.toUpperCase(),
          tradeType: tradeType.toUpperCase(),
          quantity: parseInt(quantity),
          estimatedPrice: parseFloat(entryPrice),
          socketEvent: 'order:confirmed',
          queuedAt: new Date().toISOString(),
        },
      })
    } catch (queueError) {
      console.warn('⚠️ Queue unavailable, processing synchronously:', queueError.message)
      
      try {
        const trade = await processTrade({
          userId,
          challengeId,
          instrument: instrument.toUpperCase(),
          tradeType: tradeType.toUpperCase(),
          quantity: parseInt(quantity),
          entryPrice: BigInt(Math.round(parseFloat(entryPrice) * 100)),
          orderType: orderType || 'MARKET',
        })
        
        return res.status(201).json({
          success: true,
          message: 'Order placed (sync mode)',
          data: { trade },
        })
      } catch (tradeError) {
        return res.status(422).json({
          success: false,
          message: tradeError.message,
        })
      }
    }
  } catch (error) {
    console.error('openTrade queue error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Failed to submit order. Please try again.',
    })
  }
}

// ─────────────────────────────────────
// CLOSE TRADE
// POST /api/v1/trades/close
// ─────────────────────────────────────
const closeTrade_ctrl = async (req, res) => {
  try {
    const userId = req.user.id
    const { tradeId, exitPrice } = req.body

    if (!tradeId || !exitPrice) {
      return res.status(400).json({
        success: false,
        message: 'tradeId and exitPrice are required.',
      })
    }

    const job = await addCloseTradeJob({
      userId,
      tradeId,
      exitPrice: Math.round(parseFloat(exitPrice) * 100),
    })

    return res.status(202).json({
      success: true,
      message: 'Exit order submitted! Processing your position close.',
      data: {
        jobId: job.id,
        status: 'QUEUED',
        tradeId,
        socketEvent: 'order:confirmed',
        queuedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('closeTrade queue error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Failed to submit exit order.',
    })
  }
}

// ─────────────────────────────────────
// GET ACTIVE TRADES
// GET /api/v1/trades/active
// ─────────────────────────────────────
const getActiveTrades = async (req, res) => {
  try {
    const userId = req.user.id
    const { challengeId } = req.query

    let queryText = 
      `SELECT t.id, t.instrument,
        t."tradeType", t.quantity,
        t."entryPrice", t.pnl,
        t."tradeDate", t."entryTime",
        t.status, t."orderType",
        t."challengeId"
       FROM "Trade" t
       WHERE t."userId" = $1
       AND t.status = 'OPEN'`
    
    const params = [userId]
    if (challengeId) {
      queryText += ` AND t."challengeId" = $2`
      params.push(challengeId)
    }
    queryText += ` ORDER BY t."entryTime" DESC`

    const result = await query(queryText, params)

    const trades = result.rows.map(t => ({
      ...t,
      entryPrice: Number(t.entryPrice) / 100,
      pnl: Number(t.pnl) / 100,
    }))

    return res.status(200).json({
      success: true,
      message: 'Active trades fetched.',
      data: {
        trades,
        count: trades.length,
      },
    })
  } catch (error) {
    console.error('getActiveTrades:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch trades.',
    })
  }
}

// ─────────────────────────────────────
// GET TRADE HISTORY
// GET /api/v1/trades/history
// ─────────────────────────────────────
const getTradeHistory = async (req, res) => {
  try {
    const userId = req.user.id
    const { challengeId, date, page = 1, limit = 50 } = req.query

    if (!challengeId) {
      return res.status(400).json({
        success: false,
        message: 'challengeId is required.',
      })
    }

    const offset = (page - 1) * limit
    const params = [userId, challengeId]
    let whereClause = `t."userId" = $1 AND t."challengeId" = $2 AND t.status = 'CLOSED'`

    if (date) {
      params.push(date)
      whereClause += ` AND t."tradeDate" = $${params.length}`
    }

    const tradesResult = await query(
      `SELECT t.id, t.instrument,
        t."tradeType", t.quantity,
        t."entryPrice", t."exitPrice",
        t.pnl, t."tradeDate",
        t."entryTime", t."exitTime",
        t."orderType"
       FROM "Trade" t
       WHERE ${whereClause}
       ORDER BY t."exitTime" DESC
       LIMIT $${params.length+1} 
       OFFSET $${params.length+2}`,
      [...params, limit, offset]
    )

    const countResult = await query(
      `SELECT COUNT(*) as total,
        SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as winners,
        SUM(CASE WHEN pnl <= 0 THEN 1 ELSE 0 END) as losers,
        SUM(pnl) as totalpnl
       FROM "Trade" t
       WHERE ${whereClause}`,
      params
    )

    const stats = countResult.rows[0]
    const total = parseInt(stats.total)
    const winners = parseInt(stats.winners||0)

    const trades = tradesResult.rows.map(t=>({
      ...t,
      entryPrice: Number(t.entryPrice)/100,
      exitPrice: t.exitPrice ? Number(t.exitPrice)/100 : null,
      pnl: Number(t.pnl)/100,
    }))

    return res.status(200).json({
      success: true,
      message: 'Trade history fetched.',
      data: {
        trades,
        summary: {
          totalTrades: total,
          winningTrades: winners,
          losingTrades: parseInt(stats.losers || 0),
          totalPnl: Number(stats.totalpnl || 0) / 100,
          winRate: total > 0 ? ((winners/total)*100).toFixed(1) : 0,
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total/limit),
        },
      },
    })
  } catch (error) {
    console.error('getTradeHistory:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch history.',
    })
  }
}

// ─────────────────────────────────────
// GET MARKET STATUS
// GET /api/v1/trades/market-status
// ─────────────────────────────────────
const marketStatus = async (req, res) => {
  const status = getMarketStatus()
  const now = new Date()
  const ist = new Date(now.getTime() + 5.5*60*60*1000)
  const timeStr = ist.toISOString().split('T')[1].substring(0,8)
  
  return res.status(200).json({
    success: true,
    data: {
      ...status,
      currentISTTime: timeStr + ' IST',
      serverTime: now.toISOString(),
    },
  })
}

// ─────────────────────────────────────
// CHECK JOB STATUS
// ─────────────────────────────────────
const checkJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params
    const status = await getJobStatus(jobId)
    
    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      })
    }

    return res.status(200).json({
      success: true,
      data: status,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to check job status.',
    })
  }
}

module.exports = {
  openTrade,
  closeTrade: closeTrade_ctrl,
  getActiveTrades,
  getTradeHistory,
  marketStatus,
  checkJobStatus,
}
