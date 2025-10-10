// Admin authentication middleware
module.exports = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Authentication required', code: 'AUTH_REQUIRED' });
  }
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required', code: 'ADMIN_REQUIRED' });
  }
  next();
};
