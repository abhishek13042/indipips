require('dotenv').config()
const { query } = require('../src/utils/db')

async function createTestChallenge() {
  console.log('Creating test challenge...')

  // Get test user
  console.log('Querying User...')
  const userResult = await query(
    `SELECT id, email FROM "User"
     WHERE email = 'trader@indipips.com'
     LIMIT 1`
  )

  if (userResult.rows.length === 0) {
    console.error('Test user not found!')
    console.log('Create user first at /register')
    process.exit(1)
  }

  const user = userResult.rows[0]
  console.log('Found user:', user.email)

  // Get Pro ONE_STEP plan
  console.log('Querying Plan...')
  const planResult = await query(
    `SELECT * FROM "Plan"
     WHERE name = 'Pro'
     AND "challengeType" = 'ONE_STEP'
     LIMIT 1`
  )

  if (planResult.rows.length === 0) {
    console.error('Pro plan not found!')
    console.log('Run seedPlans.js first')
    process.exit(1)
  }

  const plan = planResult.rows[0]
  console.log('Found plan:', plan.name,
    'Account: ₹' + 
    (Number(plan.accountSize)/100).toLocaleString('en-IN'))

  // Check if active challenge exists
  console.log('Checking for existing challenge...')
  const existing = await query(
    `SELECT id FROM "Challenge"
     WHERE "userId" = $1
     AND status = 'ACTIVE'
     LIMIT 1`,
    [user.id]
  )

  if (existing.rows.length > 0) {
    console.log('Active challenge already exists:',
      existing.rows[0].id)
    console.log('Skipping creation.')
    process.exit(0)
  }

  // Account size in paise
  const accountSize = BigInt(plan.accountSize)

  // Create expiry date (45 days from now)
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 45)

  // Insert challenge
  console.log('Inserting into Challenge...')
  const result = await query(
    `INSERT INTO "Challenge" (
      id,
      "userId",
      "planId",
      status,
      "accountSize",
      "currentBalance",
      "peakBalance",
      "dailyStartingBalance",
      "totalPnl",
      "dailyPnl",
      "daysTraded",
      "consistencyViolations",
      "profitSplitPct",
      "isFunded",
      "startDate",
      "expiryDate",
      "createdAt",
      "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      $1, $2,
      'ACTIVE',
      $3, $3, $3, $3,
      0, 0, 0, 0,
      80,
      false,
      NOW(),
      $4,
      NOW(),
      NOW()
    ) RETURNING *`,
    [
      user.id,
      plan.id,
      accountSize,
      expiryDate,
    ]
  )

  const challenge = result.rows[0]

  console.log('\n✅ Challenge created!')
  console.log('ID:', challenge.id)
  console.log('Status:', challenge.status)
  console.log('Account Size: ₹' +
    (Number(challenge.accountSize)/100)
      .toLocaleString('en-IN'))
  console.log('Current Balance: ₹' +
    (Number(challenge.currentBalance)/100)
      .toLocaleString('en-IN'))
  console.log('Expires:', 
    challenge.expiryDate)

  // Verify in DB
  const verify = await query(
    `SELECT 
      c.id,
      c.status,
      c."accountSize",
      c."currentBalance",
      c."totalPnl",
      c."dailyPnl",
      c."daysTraded",
      c."expiryDate",
      p.name as "planName",
      p."challengeType" as "planType",
      p."profitTarget",
      p."dailyLossLimit",
      p."maxDrawdown"
     FROM "Challenge" c
     JOIN "Plan" p ON c."planId" = p.id
     WHERE c.id = $1`,
    [challenge.id]
  )

  console.log('\n=== CHALLENGE DETAILS ===')
  const ch = verify.rows[0]
  console.log('Plan:', ch.planName,
    '(' + ch.planType + ')')
  console.log('Account Size: ₹' +
    (Number(ch.accountSize)/100)
      .toLocaleString('en-IN'))
  console.log('Balance: ₹' +
    (Number(ch.currentBalance)/100)
      .toLocaleString('en-IN'))
  console.log('Profit Target:', 
    ch.profitTarget + '%')
  console.log('Daily Loss Limit:', 
    ch.dailyLossLimit + '%')
  console.log('Max Drawdown:', 
    ch.maxDrawdown + '%')
  console.log('Expires:', ch.expiryDate)

  process.exit(0)
}

createTestChallenge().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
