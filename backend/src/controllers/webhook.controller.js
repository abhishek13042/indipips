const Stripe = require('stripe');
const prisma = require('../utils/prisma');

// Lazy Stripe init — prevents crash when key is a placeholder
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes('YOUR_')) return null;
  return new Stripe(key);
};

const handleStripeWebhook = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ success: false, message: 'Stripe not configured.' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await activateChallenge(session);
        break;
      
      case 'checkout.session.expired':
      case 'payment_intent.payment_failed':
        const failedSession = event.data.object;
        await handlePaymentFailure(failedSession);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error(`Error processing webhook event ${event.type}:`, error);
  }

  res.json({ received: true });
};

async function activateChallenge(session) {
  const { userId, planId } = session.metadata;
  const stripeSessionId = session.id;

  // 1. Update Payment record
  const payment = await prisma.payment.update({
    where: { stripeSessionId },
    data: { 
      status: 'SUCCESS',
      stripePaymentIntentId: session.payment_intent 
    }
  });

  // 2. Fetch Plan details
  const plan = await prisma.plan.findUnique({
    where: { id: planId }
  });

  if (!plan) throw new Error(`Plan ${planId} not found`);

  // 3. Create the Challenge (Skip if already exists for this payment)
  const existingChallenge = await prisma.challenge.findFirst({
    where: { 
      userId,
      planId,
      createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } // Within last 5 mins
    }
  });

  if (!existingChallenge) {
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(startDate.getDate() + plan.maxTradingDays);

    // Generate unique accountNodeId (e.g., IP-10293847)
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

    // Update payment with challenge ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: { challengeId: challenge.id }
    });

    console.log(`✅ Success: Challenge activated for user ${userId} (Plan: ${plan.name})`);
  }
}

async function handlePaymentFailure(session) {
  await prisma.payment.updateMany({
    where: { stripeSessionId: session.id },
    data: { status: 'FAILED' }
  });
  console.log(`❌ Payment failed or expired for session ${session.id}`);
}

module.exports = { handleStripeWebhook };
