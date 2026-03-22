require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { query } = require('../src/utils/db')

async function seedPlans() {
  console.log('Seeding plans...')

  try {
    // Delete existing plans and dependent records (Challenges, Trades)
    // using CASCADE to handle foreign key constraints
    await query(`TRUNCATE TABLE "Plan" RESTART IDENTITY CASCADE`)
    console.log('Cleared existing plans (with cascade)')

    const plans = [
      // ONE_STEP
      {
        name: 'Seed',
        type: 'ONE_STEP',
        accountSize: 25000000,
        challengeFee: 99900,
        profitTarget: 8,
        dailyLossLimit: 4,
        maxDrawdown: 8,
        minTradingDays: 5,
        maxTradingDays: 45,
        profitSplitPct: 80,
        isActive: true,
      },
      {
        name: 'Starter',
        type: 'ONE_STEP',
        accountSize: 50000000,
        challengeFee: 179900,
        profitTarget: 8,
        dailyLossLimit: 4,
        maxDrawdown: 8,
        minTradingDays: 5,
        maxTradingDays: 45,
        profitSplitPct: 80,
        isActive: true,
      },
      {
        name: 'Pro',
        type: 'ONE_STEP',
        accountSize: 100000000,
        challengeFee: 329900,
        profitTarget: 8,
        dailyLossLimit: 4,
        maxDrawdown: 8,
        minTradingDays: 5,
        maxTradingDays: 45,
        profitSplitPct: 80,
        isActive: true,
      },
      {
        name: 'Elite',
        type: 'ONE_STEP',
        accountSize: 150000000,
        challengeFee: 479900,
        profitTarget: 8,
        dailyLossLimit: 4,
        maxDrawdown: 8,
        minTradingDays: 5,
        maxTradingDays: 45,
        profitSplitPct: 80,
        isActive: true,
      },
      {
        name: 'Master',
        type: 'ONE_STEP',
        accountSize: 200000000,
        challengeFee: 599900,
        profitTarget: 8,
        dailyLossLimit: 4,
        maxDrawdown: 8,
        minTradingDays: 5,
        maxTradingDays: 45,
        profitSplitPct: 80,
        isActive: true,
      },
      // TWO_STEP
      {
        name: 'Seed',
        type: 'TWO_STEP',
        accountSize: 25000000,
        challengeFee: 79900,
        profitTarget: 8,
        phase2Target: 5,
        dailyLossLimit: 5,
        maxDrawdown: 10,
        minTradingDays: 5,
        maxTradingDays: 60,
        profitSplitPct: 80,
        isActive: true,
      },
      {
        name: 'Starter',
        type: 'TWO_STEP',
        accountSize: 50000000,
        challengeFee: 149900,
        profitTarget: 8,
        phase2Target: 5,
        dailyLossLimit: 5,
        maxDrawdown: 10,
        minTradingDays: 5,
        maxTradingDays: 60,
        profitSplitPct: 80,
        isActive: true,
      },
      {
        name: 'Pro',
        type: 'TWO_STEP',
        accountSize: 100000000,
        challengeFee: 279900,
        profitTarget: 8,
        phase2Target: 5,
        dailyLossLimit: 5,
        maxDrawdown: 10,
        minTradingDays: 5,
        maxTradingDays: 60,
        profitSplitPct: 80,
        isActive: true,
      },
      {
        name: 'Elite',
        type: 'TWO_STEP',
        accountSize: 150000000,
        challengeFee: 399900,
        profitTarget: 8,
        phase2Target: 5,
        dailyLossLimit: 5,
        maxDrawdown: 10,
        minTradingDays: 5,
        maxTradingDays: 60,
        profitSplitPct: 80,
        isActive: true,
      },
      {
        name: 'Master',
        type: 'TWO_STEP',
        accountSize: 200000000,
        challengeFee: 499900,
        profitTarget: 8,
        phase2Target: 5,
        dailyLossLimit: 5,
        maxDrawdown: 10,
        minTradingDays: 5,
        maxTradingDays: 60,
        profitSplitPct: 80,
        isActive: true,
      },
      // ZERO_STEP
      {
        name: 'Starter',
        type: 'ZERO_STEP',
        accountSize: 50000000,
        challengeFee: 269900,
        profitTarget: 0,
        dailyLossLimit: 3,
        maxDrawdown: 5,
        minTradingDays: 0,
        maxTradingDays: 999,
        profitSplitPct: 80,
        isActive: true,
      },
      {
        name: 'Pro',
        type: 'ZERO_STEP',
        accountSize: 100000000,
        challengeFee: 499900,
        profitTarget: 0,
        dailyLossLimit: 3,
        maxDrawdown: 5,
        minTradingDays: 0,
        maxTradingDays: 999,
        profitSplitPct: 80,
        isActive: true,
      },
      {
        name: 'Elite',
        type: 'ZERO_STEP',
        accountSize: 150000000,
        challengeFee: 719900,
        profitTarget: 0,
        dailyLossLimit: 3,
        maxDrawdown: 5,
        minTradingDays: 0,
        maxTradingDays: 999,
        profitSplitPct: 80,
        isActive: true,
      },
      {
        name: 'Master',
        type: 'ZERO_STEP',
        accountSize: 200000000,
        challengeFee: 899900,
        profitTarget: 0,
        dailyLossLimit: 3,
        maxDrawdown: 5,
        minTradingDays: 0,
        maxTradingDays: 999,
        profitSplitPct: 80,
        isActive: true,
      },
    ]

    for (const plan of plans) {
      await query(
        `INSERT INTO "Plan" (
          id, name, "challengeType",
          "accountSize", "challengeFee",
          "profitTarget", "phase2Target", "dailyLossLimit",
          "maxDrawdown", "minTradingDays",
          "maxTradingDays", "profitSplit",
          "isActive", "createdAt"
        ) VALUES (
          gen_random_uuid(), $1, $2,
          $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, NOW()
        )`,
        [
          plan.name,
          plan.type,
          plan.accountSize,
          plan.challengeFee,
          plan.profitTarget,
          plan.phase2Target || 0,
          plan.dailyLossLimit,
          plan.maxDrawdown,
          plan.minTradingDays,
          plan.maxTradingDays,
          plan.profitSplitPct,
          plan.isActive,
        ]
      )
      console.log('✅ Inserted:', 
        plan.type, plan.name,
        '₹' + (plan.challengeFee/100))
    }

    // Verify
    const result = await query(
      `SELECT name, "challengeType",
        "accountSize", "challengeFee"
       FROM "Plan" 
       ORDER BY "challengeType", "accountSize"`
    )
    
    console.log('\n=== PLANS IN DATABASE ===')
    result.rows.forEach(p => {
      console.log(
        p.challengeType.padEnd(12),
        p.name.padEnd(10),
        ('₹'+(p.accountSize/100)
          .toLocaleString('en-IN'))
          .padEnd(16),
        '₹'+(p.challengeFee/100)
      )
    })

    console.log('\n✅ Plans seeded successfully!')
    process.exit(0)
  } catch (err) {
    console.error('Seed failed:', err.message)
    process.exit(1)
  }
}

seedPlans();
