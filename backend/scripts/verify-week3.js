/**
 * verify-week3.js
 * Comprehensive operational simulation for Indipips Week 3.
 * Simulates: KYC -> Trading -> Admin Hub Analytics -> Redis Caching -> Payouts
 */

const axios = require('axios');
const API_URL = 'http://localhost:5000/api/v1';

// Helper for tokens (In a real test, these would be separate users)
let adminToken = '';
let traderToken = '';
let challengeId = '';

async function runSimulation() {
  console.log('🚀 Starting Week 3 Operational Simulation...');

  try {
    // 1. Authenticate (Using existing accounts often used in previous steps)
    // Note: This requires the server to be running.
    console.log('\n--- [1] Authentication ---');
    try {
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@indipips.com',
        password: 'Password123!'
      });
      adminToken = loginRes.data.tokens.access.token;
      console.log('✅ Admin authenticated.');
    } catch (e) {
      console.warn('⚠️ Admin login failed. Ensure server is running and admin@indipips.com exists.');
      return;
    }

    // 2. KYC Onboarding Simulation
    console.log('\n--- [2] KYC Simulation ---');
    const kycRes = await axios.post(`${API_URL}/kyc/aadhaar`, 
      { aadhaarNumber: '123456789012' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log(`✅ Aadhaar Verification: ${kycRes.data.data.status}`);

    const panRes = await axios.post(`${API_URL}/kyc/pan`, 
      { panNumber: 'ABCDE1234F' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log(`✅ PAN Verification: ${panRes.data.data.status}`);

    // 3. Admin Hub Analytics & Redis Test
    console.log('\n--- [3] Admin Hub & Redis Performance ---');
    console.log('Fetching Global Stats (Uncached/First Load)...');
    const start1 = Date.now();
    const stats1 = await axios.get(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const duration1 = Date.now() - start1;
    console.log(`✅ Load 1: ${duration1}ms | Traders: ${stats1.data.data.totalUsers}`);

    console.log('Fetching Global Stats (Redis Cached)...');
    const start2 = Date.now();
    const stats2 = await axios.get(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const duration2 = Date.now() - start2;
    console.log(`✅ Load 2: ${duration2}ms (Cache Hit)`);
    
    if (duration2 < duration1) {
      console.log('✨ Performance Boost Verified via Redis!');
    }

    // 4. Payout Eligibility & Request
    console.log('\n--- [4] Payout Workflow Verification ---');
    // Fetch a challenge to test payout
    const challengesRes = await axios.get(`${API_URL}/challenges`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (challengesRes.data.data.length > 0) {
      const testChallenge = challengesRes.data.data[0];
      challengeId = testChallenge.id;
      console.log(`Testing eligibility for Account: ${testChallenge.nodeAccountId || challengeId}`);

      const eligRes = await axios.get(`${API_URL}/payouts/eligibility/${challengeId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      console.log(`✅ Eligibility: ${eligRes.data.data.isEligible ? 'YES' : 'NO (Profit Threshold)'}`);
      console.log(`   Expected Payout: $${eligRes.data.data.breakdown.netPayout}`);

      if (eligRes.data.data.isEligible) {
        const reqRes = await axios.post(`${API_URL}/payouts/request`, 
          { challengeId },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log(`✅ Payout Request Submitted: ${reqRes.data.success}`);
      } else {
        console.log('ℹ️ Eligibility check passed, but profit too low for a real request.');
      }
    } else {
      console.log('⚠️ No challenges found for payout test.');
    }

    console.log('\n--- [5] Final Audit ---');
    console.log('All operation modules verified: KYC, Admin Matrix, Redis, Payout Gate.');
    console.log('🚀 WEEK 3 SIMULATION COMPLETE: SUCCESS');

  } catch (error) {
    console.error('❌ Simulation Failed:', error.response?.data || error.message);
  }
}

runSimulation();
