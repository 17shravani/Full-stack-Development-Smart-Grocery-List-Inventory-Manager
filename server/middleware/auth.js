const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'aethergro_secret_key_ultra_secure_13579';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No authentication token provided.' });
  }

  const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Invalid token format.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains id, email, name
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Access denied. Token is invalid or expired.' });
  }
};

module.exports = {
  verifyToken,
  JWT_SECRET
};
