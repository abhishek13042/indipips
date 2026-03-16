/**
 * Admin Middleware
 * Restricts access to users with ADMIN or SUPER_ADMIN roles.
 */

const isAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Administrative privileges required.'
    });
  }
  next();
};

const isSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Super Administrative privileges required.'
    });
  }
  next();
};

module.exports = {
  isAdmin,
  isSuperAdmin
};
