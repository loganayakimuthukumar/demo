const jwt = require('jsonwebtoken');
const config = require('../config/config');

const getTime = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  jwt.verify(token, config.JWT_SECRET, (err) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    res.status(200).json({ currentTime: new Date().toISOString() });
  });
};

module.exports = {
  getTime
};
