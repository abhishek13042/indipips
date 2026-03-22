const { transaction, query } = require('./db')
const {
  getCachedChallenge,
  setCachedChallenge,
  invalidateChallengeCache,
  getDailyPnl,
  incrementDailyPnl,
  getPeakBalance,
  updatePeakBalance,
  getMarketStatus,
  checkTraderRateLimit,
} = require('./cache.service')
const socketIO = require('./socket')

// ─────────────────────────────────────
// LOT SIZES (updated Jan 2026)
// ─────────────────────────────────────
const LOT_SIZES = {
  'NIFTY': 65,
  'BANKNIFTY': 30,
  'FINNIFTY': 60,
  'MIDCAPNIFTY': 50,
  'DEFAULT': 1,
}

const getLotSize = (instrument) => {
  const upper = instrument.toUpperCase()
  for (const [key, size] of Object.entries(LOT_SIZES)) {
    if (upper.startsWith(key)) return size
  }
  return LOT_SIZES.DEFAULT
}

// ─────────────────────────────────────
// INSTRUMENT VALIDATION
// ─────────────────────────────────────
const VALID_INSTRUMENTS = [
  'NIFTY', 'BANKNIFTY', 'MIDCAPNIFTY',
  'FINNIFTY', 'RELIANCE', 'TCS',
  'HDFCBANK', 'INFY', 'ICICIBANK',
  'WIPRO', 'ADANIENT', 'BAJFINANCE',
  'SBIN', 'AXISBANK', 'KOTAKBANK',
  'LT', 'MARUTI', 'ASIANPAINT',
  'TATASTEEL', 'HINDUNILVR',
]

const isValidInstrument = (instrument) => {
  if (!instrument) return false
  const upper = instrument.toUpperCase()
  
  // Check base instruments
  if (VALID_INSTRUMENTS.some(i => upper === i || upper.startsWith(i))) return true
  
  // Check F&O format: NIFTY-CE-22500 or NIFTY-CE-22500-27MAR2026
  const foRegex = /^(NIFTY|BANKNIFTY|MIDCAPNIFTY|FINNIFTY)-(CE|PE)-\d{4,6}/i
  return foRegex.test(upper)
}

// ─────────────────────────────────────
// PRE-TRADE VALIDATION
// (runs BEFORE opening DB transaction)
// ─────────────────────────────────────
const validatePreTrade = async ({
  userId,
  challengeId,
  instrument,
  quantity,
  tradeType,
}) => {
  // 1. Market hours check
  const market = getMarketStatus()
  if (!market.isOpen) {
    return {
      valid: false,
      code: 'MARKET_CLOSED',
      message: 'Market is closed. Next open: ' + market.nextOpen,
      data: market,
    }
  }

  // 2. Rate limit check
  const rateLimit = await checkTraderRateLimit(userId)
  if (!rateLimit.allowed) {
    return {
      valid: false,
      code: 'RATE_LIMITED',
      message: 'Too many orders. Maximum 10 orders per minute. Try again in ' + rateLimit.resetIn + ' seconds.',
      data: rateLimit,
    }
  }

  // 3. Instrument validation
  if (!isValidInstrument(instrument)) {
    return {
      valid: false,
      code: 'INVALID_INSTRUMENT',
      message: 'Invalid instrument. Only NSE instruments supported.',
    }
  }

  // 4. Lot size validation
  const lotSize = getLotSize(instrument)
  if (quantity % lotSize !== 0) {
    return {
      valid: false,
      code: 'INVALID_QUANTITY',
      message: 'Invalid lot size. ' + instrument + ' lot size is ' + lotSize + ' units.',
      data: {
        lotSize,
        suggestedQty: Math.ceil(quantity / lotSize) * lotSize,
      },
    }
  }

  // 5. Basic input validation
  if (!['BUY','SELL'].includes(tradeType)) {
    return {
      valid: false,
      code: 'INVALID_TRADE_TYPE',
      message: 'Trade type must be BUY or SELL.',
    }
  }

  if (quantity <= 0 || quantity > 10000) {
    return {
      valid: false,
      code: 'INVALID_QUANTITY',
      message: 'Quantity must be between 1 and 10,000.',
    }
  }

  return { valid: true }
}

