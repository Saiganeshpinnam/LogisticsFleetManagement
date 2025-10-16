module.exports = function(roles = []) {
  if (typeof roles === 'string') roles = [roles];
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (roles.length) {
      const allowed = roles.map(r => String(r).trim().toLowerCase());
      const current = String(req.user.role || '').trim().toLowerCase();
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[roleCheck] userRole=\"${current}\" allowed=${JSON.stringify(allowed)} path=${req.method} ${req.originalUrl}`);
      }
      if (!allowed.includes(current)) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[roleCheck] DENY userRole=\"${current}\" for ${req.method} ${req.originalUrl}`);
        }
        return res.status(403).json({ message: 'Forbidden' });
      }
    }
    next();
  };
};
