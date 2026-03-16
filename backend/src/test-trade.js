require('dotenv').config();
const prisma = require('./utils/prisma');
const { calculateBreach } = require('./utils/riskEngine');

async function runTest() {
  console.log('🚀 Starting Day 8 Risk Engine Verification...');

  try {
    // 1. Get a mock challenge
    const challenge = await prisma.challenge.findFirst({
      where: { status: 'ACTIVE' },
      include: { plan: true }
    });

    if (!challenge) {
      console.log('❌ No active challenge found to test. Please seed the DB first.');
      return;
    }

    console.log(`📌 Testing on Challenge: ${challenge.id} (Account Node: ${challenge.accountNodeId})`);
    console.log(`💰 Current Balance: ${Number(challenge.currentBalance) / 100}`);

    // 2. Simulate Opening a Trade
    console.log('\n--- Step 1: Opening a BUY Trade ---');
    const entryPrice = 150.50;
    const quantity = 10;
    const initialBalance = Number(challenge.currentBalance);

    const trade = await prisma.trade.create({
      data: {
        challengeId: challenge.id,
        userId: challenge.userId,
        symbol: 'NIFTY50',
        tradeType: 'BUY',
        quantity: quantity,
        entryPrice: BigInt(Math.round(entryPrice * 100)),
        status: 'OPEN',
      },
    });
    console.log(`✅ Trade opened (ID: ${trade.id}) at ${entryPrice}`);

    // 3. Simulate Closing with Profit
    console.log('\n--- Step 2: Closing with Profit ---');
    const exitPriceProfit = 155.00; // $4.5 profit per unit -> $45 total
    const pnlProfit = Math.round((exitPriceProfit - entryPrice) * quantity * 100);

    const closedTradeProfit = await prisma.trade.update({
      where: { id: trade.id },
      data: {
        exitPrice: BigInt(Math.round(exitPriceProfit * 100)),
        exitTime: new Date(),
        status: 'CLOSED',
        pnl: BigInt(pnlProfit),
      }
    });

    const newBalanceProfit = initialBalance + pnlProfit;
    const updatedChallengeProfit = await prisma.challenge.update({
      where: { id: challenge.id },
      data: {
        currentBalance: BigInt(newBalanceProfit),
        totalPnl: { increment: BigInt(pnlProfit) },
        winCount: { increment: 1 }
      }
    });
    console.log(`📈 Trade closed with PnL: ${pnlProfit / 100}. New Balance: ${newBalanceProfit / 100}`);

    // 4. Simulate A Major Loss (Trigger Breach)
    console.log('\n--- Step 3: Simulating a BREACH ---');
    // For a 250k account, 4% daily loss is $10,000.
    // Let's force a loss of $15,000.
    const entryPriceLoss = 500.00;
    const quantityLoss = 300;
    const exitPriceLoss = 450.00; // $50 loss per unit -> $15,000 total loss
    const pnlLoss = Math.round((exitPriceLoss - entryPriceLoss) * quantityLoss * 100);

    const tradeLoss = await prisma.trade.create({
      data: {
        challengeId: challenge.id,
        userId: challenge.userId,
        symbol: 'SENSEX',
        tradeType: 'BUY',
        quantity: quantityLoss,
        entryPrice: BigInt(Math.round(entryPriceLoss * 100)),
        status: 'OPEN',
      }
    });

    const closedTradeLoss = await prisma.trade.update({
      where: { id: tradeLoss.id },
      data: {
        exitPrice: BigInt(Math.round(exitPriceLoss * 100)),
        exitTime: new Date(),
        status: 'CLOSED',
        pnl: BigInt(pnlLoss),
      }
    });

    const newBalanceLoss = newBalanceProfit + pnlLoss;
    const updatedChallengeLoss = await prisma.challenge.update({
      where: { id: challenge.id },
      data: {
        currentBalance: BigInt(newBalanceLoss),
        totalPnl: { increment: BigInt(pnlLoss) },
        lossCount: { increment: 1 }
      }
    });

    // Run Risk Engine
    const breach = calculateBreach(updatedChallengeLoss, newBalanceLoss);
    if (breach.isBreached) {
      console.log(`🚨 BREACH DETECTED: ${breach.reason}`);
      console.log(`📝 Details: ${breach.details}`);
      
      await prisma.challenge.update({
        where: { id: challenge.id },
        data: {
          status: 'FAILED',
          failReason: breach.reason + ': ' + breach.details
        }
      });
      console.log('🔒 Account Status updated to FAILED');
    } else {
      console.log('⚠️ Breach NOT detected? (Check logic)');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
