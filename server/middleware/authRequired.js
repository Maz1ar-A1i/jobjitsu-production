// server/middleware/authRequired.js
const jwt = require('jsonwebtoken');

module.exports = function authRequired(req, res, next) {
  const bearer = req.headers.authorization?.split(' ')[1];
  const token = bearer || (req.cookies && req.cookies.token);
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
