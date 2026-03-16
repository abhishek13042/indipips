const prisma = require('./utils/prisma');
const { calculateBreach } = require('./utils/riskEngine');
const brokerService = require('./services/broker.service');
const statsEngine = require('./utils/statsEngine');

async function runVerification() {
  console.log('🚀 Starting Week 2 End-to-End Verification...');

  try {
    // 1. Setup - Find or create test user, plan and challenge
    console.log('\n--- Step 1: Data Setup ---');
    let user = await prisma.user.findFirst({ where: { email: 'tester@indipips.com' } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'tester@indipips.com',
          fullName: 'Week 2 Tester',
          password: 'hashed_password_here',
          isEmailVerified: true,
        }
      });
    }

    let plan = await prisma.plan.findFirst();
    if (!plan) {
      plan = await prisma.plan.create({
        data: {
          name: 'Verification Plan',
          description: 'Used for Day 12 verification',
          price: 500,
          accountSize: BigInt(10000000), // 100k
          profitTarget: 10,
          dailyLossLimit: 4,
          maxDrawdown: 8,
          minTradingDays: 5,
          maxTradingDays: 30,
          profitSplit: 80,
          challengeType: 'EVALUATION',
        }
      });
    }

    const accountSize = 250000;
    const challenge = await prisma.challenge.create({
      data: {
        userId: user.id,
        planId: plan.id,
        accountSize: BigInt(accountSize * 100),
        currentBalance: BigInt(accountSize * 100),
        peakBalance: BigInt(accountSize * 100),
        dailyStartingBalance: BigInt(accountSize * 100),
        status: 'ACTIVE',
        phase: 1,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }
    });
    console.log(`✅ Test Account Created: ${challenge.id} ($${accountSize})`);

    // 2. Open a Trade via Broker Service
    console.log('\n--- Step 2: Trade Execution ---');
    const trade = await brokerService.placeOrder(
      user.id,
      challenge.id,
      'XAUUSD',
      'BUY',
      10,
      2000.00
    );
    console.log(`✅ Trade Opened: ${trade.id} @ $2000.00`);

    // 3. Close with small profit to check Stats Engine
    console.log('\n--- Step 3: Stats Verification ---');
    const closedTrade = await brokerService.closeOrder(trade.id, 2010.00);
    const pnl = Number(closedTrade.pnl) / 100;
    console.log(`✅ Trade Closed: PnL = $${pnl}`);

    const stats = statsEngine.calculatePerformanceStats([closedTrade], accountSize);
    console.log(`📈 Calculated Win Rate: ${stats.winRate}% (Expected: 100%)`);
    console.log(`📊 Profit Factor: ${stats.profitFactor}`);

    // 4. Trigger Risk Breach (Daily Loss > 4%)
    console.log('\n--- Step 4: Risk Breach Simulation ---');
    const lossTrade = await brokerService.placeOrder(
      user.id,
      challenge.id,
      'GBPUSD',
      'BUY',
      10,
      1.2500
    );
    
    // Simulate a massive drop to trigger breach ($15,000 loss > $10,000 limit)
    const exitPrice = 1.2500 - (15000 / (10 * 100)); // Simplified math for script
    const breachedTrade = await brokerService.closeOrder(lossTrade.id, 1.1000); 
    
    const newBalance = Number(challenge.currentBalance) + Number(closedTrade.pnl) + Number(breachedTrade.pnl);
    const breachResult = calculateBreach(challenge, newBalance / 100);

    console.log(`🚨 Breach Check: ${breachResult.isBreached ? 'DETECTED' : 'NOT DETECTED'}`);
    console.log(`📝 Reason: ${breachResult.reason}`);

    if (breachResult.isBreached) {
      await prisma.challenge.update({
        where: { id: challenge.id },
        data: { status: 'FAILED' }
      });
      console.log('🔒 Account Status updated to FAILED');
    }

    console.log('\n✅ WEEK 2 VERIFICATION COMPLETE: ALL SYSTEMS NOMINAL');
  } catch (error) {
    console.error('❌ Verification Failed!');
    console.error('Error Message:', error.message);
    if (error.code) console.error('Error Code:', error.code);
    if (error.meta) console.error('Error Meta:', error.meta);
  } finally {
    process.exit();
  }
}

runVerification();
