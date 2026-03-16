const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = require('../utils/prisma');

// ── Create Stripe Checkout Session ────────────────
const createCheckoutSession = async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required.'
      });
    }

    // Find the plan
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found or inactive.'
      });
    }

    // Calculate amount (stored in paise, Stripe expects smallest currency unit)
    // For USD: amount in cents. For INR: amount in paise
    const amountInSmallestUnit = Number(plan.challengeFee);
    const displayAmount = amountInSmallestUnit / 100;

    // Create Stripe Checkout Session
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: req.userEmail,
        metadata: {
          userId: req.userId,
          planId: planId,
          planName: plan.name,
          challengeType: plan.challengeType,
        },
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${plan.name} Challenge - ${plan.challengeType.replace('_', ' ')}`,
                description: `Virtual Account: $${displayAmount} | Profit Target: ${plan.profitTarget}% | Max Drawdown: ${plan.maxDrawdown}%`,
              },
              unit_amount: amountInSmallestUnit,
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.APP_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL}/dashboard?payment=cancelled`,
      });

      // Create pending payment record
      await prisma.payment.create({
        data: {
          userId: req.userId,
          amount: BigInt(amountInSmallestUnit),
          currency: 'usd',
          stripeSessionId: session.id,
          status: 'PENDING',
        },
      });

      res.json({
        success: true,
        message: 'Checkout session created.',
        data: {
          sessionId: session.id,
          url: session.url,
        },
      });
    } catch (stripeError) {
      console.error('Stripe Session Creation Error:', stripeError.message);
      
      if (stripeError.message.includes('Invalid API Key') || process.env.STRIPE_SECRET_KEY.includes('YOUR_')) {
        return res.status(400).json({
          success: false,
          message: 'Payment gateway is currently in configuration. Please contact support or check your environment variables.'
        });
      }
      
      throw stripeError; // Re-throw to be caught by the outer catch block
    }
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment session. Please try again.',
    });
  }
};

// ── Stripe Webhook Handler ────────────────────────
const handleWebhook = async (req, res) => {
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

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Update payment record
      const payment = await prisma.payment.update({
        where: { stripeSessionId: session.id },
        data: {
          stripePaymentIntentId: session.payment_intent,
          status: 'SUCCESS',
        },
      });

      // Get plan details to create challenge
      const planId = session.metadata.planId;
      const userId = session.metadata.userId;
      const plan = await prisma.plan.findUnique({ where: { id: planId } });

      if (plan) {
        // Calculate dates
        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + plan.maxTradingDays);

        // Create the challenge
        const challenge = await prisma.challenge.create({
          data: {
            userId: userId,
            planId: planId,
            accountSize: plan.accountSize,
            currentBalance: plan.accountSize,
            peakBalance: plan.accountSize,
            totalPnl: BigInt(0),
            dailyPnl: BigInt(0),
            daysTraded: 0,
            phase: 1,
            status: 'ACTIVE',
            startDate: startDate,
            expiryDate: expiryDate,
            brokerConnected: false,
          },
        });

        // Update payment with challenge ID
        await prisma.payment.update({
          where: { id: payment.id },
          data: { challengeId: challenge.id },
        });

        console.log(`✅ Challenge created: ${challenge.id} for user ${userId}`);
      }
    } catch (error) {
      console.error('Error processing successful payment:', error);
    }
  }

  // Handle payment failure
  if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.payment_failed') {
    const session = event.data.object;
    try {
      await prisma.payment.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: 'FAILED' },
      });
    } catch (error) {
      console.error('Error updating failed payment:', error);
    }
  }

  res.json({ received: true });
};

// ── Verify Payment (called from frontend after redirect) ──
const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required.',
      });
    }

    // Check our payment record
    const payment = await prisma.payment.findUnique({
      where: { stripeSessionId: sessionId },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found.',
      });
    }

    if (payment.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized.',
      });
    }

    // Also verify with Stripe directly
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid' && payment.status !== 'SUCCESS') {
      // Webhook hasn't processed yet — do it now
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          stripePaymentIntentId: session.payment_intent,
          status: 'SUCCESS',
        },
      });

      // Create challenge if not already created
      if (!payment.challengeId) {
        const plan = await prisma.plan.findUnique({
          where: { id: session.metadata.planId },
        });

        if (plan) {
          const startDate = new Date();
          const expiryDate = new Date();
          expiryDate.setDate(startDate.getDate() + plan.maxTradingDays);

          // Generate unique accountNodeId (e.g., IP-10293847)
          const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
          const accountNodeId = `IP-${randomSuffix}`;

          const challenge = await prisma.challenge.create({
            data: {
              userId: req.userId,
              planId: plan.id,
              accountNodeId,
              accountSize: plan.accountSize,
              currentBalance: plan.accountSize,
              peakBalance: plan.accountSize,
              startDate,
              expiryDate,
            },
          });

          await prisma.payment.update({
            where: { id: payment.id },
            data: { challengeId: challenge.id },
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        status: session.payment_status === 'paid' ? 'SUCCESS' : payment.status,
        challengeId: payment.challengeId,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment.',
    });
  }
};

// ── Get Payment History ───────────────────────────
const getMyPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = payments.map(p => ({
      id: p.id,
      amount: Number(p.amount) / 100,
      currency: p.currency,
      status: p.status,
      challengeId: p.challengeId,
      createdAt: p.createdAt,
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
};

module.exports = { createCheckoutSession, handleWebhook, verifyPayment, getMyPayments };
