// backend/src/models/Player.js
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper']
  },
  country: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  stats: {
    matches: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    average: { type: Number, default: 0 }
  },
  room: {
    type: String,  // Changed from ObjectId to String to store roomId like "54ON2P"
    required: true
  },
  status: {
    type: String,
    enum: ['unsold', 'sold'],
    default: 'unsold'
  },
  soldPrice: {
    type: Number,
    default: null
  },
  soldTo: {
    type: String,
    default: null
  },
  soldToTeamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
playerSchema.index({ room: 1, status: 1 });

module.exports = mongoose.model('Player', playerSchema);