// ─────────────────────────────────────
// MAIN TRADE PROCESSOR
// (runs inside PostgreSQL transaction)
// ─────────────────────────────────────
const processTrade = async ({
  userId,
  challengeId,
  instrument,
  tradeType,
  quantity,
  entryPrice, // in paise
  orderType,
}) => {
  return await transaction(async (client) => {
    // ── STEP 1: Lock challenge row ──
    const challengeResult = await client.query(
      `SELECT c.*, p."profitTarget",
        p."dailyLossLimit",
        p."maxDrawdown",
        p."minTradingDays",
        p."maxTradingDays",
        p."profitSplitPct"
       FROM "Challenge" c
       JOIN "Plan" p ON c."planId" = p.id
       WHERE c.id = $1
       AND c."userId" = $2
       FOR UPDATE`,
      [challengeId, userId]
    )

    if (challengeResult.rows.length === 0) {
      throw new Error('Challenge not found or does not belong to this trader.')
    }

    const challenge = challengeResult.rows[0]

    // ── STEP 2: Check challenge status ──
    if (challenge.status === 'SUSPENDED') {
      throw new Error(
        'Trading suspended today — daily loss limit reached. Resumes at 9:15 AM IST tomorrow.'
      )
    }

    if (challenge.status !== 'ACTIVE') {
      throw new Error('Challenge is ' + challenge.status + '. Cannot place trades.')
    }

    // ── STEP 3: Get today's date IST ──
    const now = new Date()
    const istOffset = 5.5*60*60*1000
    const ist = new Date(now.getTime() + istOffset)
    const tradeDate = ist.toISOString().split('T')[0]

    // ── STEP 4: Get current P&L values ──
    const accountSize = BigInt(challenge.accountSize)
    
    let dailyPnlBigInt
    const cachedDailyPnl = await getDailyPnl(challengeId, tradeDate)
    if (cachedDailyPnl !== null) {
      dailyPnlBigInt = BigInt(cachedDailyPnl)
    } else {
      const dailyResult = await client.query(
        `SELECT COALESCE(SUM(pnl), 0) as total
         FROM "Trade"
         WHERE "challengeId" = $1
         AND "tradeDate" = $2
         AND status = 'CLOSED'`,
        [challengeId, tradeDate]
      )
      dailyPnlBigInt = BigInt(dailyResult.rows[0].total || 0)
    }

    // ── STEP 5: PRE-CHECKS ──
    const dailyLossLimit = (accountSize * 4n) / 100n
    if (dailyPnlBigInt <= -dailyLossLimit) {
      await client.query(
        `UPDATE "Challenge" 
         SET status = 'SUSPENDED'
         WHERE id = $1`,
        [challengeId]
      )
      await invalidateChallengeCache(challengeId)
      throw new Error('Daily loss limit reached. Account suspended until tomorrow.')
    }

    // ── STEP 6: COUNT OPEN POSITIONS ──
    const openPositions = await client.query(
      `SELECT COUNT(*) as count
       FROM "Trade"
       WHERE "challengeId" = $1
       AND status = 'OPEN'`,
      [challengeId]
    )
    
    const openCount = parseInt(openPositions.rows[0].count)
    if (openCount >= 50) {
      throw new Error('Maximum 50 open positions allowed. Exit some positions before placing new orders.')
    }

    // ── STEP 7: INSERT TRADE ──
    const tradeResult = await client.query(
      `INSERT INTO "Trade" (
        id, "challengeId", "userId",
        instrument, "tradeType",
        quantity, "entryPrice",
        pnl, "tradeDate", "entryTime",
        status, "orderType",
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2,
        $3, $4,
        $5, $6,
        0, $7, NOW(),
        'OPEN', $8,
        NOW(), NOW()
      ) RETURNING *`,
      [
        challengeId, userId,
        instrument, tradeType,
        quantity, entryPrice,
        tradeDate, orderType || 'MARKET',
      ]
    )

    const trade = tradeResult.rows[0]

    // ── STEP 8: LOG AUDIT TRAIL ──
    await client.query(
      `INSERT INTO "AuditLog" (
        id, action, "userId",
        "resourceId", "resourceType",
        details, "createdAt"
      ) VALUES (
        gen_random_uuid(), $1, $2,
        $3, $4, $5, NOW()
      )`,
      [
        'TRADE_OPENED',
        userId,
        trade.id,
        'Trade',
        JSON.stringify({
          instrument,
          tradeType,
          quantity,
          entryPrice: Number(entryPrice)/100,
          challengeBalance: Number(challenge.currentBalance)/100,
          dailyPnlBefore: Number(dailyPnlBigInt)/100,
          marketStatus: 'OPEN',
          timestamp: new Date().toISOString(),
        }),
      ]
    )

    return trade
  })
}

