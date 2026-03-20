const prisma = require('../utils/prisma');
const razorpayService = require('./razorpay.service');
const auditLogger = require('../utils/auditLogger');

/**
 * Create a new payment record
 */
const createPayment = async (userId, data) => {
  return await prisma.payment.create({
    data: {
      userId,
      ...data,
      status: 'PENDING'
    }
  });
};

/**
 * Handle successful payment and provision challenge
 */
const processSuccessfulPayment = async (paymentId, gatewayDetails) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { plan: true }
  });

  if (!payment || payment.status === 'SUCCESS') return payment;

  // 1. Update Payment Status
  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'SUCCESS',
      ...gatewayDetails
    }
  });

  // 2. Fetch Plan if not included
  const plan = payment.plan || await prisma.plan.findUnique({ where: { id: payment.planId } });

  if (plan) {
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (plan.maxTradingDays || 30));

    // Generate unique accountNodeId
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
    const accountNodeId = `IP-${randomSuffix}`;

    // 3. Create Challenge
    const challenge = await prisma.challenge.create({
      data: {
        userId: payment.userId,
        planId: plan.id,
        accountNodeId,
        accountSize: plan.accountSize,
        currentBalance: plan.accountSize,
        peakBalance: plan.accountSize,
        totalPnl: 0n,
        dailyPnl: 0n,
        status: 'ACTIVE',
        startDate,
        expiryDate,
        brokerConnected: false
      }
    });

    // 4. Link Challenge to Payment
    await prisma.payment.update({
      where: { id: paymentId },
      data: { challengeId: challenge.id }
    });

    // 5. Audit Log
    await auditLogger.logAction({
      userId: payment.userId,
      action: 'CHALLENGE_ACTIVATED',
      amount: payment.amount,
      metadata: { challengeId: challenge.id, planId: plan.id }
    });

    return { payment: updatedPayment, challenge };
  }

  return { payment: updatedPayment };
};

module.exports = {
  createPayment,
  processSuccessfulPayment
};
