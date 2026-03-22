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

    // First check what columns exist
    const colCheck = await query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Trade'
    `)
    const existingCols = colCheck.rows
      .map(r => r.column_name)

    // Build SELECT based on existing cols
    const selectCols = []
    selectCols.push('id')
    if (existingCols.includes('challengeId'))
      selectCols.push('"challengeId"')
    if (existingCols.includes('userId'))
      selectCols.push('"userId"')
    if (existingCols.includes('instrument'))
      selectCols.push('instrument')
    if (existingCols.includes('tradeType'))
      selectCols.push('"tradeType"')
    if (existingCols.includes('quantity'))
      selectCols.push('quantity')
    if (existingCols.includes('entryPrice'))
      selectCols.push(
        'CAST("entryPrice" AS FLOAT) ' +
        'as "entryPrice"'
      )
    if (existingCols.includes('exitPrice'))
      selectCols.push(
        'CAST(COALESCE("exitPrice",0) ' +
        'AS FLOAT) as "exitPrice"'
      )
    if (existingCols.includes('pnl'))
      selectCols.push(
        'CAST(COALESCE(pnl,0) AS FLOAT) ' +
        'as pnl'
      )
    if (existingCols.includes('tradeDate'))
      selectCols.push('"tradeDate"')
    if (existingCols.includes('entryTime'))
      selectCols.push('"entryTime"')
    if (existingCols.includes('exitTime'))
      selectCols.push('"exitTime"')
    if (existingCols.includes('status'))
      selectCols.push('status')
    if (existingCols.includes('orderType'))
      selectCols.push('"orderType"')
    if (existingCols.includes('createdAt'))
      selectCols.push('"createdAt"')

    let sql = `
      SELECT ${selectCols.join(', ')}
      FROM "Trade"
      WHERE "userId" = $1
      AND status = 'OPEN'
    `

    const params = [userId]

    if (challengeId) {
      sql += ` AND "challengeId" = $2`
      params.push(challengeId)
    }

    sql += ` ORDER BY "createdAt" DESC`

    const result = await query(sql, params)

    const trades = (result.rows || [])
      .map(t => ({
        id: t.id,
        challengeId: t.challengeId || null,
        userId: t.userId || null,
        instrument: t.instrument || '',
        tradeType: t.tradeType || 'BUY',
        quantity: parseInt(t.quantity) || 0,
        entryPrice: t.entryPrice
          ? parseFloat(t.entryPrice) / 100
          : 0,
        exitPrice: t.exitPrice
          ? parseFloat(t.exitPrice) / 100
          : 0,
        pnl: t.pnl
          ? parseFloat(t.pnl) / 100
          : 0,
        tradeDate: t.tradeDate || null,
        entryTime: t.entryTime || null,
        exitTime: t.exitTime || null,
        status: t.status || 'OPEN',
        orderType: t.orderType || 'MARKET',
        createdAt: t.createdAt || null,
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
    console.error('getActiveTrades ERROR:',
      error.message)
    // Return empty array instead of 500
    // Terminal can still load without trades
    return res.status(200).json({
      success: true,
      message: 'No trades found.',
      data: {
        trades: [],
        count: 0,
      },
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

    // Step 1: Fetch trades with CAST values
    const tradesSql = `
      SELECT 
        id, "challengeId", "userId", instrument, "tradeType", quantity,
        CAST("entryPrice" AS FLOAT) as "entryPrice",
        CAST("exitPrice" AS FLOAT) as "exitPrice",
        CAST(pnl AS FLOAT) as pnl,
        "tradeDate", "entryTime", "exitTime", status, "orderType", "createdAt"
      FROM "Trade" t
      WHERE ${whereClause}
      ORDER BY t."exitTime" DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `
    const tradesResult = await query(tradesSql, [...params, limit, offset])

    // Step 2: Fetch summary stats with CAST
    const statsSql = `
      SELECT 
        COUNT(*)::INTEGER as total,
        SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END)::INTEGER as winners,
        SUM(CASE WHEN pnl <= 0 THEN 1 ELSE 0 END)::INTEGER as losers,
        CAST(SUM(pnl) AS FLOAT) as totalpnl
      FROM "Trade" t
      WHERE ${whereClause}
    `
    const statsResult = await query(statsSql, params)
    const stats = statsResult.rows[0]

    const trades = (tradesResult.rows || []).map(t => ({
      id: t.id,
      instrument: t.instrument || '',
      tradeType: t.tradeType || '',
      quantity: parseInt(t.quantity) || 0,
      entryPrice: parseFloat(t.entryPrice) / 100,
      exitPrice: t.exitPrice ? parseFloat(t.exitPrice) / 100 : null,
      pnl: parseFloat(t.pnl) / 100,
      tradeDate: t.tradeDate,
      entryTime: t.entryTime,
      exitTime: t.exitTime,
      orderType: t.orderType || 'MARKET'
    }))

    const total = parseInt(stats.total) || 0
    const winners = parseInt(stats.winners) || 0

    return res.status(200).json({
      success: true,
      message: 'Trade history fetched.',
      data: {
        trades,
        summary: {
          totalTrades: total,
          winningTrades: winners,
          losingTrades: parseInt(stats.losers || 0),
          totalPnl: parseFloat(stats.totalpnl || 0) / 100,
          winRate: total > 0 ? ((winners / total) * 100).toFixed(1) : 0,
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('getTradeHistory ERROR:', error.message)
    return res.status(200).json({
      success: true,
      message: 'No trade history found.',
      data: {
        trades: [],
        summary: {
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          totalPnl: 0,
          winRate: 0
        },
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0
        }
      }
    })
  }
}

// ─────────────────────────────────────
// GET MARKET STATUS
// GET /api/v1/trades/market-status
// ─────────────────────────────────────
const marketStatus = async (req, res) => {
  try {
    const status = getMarketStatus()
    const now = new Date()
    const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000)
    const timeStr = ist.toISOString().split('T')[1].substring(0, 8)

    return res.status(200).json({
      success: true,
      data: {
        ...status,
        currentISTTime: timeStr + ' IST',
        serverTime: now.toISOString(),
      },
    })
  } catch (error) {
    console.error('marketStatus ERROR:', error.message)
    return res.status(200).json({
      success: true,
      data: {
        isOpen: false,
        reason: 'Unable to determine',
        currentISTTime: 'Unknown'
      }
    })
  }
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
