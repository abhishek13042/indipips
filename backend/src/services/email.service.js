const nodemailer = require('nodemailer');

/**
 * Email Service
 * Handles all transactional emails (Verification, Welcome, Password Reset, Breach Alert)
 */

// Configure transporter
// In production, use SendGrid/SES/Zoho SMTP
// In development, logs to console if no SMTP details provided
const createTransporter = () => {
  const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasSmtp) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: Mock transporter for local development
  return {
    sendMail: async (options) => {
      console.log('----------------------------------------------------');
      console.log('📧 MOCK EMAIL SENT (Add SMTP env vars to send real emails)');
      console.log(`To:      ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body:    ${options.text}`);
      console.log('----------------------------------------------------');
      return { messageId: 'mock-id-' + Date.now() };
    }
  };
};

const transporter = createTransporter();

/**
 * Send a generic email
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME || 'Indipips'}" <${process.env.EMAIL_FROM || 'noreply@indipips.com'}>`,
      to,
      subject,
      text,
      html,
    });
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    // Don't throw error to prevent breaking user flows (like registration), 
    // but log it for debugging.
    return null;
  }
};

/**
 * Send Email Verification OTP
 */
const sendVerificationEmail = async (email, otp) => {
  const subject = `Verify your Indipips Account - ${otp}`;
  const text = `Welcome to Indipips! Your verification code is: ${otp}. This code expires in 1 hour.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
      <h2 style="color: #1a1a1a;">Welcome to Indipips! 🚀</h2>
      <p style="color: #666;">Thank you for joining India's first INR-native prop firm. Please use the verification code below to activate your account:</p>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <h1 style="letter-spacing: 5px; color: #000; margin: 0;">${otp}</h1>
      </div>
      <p style="color: #666; font-size: 14px;">This code will expire in 1 hour. If you didn't create an account, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px; text-align: center;">&copy; 2026 Indipips. Made for Traders by Traders.</p>
    </div>
  `;
  return await sendEmail({ to: email, subject, text, html });
};

/**
 * Send Password Reset Email
 */
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  const subject = 'Reset your Indipips Password';
  const text = `You requested a password reset. Click here to reset: ${resetUrl}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
      <h2 style="color: #1a1a1a;">Reset Your Password</h2>
      <p style="color: #666;">You've requested to reset your password. Click the button below to secure your account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </div>
      <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
      <p style="color: #0044cc; font-size: 14px;">${resetUrl}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px; text-align: center;">&copy; 2026 Indipips. Made with respect for risk.</p>
    </div>
  `;
  return await sendEmail({ to: email, subject, text, html });
};

/**
 * Send Breach Notification
 */
const sendBreachEmail = async (email, accountId, reason) => {
  const subject = `Account Breach Alert - ${accountId}`;
  const text = `Your account ${accountId} has been terminated due to a breach: ${reason}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ffeded; border-radius: 10px;">
      <h2 style="color: #cc0000;">⚠️ Account Breach Detected</h2>
      <p style="color: #666;">We regret to inform you that your challenge account <strong>${accountId}</strong> has been terminated.</p>
      <p style="color: #666;"><strong>Reason:</strong> ${reason}</p>
      <p style="color: #666;">Prop trading involves strict risk management. Don't let this discourage you—analyze your trades and try again!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL || 'http://localhost:5173'}/dashboard/new-challenge" style="background-color: #cc0000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Get a New Challenge</a>
      </div>
    </div>
  `;
  return await sendEmail({ to: email, subject, text, html });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendBreachEmail,
};
