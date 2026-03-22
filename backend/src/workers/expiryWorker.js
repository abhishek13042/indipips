const cron = require('node-cron');
const prisma = require('../utils/prisma');
const socketIO = require('../utils/socket');
const emailService = require('../services/email.service');

/**
 * Expiry Worker
 * Runs every day at midnight IST (18:30 UTC) to check for expired challenges.
 */
const initExpiryWorker = () => {
  console.log('📅 Challenge Expiry Worker Initialized');

  // Cron expression: 30 18 * * * (18:30 UTC corresponds to 00:00 IST)
  cron.schedule('30 18 * * *', async () => {
    console.log(`⏱️ [${new Date().toLocaleString()}] Running daily challenge expiry check...`);

    try {
      const now = new Date();

      // Find all ACTIVE challenges that have passed their expiry date
      const expiredChallenges = await prisma.challenge.findMany({
        where: {
          status: 'ACTIVE',
          expiryDate: { lt: now }
        },
        include: { user: true }
      });

      if (expiredChallenges.length === 0) {
        console.log('✅ No challenges expired today.');
        return;
      }

      const io = socketIO.getIO();

      for (const challenge of expiredChallenges) {
        console.log(`⚠️ Expiring Challenge ${challenge.id} (User: ${challenge.userId})`);

        // 1. Update Database Status
        await prisma.challenge.update({
          where: { id: challenge.id },
          data: {
            status: 'EXPIRED',
            failReason: 'Challenge expired after 45 days without meeting profit target'
          }
        });

        // 2. Emit Socket Event
        if (io) {
          io.to(challenge.userId).emit('risk_event', {
            type: 'CHALLENGE_EXPIRED',
            message: 'Your challenge has expired as the 45-day trading period has ended.',
            challengeId: challenge.id
          });
        }

        // 3. Send Email Notification
        try {
          await emailService.sendEmail({
            to: challenge.user.email,
            subject: 'Challenge Expired - Indipips',
            template: 'challenge_expired', // Assuming this template exists or will be created
            context: {
              name: challenge.user.fullName,
              challengeId: challenge.accountNodeId || challenge.id,
              expiryDate: challenge.expiryDate.toLocaleDateString()
            }
          });
        } catch (emailError) {
          console.error(`📧 Failed to send expiry email to ${challenge.user.email}:`, emailError.message);
        }
      }

      console.log(`✅ Successfully processed ${expiredChallenges.length} expired challenges.`);
    } catch (error) {
      console.error('⚠️ Expiry Worker Error:', error);
    }
  });
};

module.exports = { initExpiryWorker };
