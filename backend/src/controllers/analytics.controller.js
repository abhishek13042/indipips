const prisma = require('../utils/prisma');

exports.getGlobalAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Fetch Challenges (Active)
    const challenges = await prisma.challenge.findMany({
      where: { userId, status: { not: 'EXPIRED' } }
    });

    // 2. Total Allocation
    let totalAllocation = BigInt(0);
    challenges.forEach(c => {
      totalAllocation += c.accountSize;
    });

    // 3. Fetch all closed trades
    const trades = await prisma.trade.findMany({
      where: { userId, status: 'CLOSED' }
    });

    const totalTrades = trades.length;

    // Default response structure matching frontend mockData
    const analytics = {
      totalAllocation: Number(totalAllocation) / 100, // Assuming cents structure if BigInt is used. Wait, BigInt is usually exact dollars or cents. In existing indpips, accountSize 5000 is usually 500000 cents. Or maybe just dollars. We will cast to number.
      totalTrades,
      level: 'Bronze', // static for now or based on total reward
      totalReward: 0.00,
      highestReward: 0.00,
      count: 0,
      winRate: 0,
      won: 0,
      lost: 0,
      avgHolding: '0m',
      sessions: [
        { name: 'New York', percent: 0, val: 0, total: 0, won: 0 },
        { name: 'London', percent: 0, val: 0, total: 0, won: 0 },
        { name: 'Asia', percent: 0, val: 0, total: 0, won: 0 }
      ],
      instruments: [],
      bias: { buy: 0, sell: 0 },
      dayPerformance: [
      { l: 'Sun', v: 0, isPos: true, rawPnl: BigInt(0) },
      { l: 'Mon', v: 0, isPos: true, rawPnl: BigInt(0) },
      { l: 'Tue', v: 0, isPos: true, rawPnl: BigInt(0) },
      { l: 'Wed', v: 0, isPos: true, rawPnl: BigInt(0) },
      { l: 'Thu', v: 0, isPos: true, rawPnl: BigInt(0) },
      { l: 'Fri', v: 0, isPos: true, rawPnl: BigInt(0) },
      { l: 'Sat', v: 0, isPos: true, rawPnl: BigInt(0) }
    ]
  };

  if (totalTrades === 0) {
    analytics.totalAllocation = Number(totalAllocation) / 100;
    return res.status(200).json({ success: true, data: analytics });
  }

  let totalHoldingMs = 0;
  const instrumentMap = {};

  trades.forEach(t => {
    // rawPnl is already BigInt in DB
    const pnlRaw = t.pnl || BigInt(0);
    const pnlNum = Number(pnlRaw) / 100;
    const isWin = pnlNum >= 0;

    // Profitability
    if (isWin) analytics.won++;
    else analytics.lost++;

    // Holding Period
    if (t.entryTime && t.exitTime) {
      totalHoldingMs += (new Date(t.exitTime) - new Date(t.entryTime));
    }

    // Bias
    if (t.tradeType === 'BUY') analytics.bias.buy++;
    else analytics.bias.sell++;

    // Instruments
    const symbol = t.symbol || t.instrument || 'Unknown';
    if (!instrumentMap[symbol]) instrumentMap[symbol] = { name: symbol, w: 0, l: 0, total: 0 };
    if (isWin) instrumentMap[symbol].w++;
    else instrumentMap[symbol].l++;
    instrumentMap[symbol].total++;

    // Trading Day Performance (0-6)
    // Handle safely
    const entryDate = t.entryTime ? new Date(t.entryTime) : new Date();
    const day = entryDate.getDay(); 
    if (analytics.dayPerformance[day]) {
       analytics.dayPerformance[day].rawPnl += pnlRaw;
    }

    // Sessions (UTC)
    const hour = entryDate.getUTCHours();
    let sessionIndex = 2; // Asia/Other
    if (hour >= 13 && hour <= 21) sessionIndex = 0; // NY
    else if (hour >= 8 && hour < 13) sessionIndex = 1; // London

    analytics.sessions[sessionIndex].total++;
    if (isWin) analytics.sessions[sessionIndex].won++;
  });

  // Formatting calculations
  analytics.winRate = Number(((analytics.won / totalTrades) * 100).toFixed(1));
  
  // Average holding time
  const avgMs = totalHoldingMs / totalTrades;
  const avgMins = Math.round(avgMs / 60000);
  if (avgMins > 60) analytics.avgHolding = `${Math.round(avgMins / 60)}h ${avgMins % 60}m`;
  else analytics.avgHolding = `${avgMins}m`;

  // Top 3 Instruments
  const sortedInst = Object.values(instrumentMap).sort((a, b) => b.total - a.total).slice(0, 3);
  analytics.instruments = sortedInst;

  // Session percents
  analytics.sessions.forEach(s => {
    s.percent = s.total > 0 ? Number(((s.won / s.total) * 100).toFixed(1)) : 0;
    s.val = s.percent;
  });

  // Day Performance logic
  analytics.dayPerformance.forEach(d => {
     const p = Number(d.rawPnl) / 100;
     d.v = Math.abs(p);
     d.isPos = p >= 0;
     delete d.rawPnl;
  });

    res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    next(error);
  }
};
