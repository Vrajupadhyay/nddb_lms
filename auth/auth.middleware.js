// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Access denied. No token provided.', data: null });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // user info added to request object
    next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Invalid token', data: null });
  }
};
