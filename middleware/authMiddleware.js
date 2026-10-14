const jwt = require('jsonwebtoken');
const fileStore = require('../storage/fileStore');

const JWT_SECRET = process.env.JWT_SECRET || 'equirent_development_jwt_secret_key_change_in_production';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }

    const user = fileStore.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account no longer exists.' });
    }

    // Strip password
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  });
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      const user = fileStore.findUserById(decoded.id);
      if (user) {
        const { password, ...safeUser } = user;
        req.user = safeUser;
      }
    }
    next();
  });
};

module.exports = { authenticateToken, optionalAuth, JWT_SECRET };
