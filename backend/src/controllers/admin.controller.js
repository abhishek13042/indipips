const prisma = require('../utils/prisma');
const cache = require('../services/cache.service');
const auditLogger = require('../utils/auditLogger');

/**
 * Get Global Platform Stats
 * GET /api/v1/admin/stats
 */
const getGlobalStats = async (req, res) => {
  try {
    const cacheKey = 'admin:global_stats';
    
    const stats = await cache.getOrSet(cacheKey, async () => {
      const totalUsers = await prisma.user.count({ where: { role: 'TRADER' } });
      const activeChallenges = await prisma.challenge.count({ where: { status: 'ACTIVE' } });
      const failedChallenges = await prisma.challenge.count({ where: { status: 'FAILED' } });
      const totalAum = await prisma.challenge.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { accountSize: true }
      });

      return {
        totalUsers,
        activeChallenges,
        failedChallenges,
        totalAum: Number(totalAum._sum.accountSize || 0) / 100
      };
    }, 300); // 5 minute cache

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Admin global stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * Get All Challenges (Filterable)
 * GET /api/v1/admin/challenges
 */
const getAllChallenges = async (req, res) => {
  try {
    const { status, phase, userId } = req.query;

    const challenges = await prisma.challenge.findMany({
      where: {
        status: status || undefined,
        phase: phase ? parseInt(phase) : undefined,
        userId: userId || undefined
      },
      include: {
        user: {
          select: { fullName: true, email: true }
        },
        plan: {
          select: { name: true, accountSize: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = challenges.map(c => ({
      ...c,
      currentBalance: Number(c.currentBalance) / 100,
      accountSize: Number(c.accountSize) / 100,
      totalPnl: Number(c.totalPnl) / 100
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Admin get challenges error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * Update Challenge Status (Manual Intervention)
 * PATCH /api/v1/admin/challenges/:id/status
 */
const updateChallengeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, failReason } = req.body;

    const challenge = await prisma.challenge.update({
      where: { id },
      data: {
        status,
        failReason: failReason || undefined
      }
    });

    // 3. Clear cache
    await cache.del('admin:global_stats');

    res.json({
      success: true,
      message: `Challenge status updated to ${status}.`,
      data: challenge
    });
  } catch (error) {
    console.error('Admin update challenge error:', error);
    res.status(500).json({ success: false, message: 'Failed to update challenge status.' });
  }
};

/**
 * Get All Pending Payouts
 * GET /api/v1/admin/payouts
 */
const getAllPayouts = async (req, res) => {
  try {
    const { status } = req.query;
    const payouts = await prisma.payout.findMany({
      where: { status: status || undefined },
      include: {
        user: { select: { fullName: true, email: true, bankAccount: true, bankIfsc: true } },
        challenge: { select: { accountNodeId: true } }
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
    console.error('Admin get payouts error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * Approve a Payout
 * PATCH /api/v1/admin/payouts/:id/approve
 */
const approvePayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { bankReference } = req.body;

    const payout = await prisma.payout.update({
      where: { id },
      data: {
        status: 'APPROVED',
        adminId: req.userId,
        bankReference: bankReference || null,
        processedAt: new Date()
      }
    });

    await auditLogger.logAction({
      userId: payout.userId,
      action: 'PAYOUT_APPROVED',
      amount: Number(payout.amountAfterTds),
      metadata: { adminId: req.userId, payoutId: id, bankReference }
    });

    res.json({ success: true, message: 'Payout approved successfully.', data: payout });
  } catch (error) {
    console.error('Admin approve payout error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve payout.' });
  }
};

/**
 * Reject a Payout
 * PATCH /api/v1/admin/payouts/:id/reject
 */
const rejectPayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payout = await prisma.payout.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminId: req.userId,
        processedAt: new Date()
      }
    });

    await auditLogger.logAction({
      userId: payout.userId,
      action: 'PAYOUT_REJECTED',
      amount: Number(payout.amountRequested),
      metadata: { adminId: req.userId, payoutId: id, reason }
    });

    res.json({ success: true, message: 'Payout rejected.', data: payout });
  } catch (error) {
    console.error('Admin reject payout error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject payout.' });
  }
};

module.exports = {
  getGlobalStats,
  getAllChallenges,
  updateChallengeStatus,
  getAllPayouts,
  approvePayout,
  rejectPayout
};
