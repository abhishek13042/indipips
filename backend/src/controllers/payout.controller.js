const prisma = require('../utils/prisma');
const payoutService = require('../services/payout.service');

/**
 * Get Payout Eligibility
 * GET /api/v1/payouts/eligibility/:challengeId
 */
const getPayoutEligibility = async (req, res) => {
  try {
    const { challengeId } = req.params;

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { plan: true }
    });

    if (!challenge || challenge.userId !== req.userId) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    // Payout Logic:
    // 1. Must be in ACTIVE or PASSED status
    // 2. Balance must be > Account Size (Profit)
    // 3. Minimum profit $100 (10000 cents)

    const profit = challenge.currentBalance - challenge.accountSize;
    const isEligible = profit >= 10000n; // $100 minimum

    const breakdown = payoutService.calculateBreakdown(
      profit > 0n ? profit : 0n, 
      80 // Default 80% split for now
    );

    res.json({
      success: true,
      data: {
        isEligible,
        profit: Number(profit) / 100,
        breakdown: {
          ...breakdown,
          totalProfit: breakdown.totalProfit / 100,
          traderGrossShare: breakdown.traderGrossShare / 100,
          firmShare: breakdown.firmShare / 100,
          tdsAmount: breakdown.tdsAmount / 100,
          netPayout: breakdown.netPayout / 100
        },
        requirements: {
          minProfit: 100,
          status: ['ACTIVE', 'PASSED']
        }
      }
    });
  } catch (error) {
    console.error('Get payout eligibility error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * Request Payout
 * POST /api/v1/payouts/request
 */
const requestPayout = async (req, res) => {
  try {
    const { challengeId } = req.body;

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { user: true }
    });

    if (!challenge || challenge.userId !== req.userId) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    const profit = challenge.currentBalance - challenge.accountSize;
    if (profit < 10000n) {
      return res.status(400).json({ success: false, message: 'Minimum profit for payout is $100.' });
    }

    const breakdown = payoutService.calculateBreakdown(profit, 80);

    // Create Payout Record
    const payout = await prisma.payout.create({
      data: {
        userId: req.userId,
        challengeId: challengeId,
        amountRequested: BigInt(Math.floor(breakdown.traderGrossShare)),
        amountAfterTds: BigInt(Math.floor(breakdown.netPayout)),
        profitSplit: 80,
        status: 'PENDING'
      }
    });

    // Option: Reset challenge balance to account size after payout
    // For now, we'll just keep it pending and an admin will process it.
    
    res.json({
      success: true,
      message: 'Payout request submitted successfully.',
      data: payout
    });
  } catch (error) {
    console.error('Request payout error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * Get My Payouts
 * GET /api/v1/payouts/history
 */
const getMyPayouts = async (req, res) => {
  try {
    const payouts = await prisma.payout.findMany({
      where: { userId: req.userId },
      include: {
        challenge: {
          select: { nodeAccountId: true }
        }
      },
      orderBy: { requestedAt: 'desc' }
    });

    const formatted = payouts.map(p => ({
      ...p,
      amountRequested: Number(p.amountRequested) / 100,
      amountAfterTds: Number(p.amountAfterTds) / 100
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Get my payouts error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = {
  getPayoutEligibility,
  requestPayout,
  getMyPayouts
};
