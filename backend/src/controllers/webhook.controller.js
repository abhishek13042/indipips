const Stripe = require('stripe');
const crypto = require('crypto');
const prisma = require('../utils/prisma');

// Lazy Stripe init
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes('YOUR_')) return null;
  return new Stripe(key);
};

// ── Stripe Webhook ────────────────────────────────
const handleStripeWebhook = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(503).json({ success: false, message: 'Stripe not configured.' });

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await activateChallenge({
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        userId: session.metadata.userId,
        planId: session.metadata.planId
      });
    } else if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.payment_failed') {
      const session = event.data.object;
      await prisma.payment.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: 'FAILED' }
      });
    }
  } catch (error) {
    console.error('Error processing Stripe event:', error);
  }

  res.json({ received: true });
};

// ── Razorpay Webhook ──────────────────────────────
const handleRazorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  // For Razorpay, we use the raw body (req.body is a Buffer here because of express.raw in server.js)
  const expectedSignature = crypto.createHmac('sha256', secret)
    .update(req.body) 
    .digest('hex');

  if (signature !== expectedSignature) {
    console.warn('⚠️ Razorpay signature verification failed.');
    return res.status(400).send('Invalid signature');
  }

  // Parse body after verification
  const data = JSON.parse(req.body.toString());
  const { event, payload } = data;

  if (event === 'order.paid') {
    const razorpayOrderId = payload.order.entity.id;
    const razorpayPaymentId = payload.payment.entity.id;

    try {
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId }
      });

      if (payment && payment.status !== 'SUCCESS') {
        await activateChallenge({
          razorpayOrderId,
          razorpayPaymentId,
          userId: payment.userId,
          planId: payment.planId
        });
      }
    } catch (error) {
      console.error('Error processing Razorpay event:', error);
    }
  }

  res.json({ status: 'ok' });
};

/**
 * Unified Challenge Activation Logic
 */
async function activateChallenge({ stripeSessionId, stripePaymentIntentId, razorpayOrderId, razorpayPaymentId, userId, planId }) {
  console.log(`🛠 Activating challenge for user ${userId}, plan ${planId}...`);

  // 1. Update Payment record
  const paymentUpdate = {};
  if (stripeSessionId) {
    paymentUpdate.status = 'SUCCESS';
    paymentUpdate.stripePaymentIntentId = stripePaymentIntentId;
  } else if (razorpayOrderId) {
    paymentUpdate.status = 'SUCCESS';
    paymentUpdate.razorpayPaymentId = razorpayPaymentId;
  }

  const payment = await prisma.payment.update({
    where: stripeSessionId ? { stripeSessionId } : { razorpayOrderId },
    data: paymentUpdate
  });

  // 2. Fetch Plan
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error(`Plan ${planId} not found`);

  // 3. Create the Challenge
  const startDate = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(startDate.getDate() + plan.maxTradingDays);

  const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
  const accountNodeId = `IP-${randomSuffix}`;

  const challenge = await prisma.challenge.create({
    data: {
      userId,
      planId,
      accountNodeId,
      accountSize: plan.accountSize,
      currentBalance: plan.accountSize,
      peakBalance: plan.accountSize,
      startDate,
      expiryDate,
      status: 'ACTIVE',
      phase: 1
    }
  });

  // 4. Update payment with challenge reference
  await prisma.payment.update({
    where: { id: payment.id },
    data: { challengeId: challenge.id }
  });

  console.log(`✅ Success: Challenge ${challenge.id} (Account: ${accountNodeId}) activated!`);
  return challenge;
}

module.exports = { handleStripeWebhook, handleRazorpayWebhook };
