const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'admin@indipips.com',
      password: 'Admin@1234'
    });
    console.log('Login Success:', res.data);
  } catch (error) {
    console.log('Login Error Status:', error.response?.status);
    console.log('Login Error Data:', error.response?.data);
  }
}

testLogin();
