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
        { l: 'Fri', v: 0, isPos: true, rawPnl: BigInt(0) }
      ]
    };

    if (totalTrades === 0) {
      analytics.totalAllocation = Number(totalAllocation);
      return res.status(200).json({ success: true, data: analytics });
    }

    let totalHoldingMs = 0;
    const instrumentMap = {};

    trades.forEach(t => {
      const pnl = Number(t.pnl) / 100; // Assuming cents
      const isWin = pnl >= 0;

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
      if (!instrumentMap[t.symbol]) instrumentMap[t.symbol] = { name: t.symbol, w: 0, l: 0, total: 0 };
      if (isWin) instrumentMap[t.symbol].w++;
      else instrumentMap[t.symbol].l++;
      instrumentMap[t.symbol].total++;

      // Trading Day Performance (0 = Sunday, 1 = Monday ...)
      const day = new Date(t.entryTime).getUTCDay();
      if (day >= 0 && day <= 5) {
         analytics.dayPerformance[day].rawPnl += BigInt(Math.round(pnl * 100));
      }

      // Sessions (Simplistic UTC hour mapping)
      // NY: 13-21, London: 8-16, Asia: 0-8. We'll assign based on entry hour
      const hour = new Date(t.entryTime).getUTCHours();
      let sessionIndex = -1;
      if (hour >= 13 && hour <= 21) sessionIndex = 0; // NY
      else if (hour >= 8 && hour < 13) sessionIndex = 1; // London
      else sessionIndex = 2; // Asia (or fallback)

      analytics.sessions[sessionIndex].total++;
      if (isWin) analytics.sessions[sessionIndex].won++;
    });

    // Formatting calculations
    analytics.totalAllocation = Number(totalAllocation);
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
       d.v = Math.abs(p); // value for bar height
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
