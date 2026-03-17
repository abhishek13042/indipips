const axios = require('axios');
require('dotenv').config();

/**
 * Indipips "Black Swan" Stress Test
 * Simulates high-intensity operational load to verify platform stability.
 */
const BASE_URL = 'http://localhost:5000/api/v1';

const runStressTest = async () => {
  console.log('🚀 Initiating Black Swan Stress Test...');
  console.log('-----------------------------------------');

  const stats = {
    totalRequests: 0,
    successes: 0,
    failures: 0,
    startTime: Date.now()
  };

  const simulateLoad = async (count) => {
    const promises = [];
    for (let i = 0; i < count; i++) {
      promises.push(
        axios.get(`${BASE_URL}/plans`)
          .then(() => { stats.successes++; stats.totalRequests++; })
          .catch((err) => { 
            stats.failures++; 
            stats.totalRequests++; 
            if(stats.failures <= 1) console.error('First failure:', err.message, err.response?.data); 
          })
      );
    }
    await Promise.all(promises);
  };

  try {
    console.log('📦 Phase 1: High-Concurrency Public Reads (50 reqs)...');
    await simulateLoad(50);
    
    console.log('🔐 Phase 2: Rapid Auth Probing (Limit Test)...');
    // This should trigger 429 after enough attempts
    let hitRateLimit = false;
    for(let j=0; j<60; j++) {
      try {
        await axios.post(`${BASE_URL}/auth/login`, { email: 'test@indipips.com', password: 'wrong' });
      } catch (e) {
        if (e.response?.status === 429) {
          hitRateLimit = true;
          break;
        }
      }
    }
    
    if (hitRateLimit) {
      console.log('✅ Rate Limiter: ENGAGED (Security Verified)');
    } else {
      console.warn('⚠️ Rate Limiter: NOT TRIGGERED (Check Configuration)');
    }

    const duration = (Date.now() - stats.startTime) / 1000;
    console.log('-----------------------------------------');
    console.log(`🏁 Stress Test Complete in ${duration}s`);
    console.log(`📊 Requests: ${stats.totalRequests} | Success: ${stats.successes} | Failed: ${stats.failures}`);
    
    if (stats.failures === 0) {
      console.log('🏆 STATUS: PLATFORM INVINCIBLE');
    } else {
      console.log('☢️ STATUS: SYSTEMS DEGRADED');
    }

  } catch (err) {
    console.error('💥 Test Suite Crash:', err.message);
  }
};

runStressTest();
