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

router.get('/market-status', marketStatus)
router.get('/active', protect, getActiveTrades)
router.get('/history', protect, getTradeHistory)
router.get('/job/:jobId', protect, checkJobStatus)
router.post('/open', protect, openTrade)
router.post('/close', protect, closeTrade)

module.exports = router
