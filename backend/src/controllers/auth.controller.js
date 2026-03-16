const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
// ── Generate unique referral code ──────────────────
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'INDI';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ── Generate JWT tokens ────────────────────────────
function generateTokens(userId, role) {
  const accessToken = jwt.sign(
    { userId, role },
    'indipips_super_secret_jwt_key_2026',
    { expiresIn: '7d' }
  );
  const refreshToken = jwt.sign(
    { userId, role },
    'indipips_refresh_secret_key_2026',
    { expiresIn: '30d' }
  );
  return { accessToken, refreshToken };
}
// ── REGISTER ───────────────────────────────────────
const register = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: fullName, email, phone, password'
      });
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login instead.'
      });
    }

    // Check if phone already exists
    const existingPhone = await prisma.user.findUnique({
      where: { phone }
    });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered.'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    // Hash the password
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
    if (req.body.referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: req.body.referralCode }
      });
      if (referrer) referredBy = referrer.id;
    }

    // Create the user
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,
        referralCode,
        referredBy
      }
    });

    // Generate tokens
    const tokens = generateTokens(user.id, user.role);

    res.status(201).json({
      success: true,
      message: 'Welcome to Indipips! Account created successfully.',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          referralCode: user.referralCode,
          kycStatus: user.kycStatus,
          walletBalance: user.walletBalance.toString()
        },
        tokens
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

// ── LOGIN ──────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate tokens
    const tokens = generateTokens(user.id, user.role);

    res.json({
      success: true,
      message: `Welcome back, ${user.fullName}! 🚀`,
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          referralCode: user.referralCode,
          kycStatus: user.kycStatus,
          walletBalance: user.walletBalance.toString()
        },
        tokens
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

// ── GET PROFILE ────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        kycStatus: true,
        aadhaarVerified: true,
        panNumber: true,
        bankAccount: true,
        bankIfsc: true,
        referralCode: true,
        walletBalance: true,
        isActive: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      data: {
        ...user,
        walletBalance: user.walletBalance.toString()
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong.'
    });
  }
};

module.exports = { register, login, getProfile };