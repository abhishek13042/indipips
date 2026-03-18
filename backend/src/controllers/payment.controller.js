const Stripe = require('stripe');
const razorpayService = require('../services/razorpay.service');
const auditLogger = require('../utils/auditLogger');
const prisma = require('../utils/prisma');

// Lazy Stripe initialization — prevents crash when STRIPE_SECRET_KEY is a placeholder
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes('YOUR_')) {
    return null; // Will be handled gracefully in each endpoint
  }
  return new Stripe(key);
};

// ── Create Stripe Checkout Session ────────────────
const createCheckoutSession = async (req, res) => {
  try {
    let { planId, challengeType, accountSize, model, platform, swapFree, coupon } = req.body;

    // If planId is missing, attempt to find a matching plan based on parameters
    if (!planId && challengeType && accountSize) {
      const plan = await prisma.plan.findFirst({
        where: {
          challengeType: challengeType,
          accountSize: BigInt(accountSize),
          isActive: true
        }
      });
      if (plan) {
        planId = plan.id;
      }
    }

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID or valid challenge parameters are required.'
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

    // Calculate amount
    // Base fee from plan
    let amountInSmallestUnit = Number(plan.challengeFee);
    
    // Apply dynamic logic from frontend (CTO Rule: Trust but Verify)
    if (swapFree === true) {
      amountInSmallestUnit = Math.round(amountInSmallestUnit * 1.1); // +10%
    }
    
    // Platform extra
    if (platform === 'cTrader') {
      amountInSmallestUnit += 1600; // ₹1600 extra for cTrader
    }

    // CTO: Add 18% GST (Indian Tax Standard)
    const gstAmount = Math.round(amountInSmallestUnit * 0.18);
    const totalAmountWithGst = amountInSmallestUnit + gstAmount;

    // Create Stripe Checkout Session
    try {
      const stripe = getStripe();
      if (!stripe) {
        return res.status(503).json({
          success: false,
          message: 'Stripe payment gateway is not configured. Please add STRIPE_SECRET_KEY to .env file.'
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: req.user?.email || 'customer@example.com',
        metadata: {
          userId: req.userId,
          planId: planId,
          planName: plan.name,
          challengeType: challengeType || plan.challengeType,
          platform: platform || 'MT5',
          swapFree: swapFree ? 'true' : 'false'
        },
        line_items: [
          {
            price_data: {
              currency: 'inr', // CTO: Localized to INR
              product_data: {
                name: `${plan.name} Challenge`,
                description: `Verification: ${challengeType || plan.challengeType} | Size: ${Number(plan.accountSize) / 100000} Lakhs | Platform: ${platform || 'MT5'}`,
              },
              unit_amount: totalAmountWithGst * 100, // INR: Stripe expects Paise
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
          amount: BigInt(totalAmountWithGst * 100),
          gstAmount: BigInt(gstAmount * 100),
          currency: 'inr',
          stripeSessionId: session.id,
          planId: planId,
          status: 'PENDING',
        },
      });

      // Audit Log: Payment Initiation
      await auditLogger.logAction({
        userId: req.userId,
        action: 'PAYMENT_INITIATED',
        amount: amountInSmallestUnit * 100,
        metadata: { gateway: 'stripe', planId, currency: 'inr' }
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
      // Fallback for development if Stripe isn't fully configured
      if (stripeError.message.includes('Invalid API Key')) {
         return res.json({
            success: true,
            message: 'Dev Mode: Simulated checkout success',
            data: {
               url: `${process.env.APP_URL}/dashboard?payment=success&dev=1`
            }
         });
      }
      throw stripeError;
    }
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment session. Please try again.',
    });
  }
};

// ── Create Razorpay Order ────────────────────────
const createRazorpayOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId) return res.status(400).json({ success: false, message: 'Plan ID is required.' });

    const amountInPaise = Number(plan.challengeFee);
    const gstAmount = Math.round(amountInPaise * 0.18);
    const totalWithGst = amountInPaise + gstAmount;

    const order = await razorpayService.createOrder(totalWithGst / 100, `receipt_${Date.now()}`);

    // Create pending payment record
    await prisma.payment.create({
      data: {
        userId: req.userId,
        amount: BigInt(totalWithGst),
        gstAmount: BigInt(gstAmount),
        currency: 'inr',
        razorpayOrderId: order.id,
        planId: planId,
        status: 'PENDING',
      },
    });

    // Audit Log
    await auditLogger.logAction({
      userId: req.userId,
      action: 'PAYMENT_INITIATED',
      amount: amountInPaise,
      metadata: { gateway: 'razorpay', planId, orderId: order.id }
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency
      }
    });

  } catch (error) {
    console.error('Razorpay Session Error:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate Razorpay payment.' });
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

// ── Razorpay Webhook Handler ─────────────────────
const handleRazorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  // Verify signature
  const crypto = require('crypto');
  const expectedSignature = crypto.createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expectedSignature) {
    console.warn('⚠️ Razorpay webhook signature verification failed.');
    return res.status(400).send('Invalid signature');
  }

  const { event, payload } = req.body;

  if (event === 'order.paid') {
    const razorpayOrderId = payload.order.entity.id;
    const razorpayPaymentId = payload.payment.entity.id;

    try {
      // Find the payment record
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId },
        include: { user: true }
      });

      if (!payment || payment.status === 'SUCCESS') {
        return res.json({ status: 'ok' });
      }

      // Update payment
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId,
          status: 'SUCCESS'
        }
      });

      // Create challenge (if plan information is present)
      // Logic would be similar to Stripe success logic, but using payment.challengeId if pre-set
      // For now, focus on payment status. Full challenge activation logic would follow.
      console.log(`✅ Razorpay Payment Success: ${razorpayPaymentId} for Order ${razorpayOrderId}`);
    } catch (error) {
      console.error('Error handling Razorpay webhook:', error);
    }
  }

  res.json({ status: 'ok' });
};

module.exports = { createCheckoutSession, createRazorpayOrder, handleWebhook, handleRazorpayWebhook, verifyPayment, getMyPayments };
