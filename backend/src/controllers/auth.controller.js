const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
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
    process.env.JWT_SECRET || 'indipips_super_secret_jwt_key_2026',
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { userId, role },
    process.env.JWT_REFRESH_SECRET || 'indipips_refresh_secret_key_2026',
    { expiresIn: '30d' }
  );
  return { accessToken, refreshToken };
}

// ── Cookie Options ─────────────────────────────────
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
};
// ── REGISTER ───────────────────────────────────────
const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  referralCode: z.string().optional()
});

const register = async (req, res) => {
  try {
    const parsedData = registerSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({
        success: false,
        message: parsedData.error.errors[0].message
      });
    }

    const { fullName, email, phone, password, referralCode: reqReferralCode } = parsedData.data;

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
    if (reqReferralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: reqReferralCode }
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
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, cookieOptions);

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
        accessToken
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
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

const login = async (req, res) => {
  try {
    const parsedData = loginSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({
        success: false,
        message: parsedData.error.errors[0].message
      });
    }

    const { email, password } = parsedData.data;

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
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, cookieOptions);

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
        accessToken
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

// ── REFRESH TOKEN ──────────────────────────────────
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'indipips_refresh_secret_key_2026');

    // Check user exists
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Session expired.' });
    }

    // Generate new tokens
    const tokens = generateTokens(user.id, user.role);

    // Set new refresh token in cookie
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

    res.json({
      success: true,
      data: { accessToken: tokens.accessToken }
    });

  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid refresh token.' });
  }
};

// ── LOGOUT ─────────────────────────────────────────
const logout = (req, res) => {
  res.clearCookie('refreshToken', { ...cookieOptions, maxAge: 0 });
  res.json({ success: true, message: 'Logged out successfully.' });
};

// ── GOOGLE CALLBACK ───────────────────────────────
const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(`${process.env.APP_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, cookieOptions);

    // Redirect to frontend success page
    res.redirect(`${process.env.APP_URL || 'http://localhost:5173'}/auth/success?token=${accessToken}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.APP_URL || 'http://localhost:5173'}/login?error=server_error`);
  }
};

module.exports = { register, login, getProfile, refreshToken, logout, googleCallback };