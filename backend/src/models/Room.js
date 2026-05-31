// backend/src/models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  auctioneer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  rules: {
    totalPurse: {
      type: Number,
      required: true,
      default: 100
    },
    maxSquadSize: {
      type: Number,
      required: true,
      default: 15
    },
    minBatsmen: { type: Number, default: 5 },
    minBowlers: { type: Number, default: 5 },
    minAllRounders: { type: Number, default: 2 },
    minWicketKeepers: { type: Number, default: 1 }
  },
  teams: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    teamName: String,
    purseRemaining: Number,
    players: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    }],
    playingXI: {
      players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
      }],
      captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
      },
      viceCaptain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
      },
      wicketKeeper: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
      }
    }
  }],
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  currentPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  auctionStatus: {
    type: String,
    enum: ['waiting', 'active', 'paused', 'completed'],
    default: 'waiting'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique room ID
roomSchema.statics.generateRoomId = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let roomId = '';
  for (let i = 0; i < 6; i++) {
    roomId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return roomId;
};

module.exports = mongoose.model('Room', roomSchema);