/**
 * Broker Service
 * Abstract layer for all trading operations.
 * Currently supports 'Mock Mode' but can be extended for Upstox/Live APIs.
 */

const prisma = require('../utils/prisma');
const upstoxService = require('./upstox.service');

/**
 * Execute a new order
 */
const placeOrder = async (userId, challengeId, symbol, type, quantity, entryPrice) => {
  // 1. Fetch Challenge and User details
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: { user: true }
  });

  if (!challenge || challenge.status !== 'ACTIVE') {
    throw new Error('Challenge is not active or not found.');
  }

  let brokerTradeId = null;

  // 2. ROUTING: If Challenge is LIVE, hit Upstox
  if (challenge.isLive) {
    if (!challenge.user.brokerAccessToken) {
      throw new Error('Broker not connected for live challenge.');
    }

    const orderResponse = await upstoxService.placeOrder(challenge.user.brokerAccessToken, {
      symbol,
      quantity,
      side: type === 'BUY' ? 'BUY' : 'SELL'
    });

    brokerTradeId = orderResponse.brokerOrderId;
  }

  // 3. Create the Internal Trade record
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
      brokerTradeId: brokerTradeId // Store this for reconciliation
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
    include: { challenge: { include: { user: true } } }
  });

  if (!trade || trade.status !== 'OPEN') {
    throw new Error('Trade not found or already closed');
  }

  // ROUTING: If Challenge is LIVE, exit on Upstox
  if (trade.challenge.isLive && trade.brokerTradeId) {
    const accessToken = trade.challenge.user.brokerAccessToken;
    await upstoxService.closeOrder(accessToken, trade.brokerTradeId);
  }

  const exitPriceCents = BigInt(Math.round(exitPrice * 100));
  const entryPriceCents = trade.entryPrice;
  
  // Calculate PnL in cents
  let pnlCents;
  if (trade.tradeType === 'BUY') { // Fixed tradeType check (was .type in old mock)
    pnlCents = (exitPriceCents - entryPriceCents) * BigInt(trade.quantity);
  } else {
    pnlCents = (entryPriceCents - exitPriceCents) * BigInt(trade.quantity);
  }

  // Update Internal Trade
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

const priceFeed = require('../utils/priceFeed');

/**
 * Get Market Price
 * Uses live Upstox feed data if available, otherwise returns null.
 */
const getMarketPrice = (symbol) => {
  const livePrice = priceFeed.getPrice(symbol);
  if (livePrice) return livePrice;
  // Return null in practice mode — controllers should handle this gracefully
  return null;
};

module.exports = {
  placeOrder,
  closeOrder,
  getMarketPrice,
};
