/**
 * Broker Service
 * Abstract layer for all trading operations.
 * Currently supports 'Mock Mode' but can be extended for Upstox/Live APIs.
 */

const prisma = require('../utils/prisma');

/**
 * Execute a new order
 */
const placeOrder = async (userId, challengeId, symbol, type, quantity, entryPrice) => {
  // 1. Create the Trade record
  const trade = await prisma.trade.create({
    data: {
      userId,
      challengeId,
      symbol,
      tradeType: type,
      quantity,
      entryPrice: BigInt(Math.round(entryPrice * 100)),
      status: 'OPEN',
      entryTime: new Date(),
    },
  });

  return trade;
};

/**
 * Close an existing order
 */
const closeOrder = async (tradeId, exitPrice) => {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
  });

  if (!trade || trade.status !== 'OPEN') {
    throw new Error('Trade not found or already closed');
  }

  const exitPriceCents = BigInt(Math.round(exitPrice * 100));
  const entryPriceCents = trade.entryPrice;
  
  // Calculate PnL in cents
  let pnlCents;
  if (trade.type === 'BUY') {
    pnlCents = (exitPriceCents - entryPriceCents) * BigInt(trade.quantity);
  } else {
    pnlCents = (entryPriceCents - exitPriceCents) * BigInt(trade.quantity);
  }

  // Update Trade
  const updatedTrade = await prisma.trade.update({
    where: { id: tradeId },
    data: {
      exitPrice: exitPriceCents,
      pnl: pnlCents,
      status: 'CLOSED',
      exitTime: new Date(),
    },
  });

  return updatedTrade;
};

/**
 * Get Market Data (Mock)
 */
const getMarketPrice = async (symbol) => {
  // In Phase 5, this will call Upstox API
  // For now, return a random price or static for simplicity
  return Math.random() * 100 + 100;
};

module.exports = {
  placeOrder,
  closeOrder,
  getMarketPrice,
};
