const mongoose = require('mongoose');

const OneTimeLinkSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 0 
  },
  used: {
    type: Boolean,
    default: false
  }
});

const OneTimeLink = mongoose.model('OneTimeLink', OneTimeLinkSchema);
module.exports = OneTimeLink;
