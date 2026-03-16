const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('../utils/prisma');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
    callbackURL: "/api/v1/auth/google/callback",
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const fullName = profile.displayName;
      const googleId = profile.id;

      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { googleId: googleId },
            { email: email }
          ]
        }
      });

      if (!user) {
        // Create new user if not exists
        // Note: For Google users, we might not have a phone number initially
        user = await prisma.user.create({
          data: {
            email,
            fullName,
            googleId,
            isActive: true,
            // Generate a random referral code
            referralCode: 'GOOGLE_' + Math.random().toString(36).substring(2, 7).toUpperCase()
          }
        });
      } else if (!user.googleId) {
        // If user exists by email but doesn't have googleId, link it
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleId }
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// We are not using sessions, we use JWT, so we don't need serialize/deserialize
// but passport might bark if we don't provide them when initializing sessions.
// Since we use { session: false } in routes, this is mostly placeholder.
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, id));

module.exports = passport;
