const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth.middleware')
const {
  openTrade,
  closeTrade,
  getActiveTrades,
  getTradeHistory,
  marketStatus,
  checkJobStatus,
} = require('../controllers/trade.controller')
const { tradeLimiter } = require('../middleware/rateLimiter.middleware')

// PUBLIC — no rate limit
router.get('/market-status', marketStatus)

// PROTECTED GET — no rate limit on reads
router.get('/active', protect, getActiveTrades)
router.get('/history', protect, getTradeHistory)
router.get('/job/:jobId', protect, checkJobStatus)

// PROTECTED POST — rate limited (orders only)
router.post('/open', protect, tradeLimiter, openTrade)
router.post('/close', protect, tradeLimiter, closeTrade)

module.exports = router
