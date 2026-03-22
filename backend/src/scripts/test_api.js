const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';

const test = async () => {
  console.log('🧪 Starting E2E API Verification...');

  try {
    // 1. Test Plans Fetch
    console.log('📡 Fetching plans...');
    const plansRes = await axios.get(`${API_URL}/plans`);
    console.log(`✅ Fetched ${plansRes.data.data.length} plans successfully!`);

    // 2. Test Registration
    console.log('👤 Attempting registration...');
    const regData = {
      fullName: 'Production Test User',
      email: `test_${Date.now()}@example.com`,
      phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
      password: 'Password123!'
    };
    const regRes = await axios.post(`${API_URL}/auth/register`, regData);
    console.log('✅ Registration successful:', regRes.data.message);

    // 2.5 Verify Email (Bypass OTP by checking DB)
    console.log('📧 Verifying email...');
    const prisma = require('../utils/prisma');
    const verification = await prisma.emailVerification.findFirst({
        where: { userId: regRes.data.data.userId },
        orderBy: { createdAt: 'desc' }
    });
    
    await axios.post(`${API_URL}/auth/verify-email`, {
        userId: regRes.data.data.userId,
        otp: verification.token
    });
    console.log('✅ Email verified successfully!');

    // 3. Test Login
    console.log('🔑 Attempting login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: regData.email,
      password: regData.password
    });
    console.log('✅ Login successful! Token received.');

    console.log('✨ All E2E API checks PASSED!');
    process.exit(0);
  } catch (error) {
    console.error('❌ E2E Verification FAILED:');
    if (error.response) {
      console.error('Response Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
};

test();
