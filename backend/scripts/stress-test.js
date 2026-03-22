const axios = require('axios')

const BASE_URL = 'http://localhost:5000'
const CONCURRENT_TRADERS = 100
const TRADES_PER_TRADER = 5

// Test credentials
const TEST_EMAIL = 'test@indipips.com'
const TEST_PASSWORD = 'Test@1234'

async function login() {
  try {
    const res = await axios.post(
      BASE_URL + '/api/v1/auth/login',
      { email: TEST_EMAIL, 
        password: TEST_PASSWORD }
    )
    return res.data.data.accessToken
  } catch (err) {
    console.error('Login failed:', 
      err.response?.data?.message)
    return null
  }
}

async function getActiveChallenge(token) {
  try {
    const res = await axios.get(
      BASE_URL + '/api/v1/challenges',
      { headers: { 
        Authorization: 'Bearer ' + token 
      }}
    )
    const challenges = res.data.data || []
    return challenges.find(
      c => c.status === 'ACTIVE'
    )
  } catch {
    return null
  }
}

async function simulateTrader(
  traderId, token, challengeId
) {
  const results = {
    traderId,
    orders: 0,
    successful: 0,
    failed: 0,
    errors: [],
    avgTime: 0,
  }

  const times = []

  for (let i = 0; i < TRADES_PER_TRADER; i++) {
    const start = Date.now()
    try {
      await axios.post(
        BASE_URL + '/api/v1/trades/open',
        {
          challengeId,
          instrument: 'NIFTY',
          tradeType: i % 2 === 0 
            ? 'BUY' : 'SELL',
          quantity: 65,
          entryPrice: 22000 + 
            Math.random() * 1000,
          orderType: 'MARKET',
        },
        { headers: { 
          Authorization: 'Bearer ' + token 
        }}
      )
      results.orders++
      results.successful++
      times.push(Date.now() - start)
    } catch (err) {
      results.orders++
      results.failed++
      results.errors.push(
        err.response?.data?.message || 
        err.message
      )
    }

    // Small delay between orders
    await new Promise(r => 
      setTimeout(r, 100)
    )
  }

  results.avgTime = times.length > 0
    ? Math.round(
        times.reduce((a,b) => a+b, 0) / 
        times.length
      )
    : 0

  return results
}

async function runStressTest() {
  console.log('🚀 Starting stress test...')
  console.log('Concurrent traders:', 
    CONCURRENT_TRADERS)
  console.log('Trades per trader:', 
    TRADES_PER_TRADER)
  console.log('Total orders:', 
    CONCURRENT_TRADERS * TRADES_PER_TRADER)
  console.log('')

  // Login once
  const token = await login()
  if (!token) {
    console.error('❌ Cannot login — aborting')
    return
  }
  console.log('✅ Logged in')

  // Get challenge
  const challenge = await getActiveChallenge(
    token
  )
  if (!challenge) {
    console.log('⚠️ No active challenge found')
    console.log('Testing health check only...')
  } else {
    console.log('✅ Active challenge:', 
      challenge.id)
  }

  const testStart = Date.now()

  // Test 1: Health check under load
  console.log('\n📊 Test 1: Health Check')
  const healthRes = await axios.get(
    BASE_URL + '/api/v1/health'
  )
  console.log('Health status:', 
    healthRes.data.status)
  console.log('DB pool:', 
    healthRes.data.services?.database?.pool)
  console.log('Queue:', 
    healthRes.data.services?.queue?.stats)

  // Test 2: Market status
  console.log('\n📊 Test 2: Market Status')
  const mktRes = await axios.get(
    BASE_URL + '/api/v1/trades/market-status'
  )
  console.log('Market:', 
    mktRes.data.data)

  // Test 3: Concurrent trades if challenge
  if (challenge) {
    console.log('\n📊 Test 3: Concurrent Orders')
    console.log('Simulating', CONCURRENT_TRADERS,
      'traders simultaneously...')

    // Run all traders concurrently
    const traderPromises = Array.from(
      { length: CONCURRENT_TRADERS },
      (_, i) => simulateTrader(
        i + 1, token, challenge.id
      )
    )

    const allResults = await Promise.allSettled(
      traderPromises
    )

    // Aggregate results
    let totalOrders = 0
    let totalSuccess = 0
    let totalFailed = 0
    let totalAvgTime = 0

    allResults.forEach(result => {
      if (result.status === 'fulfilled') {
        totalOrders += result.value.orders
        totalSuccess += result.value.successful
        totalFailed += result.value.failed
        totalAvgTime += result.value.avgTime
      }
    })

    const testDuration = Date.now() - testStart
    const avgTime = Math.round(
      totalAvgTime / CONCURRENT_TRADERS
    )

    console.log('\n📈 STRESS TEST RESULTS:')
    console.log('─'.repeat(40))
    console.log('Total orders:', totalOrders)
    console.log('Successful:', totalSuccess)
    console.log('Failed:', totalFailed)
    console.log('Success rate:', 
      ((totalSuccess/totalOrders)*100)
        .toFixed(1) + '%')
    console.log('Avg response time:', 
      avgTime + 'ms')
    console.log('Total test time:', 
      testDuration + 'ms')
    console.log('Orders/second:', 
      Math.round(
        totalOrders / (testDuration / 1000)
      ))

    if (totalSuccess / totalOrders > 0.95) {
      console.log('\n✅ STRESS TEST PASSED')
      console.log('System handles', 
        CONCURRENT_TRADERS, 
        'concurrent traders')
    } else {
      console.log('\n❌ STRESS TEST FAILED')
      console.log('Success rate below 95%')
    }
  }

  // Final health check
  console.log('\n📊 Final Health Check:')
  const finalHealth = await axios.get(
    BASE_URL + '/api/v1/health'
  )
  console.log('Status:', finalHealth.data.status)
  console.log('Memory:', 
    finalHealth.data.memory)
  console.log('Requests:', 
    finalHealth.data.platform?.requests)
}

runStressTest().catch(console.error)
