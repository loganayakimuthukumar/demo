const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const OneTimeLink = require('../models/oneTimeLink');
const config = require('../config/config');

// Create a one-time link
const createLink = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresIn = config.LINK_EXPIRATION_TIME;

    const oneTimeLink = new OneTimeLink({
      token,
      userId: user._id,
      createdAt: Date.now(),
      expires: expiresIn / 1000 // Expiry in seconds
    });

    await oneTimeLink.save();

    // Generate the link
    const link = `${req.protocol}://${req.get('host')}/api/verify-link/${token}`;

    res.status(200).json({ link });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const verifyLink = async (req, res) => {
  const { token } = req.params;

  try {
    const link = await OneTimeLink.findOne({ token });

    if (!link) {
      return res.status(404).json({ message: 'Link not found.' });
    }

    const currentTime = Date.now();
    const expiresAt = link.createdAt + (link.expires * 1000); 

    if (currentTime > expiresAt) {
      return res.status(400).json({ message: 'Link has expired.' });
    }

    if (link.used) {
      return res.status(400).json({ message: 'Link has already been used.' });
    }

    link.used = true;
    await link.save();

    const jwtToken = jwt.sign({ id: link.userId }, config.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token: jwtToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  createLink,
  verifyLink
};
