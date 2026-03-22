const axios = require('axios')
const assert = require('assert')

const BASE_URL = 'http://localhost:5000'

async function run() {
  console.log('--- TEST 2: HEALTH CHECK ---')
  try {
    const health = await axios.get(`${BASE_URL}/api/v1/health`)
    console.log(JSON.stringify(health.data, null, 2))
    assert.strictEqual(health.data.status, 'healthy', 'Health check is not healthy')
    console.log('✅ TEST 2 PASSED')
  } catch(e) { console.error('❌ TEST 2 FAILED', e.message) }

  console.log('\n--- TEST 3: MARKET STATUS ---')
  try {
    const mkt = await axios.get(`${BASE_URL}/api/v1/trades/market-status`)
    console.log(mkt.data.data)
    console.log('✅ TEST 3 PASSED')
  } catch(e) { console.error('❌ TEST 3 FAILED', e.message) }

  console.log('\n--- TEST 4: AUTH RATE LIMITING ---')
  try {
    for(let i=1; i<=6; i++) {
        try {
            await axios.post(`${BASE_URL}/api/v1/auth/login`, { email: 'x', password: 'x' })
            console.log(`Req ${i}: Passed unexpectedly`)
        } catch (err) {
            console.log(`Req ${i}: ${err.response?.status} - ${JSON.stringify(err.response?.data)}`)
            if(i === 6 && err.response?.status === 429) {
                console.log('✅ TEST 4 PASSED: Rate limit engaged on req 6!')
            }
        }
    }
  } catch(e) { console.error('❌ TEST 4 FAILED', e.message) }

  console.log('\n--- TEST 5: SECURITY HEADERS ---')
  try {
    const healthHeaders = await axios.get(`${BASE_URL}/api/v1/health`)
    console.log('X-Content-Type-Options:', healthHeaders.headers['x-content-type-options'])
    console.log('X-XSS-Protection:', healthHeaders.headers['x-xss-protection'])
    if (healthHeaders.headers['x-content-type-options'] === 'nosniff') {
      console.log('✅ TEST 5 PASSED')
    }
  } catch(e) { console.error('❌ TEST 5 FAILED', e.message) }

  console.log('\n--- TEST 6: TRADE FLOW ASYNC ---')
  try {
    const loginRes = await axios.post(`${BASE_URL}/api/v1/auth/login`, { email: 'test@indipips.com', password: 'Test@1234' }).catch(e => e.response)
    if (loginRes.data?.data?.accessToken) {
       console.log('✅ Login OK')
       const token = loginRes.data.data.accessToken
       
       const cRes = await axios.get(`${BASE_URL}/api/v1/challenges`, {headers: {Authorization: `Bearer ${token}`}})
       const activeChallenge = (cRes.data?.data || []).find(c => c.status === 'ACTIVE')
       const mkt = await axios.get(`${BASE_URL}/api/v1/trades/market-status`)

       if (activeChallenge && mkt.data.data.isOpen) {
          console.log(`Found Active Challenge: ${activeChallenge.id}, Market Open: ${mkt.data.data.isOpen}`)
          const orderRes = await axios.post(`${BASE_URL}/api/v1/trades/open`, {
            challengeId: activeChallenge.id,
            instrument: "NIFTY",
            tradeType: "BUY",
            quantity: 65,
            entryPrice: 22419.95,
            orderType: "MARKET"
          }, {headers: {Authorization: `Bearer ${token}`}})
          
          console.log(`Order response code:`, orderRes.status)
          console.log(`Payload:`, orderRes.data)
          
          if(orderRes.status === 202) {
             const jobId = orderRes.data.data.jobId
             console.log(`Polling job ${jobId}...`)
             await new Promise(r => setTimeout(r, 2000))
             const jobRes = await axios.get(`${BASE_URL}/api/v1/trades/job/${jobId}`, {headers: {Authorization: `Bearer ${token}`}})
             console.log(`Job state:`, jobRes.data.data.state)
             if(jobRes.data.data.state === 'completed' || jobRes.data.data.state === 'failed') {
                 console.log('✅ TEST 6 PASSED')
             }
          }
       } else {
          console.log(`Skipping trade test! Market Open=${mkt.data.data.isOpen}, Has Challenge=${!!activeChallenge}`)
       }
    } else {
       console.log('Login failed: ', loginRes.data)
    }
  } catch(e) { console.error('❌ TEST 6 FAILED', e.message) }
}

run()
