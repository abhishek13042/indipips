const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/trade.controller');
const { protect } = require('../middleware/auth.middleware');

// All trade routes are protected
router.use(protect);

router.post('/open', tradeController.openTrade);
router.post('/close', tradeController.closeTrade);

module.exports = router;
