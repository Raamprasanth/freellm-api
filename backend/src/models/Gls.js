// backend/src/models/Gls.js
const mongoose = require('mongoose');

const glsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chosenRole: {
    type: String,
    enum: ['auctioneer', 'player', 'none'],
    default: 'none'
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Gls', glsSchema);
