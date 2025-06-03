// middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET;

// Basic JWT verification
exports.verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // user info stored in token
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Role-based access middleware
exports.requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: "User not authenticated" });

    if (req.user.role !== role)
      return res
        .status(403)
        .json({ message: `Access denied: Requires ${role} role` });

    next();
  };
};
