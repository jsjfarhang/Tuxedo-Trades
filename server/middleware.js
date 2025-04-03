const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { User } = require('../database');

const verifyToken = promisify(jwt.verify);

// verify user
const authenticateToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return next();
  const x = await verifyToken(token, process.env.JWT_SECRET);
  const user = await User.findById(x.id);
  if (!user) return next();
  req.user = user;
  req.token = token;
  next();
};

module.exports = { authenticateToken };