const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); 
const OneTimeLink = require('../models/oneTimeLink'); 
const config = require('../config/config'); 

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours


const register = async (req, res) => {
  const { username, password } = req.body;

  try {
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newUser = new User({
      username,
      password: hashedPassword
    });

    await newUser.save();

    
    const token = crypto.randomBytes(32).toString('hex');
    const expiresIn = config.LINK_EXPIRATION_TIME;

    const oneTimeLink = new OneTimeLink({
      token,
      userId: newUser._id,
      createdAt: Date.now(),
      expires: expiresIn / 1000 // in seconds
    });

    await oneTimeLink.save();

    const link = `${req.protocol}://${req.get('host')}/api/verify-link/${token}`;

    const authToken = jwt.sign({ id: newUser._id }, 'your_jwt_secret', { expiresIn: '1h' });

    res.status(201).json({ authToken, link });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Authentication failed. User not found.' });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({ message: 'Account locked due to too many failed login attempts. Please try again later.' });
    }

    user.comparePassword(password, async (err, isMatch) => {
      if (err) return res.status(500).json({ message: 'Internal server error.' });

      if (!isMatch) {
        user.loginAttempts += 1;

        if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
          user.lockUntil = Date.now() + LOCK_TIME;
        }

        await user.save();

        return res.status(401).json({ message: 'Authentication failed. Incorrect password.' });
      }

      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();

      const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
      res.status(200).json({ token });
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  login,
  register
};
