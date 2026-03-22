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
      include: { plan: true, payouts: true }
    });

    if (!challenge || challenge.userId !== req.userId) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    // 1. Check Payout Age (14 days after passing)
    const ageCheck = payoutService.checkPayoutAge(challenge);
    
    // 2. Determine if first payout (no SUCCESS/PENDING payouts yet)
    const isFirstPayout = !challenge.payouts.some(p => p.status === 'SUCCESS' || p.status === 'PENDING' || p.status === 'APPROVED' || p.status === 'TRANSFERRED');

    const profit = challenge.currentBalance - challenge.accountSize;
    const minProfit = 50000n; // ₹500 minimum (50000 paise)
    const isProfitEligible = profit >= minProfit;

    const breakdown = payoutService.calculateBreakdown(
      profit > 0n ? profit : 0n, 
      challenge.plan.challengeFee,
      isFirstPayout,
      challenge.profitSplitPct || 80
    );

    res.json({
      success: true,
      data: {
        eligible: ageCheck.isEligible && isProfitEligible,
        reason: !ageCheck.isEligible ? ageCheck.reason : (!isProfitEligible ? 'Minimum profit of ₹500 required.' : 'You are eligible for payout.'),
        availableFrom: ageCheck.availableFrom,
        daysRemaining: ageCheck.daysRemaining,
        minimumAmount: 500,
        estimatedPayout: {
          grossProfit: Number(profit) / 100,
          traderShare: breakdown.traderGrossShare / 100,
          tdsAmount: breakdown.tdsAmount / 100,
          feeRefund: breakdown.feeRefund / 100,
          netPayout: breakdown.netPayout / 100
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
      include: { user: true, plan: true, payouts: true }
    });

    if (!challenge || challenge.userId !== req.userId) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    // 1. KYC Guard
    if (challenge.user.kycStatus !== 'VERIFIED') {
      return res.status(403).json({
        success: false,
        message: 'Complete KYC verification before requesting a payout.'
      });
    }

    // 2. 14-Day Hold Guard
    const ageCheck = payoutService.checkPayoutAge(challenge);
    if (!ageCheck.isEligible) {
      return res.status(403).json({
        success: false,
        message: ageCheck.reason,
        data: { availableFrom: ageCheck.availableFrom, daysRemaining: ageCheck.daysRemaining }
      });
    }

    const profit = challenge.currentBalance - challenge.accountSize;
    if (profit < 50000n) { // ₹500 min
      return res.status(400).json({ success: false, message: 'Minimum profit for payout is ₹500.' });
    }

    // 3. First Payout Detection
    const isFirstPayout = !challenge.payouts.some(p => p.status === 'SUCCESS' || p.status === 'PENDING' || p.status === 'APPROVED' || p.status === 'TRANSFERRED');

    const breakdown = payoutService.calculateBreakdown(
      profit, 
      challenge.plan.challengeFee, 
      isFirstPayout,
      challenge.profitSplitPct || 80
    );

    // Create Payout Record
    const payout = await prisma.payout.create({
      data: {
        userId: req.userId,
        challengeId: challengeId,
        amountRequested: BigInt(Math.floor(breakdown.traderGrossShare)),
        tdsAmount: BigInt(Math.floor(breakdown.tdsAmount)),
        netPayoutAmount: BigInt(Math.floor(breakdown.netPayout)),
        feeRefund: BigInt(Math.floor(breakdown.feeRefund)),
        profitSplit: challenge.profitSplitPct || 80,
        traderSharePct: challenge.profitSplitPct || 80,
        isFirstPayout: isFirstPayout,
        status: 'PENDING'
      }
    });

    res.json({
      success: true,
      message: 'Payout request submitted successfully.',
      data: {
        ...payout,
        amountRequested: Number(payout.amountRequested) / 100,
        tdsAmount: Number(payout.tdsAmount) / 100,
        netPayoutAmount: Number(payout.netPayoutAmount) / 100
      }
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
          select: { accountNodeId: true }
        }
      },
      orderBy: { requestedAt: 'desc' }
    });

    const formatted = payouts.map(p => ({
      ...p,
      amountRequested: Number(p.amountRequested) / 100,
      tdsAmount: Number(p.tdsAmount || 0) / 100,
      netPayoutAmount: Number(p.netPayoutAmount || 0) / 100
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