// ─────────────────────────────────────
// CLOSE TRADE (atomic)
// ─────────────────────────────────────
const closeTrade = async ({
  tradeId,
  userId,
  exitPrice, // in paise
}) => {
  return await transaction(async (client) => {
    // Lock the trade row 
    const tradeResult = await client.query(
      `SELECT t.*, c.id as "challengeId",
        c."accountSize",
        c."currentBalance",
        c."peakBalance",
        c."dailyPnl",
        c."totalPnl",
        c."consistencyViolations",
        c."daysTraded",
        c.status as "challengeStatus",
        p."profitTarget" as "planProfitTarget",
        p."dailyLossLimit",
        p."maxDrawdown",
        p."minTradingDays"
       FROM "Trade" t
       JOIN "Challenge" c 
         ON t."challengeId" = c.id
       JOIN "Plan" p 
         ON c."planId" = p.id
       WHERE t.id = $1
       AND t."userId" = $2
       AND t.status = 'OPEN'
       FOR UPDATE`,
      [tradeId, userId]
    )

    if (tradeResult.rows.length === 0) {
      throw new Error('Trade not found or already closed.')
    }

    const trade = tradeResult.rows[0]
    const challengeId = trade.challengeId

    // ── Calculate P&L ──
    const entryPrice = BigInt(trade.entryPrice)
    const exitPriceBig = BigInt(exitPrice)
    const qty = BigInt(trade.quantity)

    let realizedPnl
    if (trade.tradeType === 'BUY') {
      realizedPnl = (exitPriceBig - entryPrice) * qty
    } else {
      realizedPnl = (entryPrice - exitPriceBig) * qty
    }

    // ── Get today's date IST ──
    const now = new Date()
    const ist = new Date(now.getTime() + 5.5*60*60*1000)
    const tradeDate = ist.toISOString().split('T')[0]

    // ── Update challenge balance ──
    const accountSize = BigInt(trade.accountSize)
    const currentBalance = BigInt(trade.currentBalance)
    const currentTotalPnl = BigInt(trade.totalPnl)
    const currentDailyPnl = BigInt(trade.dailyPnl)
    const currentPeak = BigInt(trade.peakBalance)

    const newBalance = currentBalance + realizedPnl
    const newTotalPnl = currentTotalPnl + realizedPnl
    const newDailyPnl = currentDailyPnl + realizedPnl
    const newPeak = newBalance > currentPeak ? newBalance : currentPeak

    // ── RISK RULE EVALUATIONS ──
    const dailyLossLimit = (accountSize * 4n) / 100n
    const dailyLossBreached = newDailyPnl <= -dailyLossLimit

    const maxDrawdown = (accountSize * 8n) / 100n
    const drawdownAmount = newPeak - newBalance
    const drawdownBreached = drawdownAmount >= maxDrawdown

    const profitTarget = (accountSize * 8n) / 100n
    const profitTargetMet = newTotalPnl >= profitTarget

    let consistencyViolated = false
    if (newTotalPnl > 0n && newDailyPnl > 0n) {
      const dayPct = (newDailyPnl * 100n) / newTotalPnl
      consistencyViolated = dayPct > 40n
    }

    const daysResult = await client.query(
      `SELECT COUNT(DISTINCT "tradeDate") as days
       FROM "Trade"
       WHERE "challengeId" = $1
       AND status = 'CLOSED'`,
      [challengeId]
    )
    const daysTraded = parseInt(daysResult.rows[0].days)
    const minDaysMet = daysTraded >= 5

    // ── DETERMINE NEW STATUS ──
    let newStatus = trade.challengeStatus
    let failReason = null
    let riskEvents = []

    if (drawdownBreached) {
      newStatus = 'FAILED'
      failReason = 'Maximum drawdown of 8% exceeded. Drawdown reached: ' + 
        (Number(drawdownAmount) / Number(accountSize) * 100).toFixed(2) + '%'
      riskEvents.push({ type: 'CHALLENGE_FAILED', reason: failReason })
    } else if (dailyLossBreached) {
      newStatus = 'SUSPENDED'
      riskEvents.push({
        type: 'DAILY_LOSS_HIT',
        dailyPnl: Number(newDailyPnl)/100,
        limit: Number(dailyLossLimit)/100,
      })
    } else if (profitTargetMet && minDaysMet) {
      newStatus = 'PASSED'
      riskEvents.push({ type: 'CHALLENGE_PASSED', totalPnl: Number(newTotalPnl)/100, daysTraded })
    } else if (profitTargetMet && !minDaysMet) {
      riskEvents.push({ type: 'MIN_DAYS_PENDING', daysTraded, daysNeeded: 5 - daysTraded })
    }

    // Handle consistency violation
    let newViolations = trade.consistencyViolations
    if (consistencyViolated && trade.challengeStatus === 'ACTIVE') {
      const lastViolationDate = trade.lastConsistencyViolationDate
      const today = tradeDate

      if (lastViolationDate !== today) {
        newViolations += 1
        if (newViolations >= 3) {
          newStatus = 'FAILED'
          failReason = 'Consistency rule violated 3 times. Single day profit cannot exceed 40% of total profits.'
          riskEvents.push({ type: 'CHALLENGE_FAILED', reason: failReason })
        } else {
          riskEvents.push({
            type: 'CONSISTENCY_WARNING',
            violations: newViolations,
            message: 'Warning ' + newViolations + '/2: Single day profit exceeded 40% of total. 3rd violation will fail the challenge.',
          })
        }
      }
    }

    // ── CLOSE THE TRADE ──
    await client.query(
      `UPDATE "Trade"
       SET status = 'CLOSED',
           "exitPrice" = $1,
           pnl = $2,
           "exitTime" = NOW(),
           "updatedAt" = NOW()
       WHERE id = $3`,
      [exitPrice, realizedPnl, tradeId]
    )

    // ── UPDATE CHALLENGE ──
    await client.query(
      `UPDATE "Challenge"
       SET "currentBalance" = $1,
           "peakBalance" = $2,
           "totalPnl" = $3,
           "dailyPnl" = $4,
           "daysTraded" = $5,
           "consistencyViolations" = $6,
           status = $7,
           "failReason" = $8,
           "lastConsistencyViolationDate" = $9,
           "passedAt" = $10,
           "updatedAt" = NOW()
       WHERE id = $11`,
      [
        newBalance,
        newPeak,
        newTotalPnl,
        newDailyPnl,
        daysTraded,
        newViolations,
        newStatus,
        failReason,
        consistencyViolated ? tradeDate : trade.lastConsistencyViolationDate,
        newStatus === 'PASSED' ? new Date() : trade.passedAt,
        challengeId,
      ]
    )

    // ── UPDATE REDIS CACHE ──
    await invalidateChallengeCache(challengeId)
    await incrementDailyPnl(challengeId, tradeDate, Number(realizedPnl))
    await updatePeakBalance(challengeId, Number(newBalance))

    // ── AUDIT LOG ──
    await client.query(
      `INSERT INTO "AuditLog" (
        id, action, "userId",
        "resourceId", "resourceType",
        details, "createdAt"
      ) VALUES (
        gen_random_uuid(), $1, $2,
        $3, $4, $5, NOW()
      )`,
      [
        'TRADE_CLOSED',
        userId,
        tradeId,
        'Trade',
        JSON.stringify({
          instrument: trade.instrument,
          tradeType: trade.tradeType,
          quantity: trade.quantity,
          entryPrice: Number(entryPrice)/100,
          exitPrice: Number(exitPriceBig)/100,
          realizedPnl: Number(realizedPnl)/100,
          newBalance: Number(newBalance)/100,
          newStatus,
          riskEvents: riskEvents.map(e => e.type),
          drawdownPct: (Number(drawdownAmount) / Number(accountSize) * 100).toFixed(2),
          dailyPnl: Number(newDailyPnl)/100,
          timestamp: new Date().toISOString(),
        }),
      ]
    )

    return {
      trade: {
        id: tradeId,
        pnl: Number(realizedPnl)/100,
        exitPrice: Number(exitPriceBig)/100,
        status: 'CLOSED',
      },
      challenge: {
        id: challengeId,
        currentBalance: Number(newBalance)/100,
        totalPnl: Number(newTotalPnl)/100,
        dailyPnl: Number(newDailyPnl)/100,
        peakBalance: Number(newPeak)/100,
        status: newStatus,
        daysTraded,
        profitTargetPct: (Number(newTotalPnl) / Number(profitTarget) * 100).toFixed(1),
        drawdownPct: (Number(drawdownAmount) / Number(accountSize) * 100).toFixed(2),
        dailyLossPct: (Math.abs(Number(newDailyPnl)) / Number(accountSize) * 100).toFixed(2),
      },
      riskEvents,
    }
  })
}

// ─────────────────────────────────────
// EMIT SOCKET EVENTS
// (after transaction commits)
// ─────────────────────────────────────
const emitTradeEvents = (userId, challengeId, result) => {
  const io = socketIO.getIO()
  if (!io) return

  const room = 'challenge:' + challengeId

  io.to(room).emit('equity:snapshot', {
    challengeId,
    currentBalance: result.challenge.currentBalance,
    totalPnl: result.challenge.totalPnl,
    dailyPnl: result.challenge.dailyPnl,
    peakBalance: result.challenge.peakBalance,
    profitTargetPct: result.challenge.profitTargetPct,
    drawdownPct: result.challenge.drawdownPct,
    dailyLossPct: result.challenge.dailyLossPct,
    timestamp: new Date().toISOString(),
  })

  result.riskEvents.forEach(event => {
    io.to(room).emit('risk_event', {
      ...event,
      challengeId,
      timestamp: new Date().toISOString(),
    })
  })
}

module.exports = {
  validatePreTrade,
  processTrade,
  closeTrade,
  emitTradeEvents,
  getMarketStatus,
  getLotSize,
  isValidInstrument,
}
