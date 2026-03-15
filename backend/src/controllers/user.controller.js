const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
  connectionString: 'postgresql://postgres:indipips123@localhost:5432/indipips_db'
});
const prisma = new PrismaClient({ adapter });

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
         referralCode: true,
         walletBalance: true,
         isActive: true,
         createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, data: {
      ...user,
      walletBalance: Number(user.walletBalance) / 100,
    }});
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;

    const updated = await prisma.user.update({
     where: { id: req.userId },
      data: {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
      },
    });

    res.json({ success: true, message: 'Profile updated!', data: updated });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
};

module.exports = { getProfile, updateProfile };