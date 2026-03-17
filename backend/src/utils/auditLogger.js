const prisma = require('./prisma');

/**
 * Audit Logger Utility
 * Registers critical actions and balance changes for institutional oversight.
 */
const logAction = async ({ userId, action, amount, previousBalance, newBalance, ipAddress, metadata = {} }) => {
  try {
    return await prisma.auditLog.create({
      data: {
        userId,
        action,
        amount: amount ? BigInt(amount) : null,
        previousBalance: previousBalance ? BigInt(previousBalance) : null,
        newBalance: newBalance ? BigInt(newBalance) : null,
        ipAddress,
        metadata
      }
    });
  } catch (error) {
    console.error('❌ Audit Log Failure:', error);
    // In a production environment, we might want to throw here to halt the transaction 
    // if the audit log fails (Strict Integrity Mode).
  }
};

module.exports = { logAction };
