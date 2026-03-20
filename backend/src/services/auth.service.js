const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const emailService = require('./email.service');

/**
 * Generate unique referral code
 */
const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'INDI';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Generate JWT tokens
 */
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'indipips_secret_key_2026',
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { userId, role },
    process.env.JWT_REFRESH_SECRET || 'indipips_refresh_secret_key_2026',
    { expiresIn: '30d' }
  );
  return { accessToken, refreshToken };
};

/**
 * Register a new user
 */
const registerUser = async (userData) => {
  const { fullName, email, phone, password, referralCode: reqReferralCode } = userData;

  // Check if email already exists
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) throw new Error('Email already registered.');

  // Check if phone already exists
  const existingPhone = await prisma.user.findUnique({ where: { phone } });
  if (existingPhone) throw new Error('Phone number already registered.');

  const passwordHash = await bcrypt.hash(password, 12);

  // Generate unique referral code
  let referralCode = generateReferralCode();
  let codeExists = await prisma.user.findUnique({ where: { referralCode } });
  while (codeExists) {
    referralCode = generateReferralCode();
    codeExists = await prisma.user.findUnique({ where: { referralCode } });
  }

  // Check if referred by someone
  let referredBy = null;
  if (reqReferralCode) {
    const referrer = await prisma.user.findUnique({ where: { referralCode: reqReferralCode } });
    if (referrer) referredBy = referrer.id;
  }

  const user = await prisma.user.create({
    data: { fullName, email, phone, passwordHash, referralCode, referredBy }
  });

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.emailVerification.create({
    data: { userId: user.id, token: otp, expiresAt }
  });

  emailService.sendVerificationEmail(email, otp);

  return user;
};

/**
 * Login user
 */
const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid email or password.');

  if (!user.isActive) throw new Error('Account suspended.');
  if (!user.emailVerified) throw new Error('Email not verified.');

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) throw new Error('Invalid email or password.');

  return { user, tokens: generateTokens(user.id, user.role) };
};

module.exports = {
  registerUser,
  loginUser,
  generateTokens,
  generateReferralCode
};
