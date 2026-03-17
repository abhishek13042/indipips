const Razorpay = require('razorpay');
const crypto = require('crypto');

class RazorpayService {
  constructor() {
    this.instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret'
    });
  }

  /**
   * Create a new Order for payment
   */
  async createOrder(amount, receipt) {
    try {
      const options = {
        amount: Math.round(Number(amount) * 100), // Amount in paise for INR
        currency: "INR",
        receipt: receipt,
      };
      
      const order = await this.instance.orders.create(options);
      return order;
    } catch (error) {
      console.error('Razorpay Order Error:', error);
      throw new Error('Failed to create Razorpay order.');
    }
  }

  /**
   * Verify Webhook Signature
   */
  verifySignature(body, signature) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(body))
      .digest("hex");
      
    return expectedSignature === signature;
  }
}

module.exports = new RazorpayService();
