const prisma = require('../utils/prisma');
const cache = require('../services/cache.service');

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

module.exports = {
  getGlobalStats,
  getAllChallenges,
  updateChallengeStatus
};
