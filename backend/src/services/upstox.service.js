const axios = require('axios');
const prisma = require('../utils/prisma');

class UpstoxService {
  constructor() {
    this.baseUrl = 'https://api.upstox.com/v2';
    this.apiKey = process.env.UPSTOX_API_KEY;
    this.apiSecret = process.env.UPSTOX_API_SECRET;
    this.redirectUri = process.env.UPSTOX_REDIRECT_URI;
  }

  /**
   * Generates the Upstox login URL for OAuth
   */
  getLoginUrl() {
    return `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${this.apiKey}&redirect_uri=${encodeURIComponent(this.redirectUri)}`;
  }

  /**
   * Exchanges authorization code for an access token
   * @param {string} code - Code returned by Upstox after user authorization
   */
  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post(`${this.baseUrl}/login/authorization/token`, new URLSearchParams({
        code,
        client_id: this.apiKey,
        client_secret: this.apiSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code'
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Upstox Token Exchange Error:', error.response?.data || error.message);
      throw new Error('Failed to exchange Upstox authorization code.');
    }
  }

  /**
   * Stores the Upstox session for a specific challenge/user
   */
  async saveSession(userId, tokenData) {
    // We'll store the token in the User record or a dedicated BrokerSession table
    // For now, let's update the User record to hold the primary broker token
    return await prisma.user.update({
      where: { id: userId },
      data: {
        brokerAccessToken: tokenData.access_token,
        brokerRefreshToken: tokenData.refresh_token || null,
        brokerTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // Upstox tokens usually valid for 24h
      }
    });
  }

  /**
   * Get User Profile from Upstox (Connectivity Check)
   */
  async getProfile(accessToken) {
    try {
      const response = await axios.get(`${this.baseUrl}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Upstox Profile Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch Upstox profile.');
    }
  }

  /**
   * Place a live order on Upstox
   */
  async placeOrder(accessToken, { symbol, quantity, side, orderType = 'MARKET' }) {
    try {
      const response = await axios.post(`${this.baseUrl}/order/place`, {
        quantity,
        product: 'I', // 'I' for Intraday, 'D' for Delivery
        validity: 'DAY',
        price: 0,
        tag: 'indipips_v1',
        instrument_token: symbol,
        order_type: orderType,
        transaction_type: side,
        disclosed_quantity: 0,
        trigger_price: 0,
        is_amo: false
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        brokerOrderId: response.data.data.order_id
      };
    } catch (error) {
      console.error('Upstox Order Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errors?.[0]?.message || 'Failed to place live order on Upstox.');
    }
  }

  /**
   * Close a live order (Market Exit)
   */
  async closeOrder(accessToken, brokerOrderId) {
    try {
      const response = await axios.post(`${this.baseUrl}/order/exit`, {
        order_id: brokerOrderId
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      return { success: true };
    } catch (error) {
       console.error('Upstox Order Exit Error:', error.response?.data || error.message);
       throw new Error('Failed to exit live order.');
    }
  }
}

module.exports = new UpstoxService();
