const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { z } = require('zod');
const prisma = require('../utils/prisma');
const emailService = require('../services/email.service');

const authService = require('../services/auth.service');

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

    const user = await authService.registerUser(parsedData.data);

    res.status(201).json({
      success: true,
      message: 'Account created! Please check your email for the verification code.',
      data: {
        userId: user.id,
        email: user.email,
        mustVerify: true
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    const isConflict = error.message.includes('registered') || error.message.includes('already exists');
    res.status(isConflict ? 409 : 500).json({
      success: false,
      message: error.message || 'Something went wrong. Please try again.'
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
    const { user, tokens } = await authService.loginUser(email, password);

    // Set refresh token in cookie
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

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
        accessToken: tokens.accessToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    const status = error.message.includes('verified') ? 403 : (error.message.includes('Invalid') ? 401 : 500);
    res.status(status).json({
      success: false,
      message: error.message,
      mustVerify: error.message.includes('verified')
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
    if (!user || !user.isActive || !user.emailVerified) {
      return res.status(401).json({ success: false, message: 'Session invalid or unverified.' });
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

// ── FORGOT PASSWORD ────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetTokenHash,
        passwordResetExpiry: tokenExpiry
      }
    });

    console.log(`⚠️ Password reset token for ${email}: ${resetToken}`);

    // Send real email
    await emailService.sendPasswordResetEmail(email, resetToken);

    res.json({
      success: true,
      message: 'Password reset link sent to your email.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
};

// ── VERIFY EMAIL ──────────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ success: false, message: 'User ID and OTP are required.' });
    }

    const verification = await prisma.emailVerification.findFirst({
      where: {
        userId,
        token: otp,
        verified: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!verification) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
    }

    // Update user and verification status
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true }
      }),
      prisma.emailVerification.update({
        where: { id: verification.id },
        data: { verified: true }
      })
    ]);

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });

  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
};

// ── RESEND OTP ─────────────────────────────────────
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'User ID is required.' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.emailVerified) return res.status(400).json({ success: false, message: 'Account already verified.' });

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: otp,
        expiresAt
      }
    });

    await emailService.sendVerificationEmail(user.email, otp);

    res.json({ success: true, message: 'New verification code sent to your email.' });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
};

// ── RESET PASSWORD ─────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: tokenHash,
        passwordResetExpiry: { gt: new Date() }
      }
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null
      }
    });

    res.json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
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

module.exports = {
  register,
  login,
  getProfile,
  refreshToken,
  logout,
  googleCallback,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendOTP
};