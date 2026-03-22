const cron = require('node-cron')
const { query } = require('../utils/db')
const { 
  resetDailyPnl,
  invalidateChallengeCache 
} = require('../utils/cache.service')
const socketIO = require('../utils/socket')

// Run at 3:45 AM UTC = 9:15 AM IST
// Every weekday (Mon-Fri)
cron.schedule('45 3 * * 1-5', async () => {
  console.log('🕐 Daily Reset: Starting 9:15 AM IST reset...')
  
  try {
    // Get today's date in IST
    const now = new Date()
    const ist = new Date(now.getTime() + 5.5*60*60*1000)
    const today = ist.toISOString().split('T')[0]

    // 1. Reset daily P&L and lift 
    //    daily suspensions
    const result = await query(
      `UPDATE "Challenge"
       SET "dailyPnl" = 0,
           "dailyStartingBalance" = "currentBalance",
           status = CASE 
             WHEN status = 'SUSPENDED' THEN 'ACTIVE'
             ELSE status 
           END,
           "updatedAt" = NOW()
       WHERE status IN ('ACTIVE', 'SUSPENDED')
       RETURNING id, "userId", status`,
      []
    )

    console.log('✅ Daily Reset: Reset ' + result.rowCount + ' challenges')

    // 2. Clear Redis cache for all reset
    for (const row of result.rows) {
      await invalidateChallengeCache(row.id)
      await resetDailyPnl(row.id, today)
      
      // 3. Notify reinstated traders
      if (row.status === 'ACTIVE') {
        const io = socketIO.getIO()
        if (io) {
          io.to('challenge:' + row.id)
            .emit('risk_event', {
              type: 'DAILY_RESET',
              message: 'New trading day! Daily loss limit reset. Market opens at 9:15 AM IST.',
              timestamp: now.toISOString(),
            })
        }
      }
    }

    // 4. Expire old challenges
    const expireResult = await query(
      `UPDATE "Challenge"
       SET status = 'EXPIRED',
           "failReason" = 'Challenge expired — 45 day limit reached without meeting profit target.',
           "updatedAt" = NOW()
       WHERE status = 'ACTIVE'
       AND "expiryDate" < NOW()
       RETURNING id, "userId"`,
      []
    )
    
    if (expireResult.rowCount > 0) {
      console.log('⏰ Expired ' + expireResult.rowCount + ' challenges')
    }

    console.log('✅ Daily Reset Complete: ' + result.rowCount + ' reset, ' + expireResult.rowCount + ' expired')

  } catch (error) {
    console.error('❌ Daily Reset Error:', error.message)
  }
}, {
  timezone: 'UTC'
  // Using UTC cron — 3:45 UTC = 9:15 IST
})

module.exports = { 
  name: 'Daily Reset Worker' 
}
