/* ==========================================================================
   IPL Cricket Auction Game - Database Models (indexmodel.js)
   ========================================================================== */

const mongoose = require('mongoose');

// --- PLAYER SCHEMA ---
const PlayerSchema = new mongoose.Schema({
  id: { 
    type: Number, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  role: { 
    type: String, 
    required: true, 
    enum: ['BAT', 'BOWL', 'AR', 'WK'] 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100 
  },
  nationality: { 
    type: String, 
    required: true, 
    enum: ['Indian', 'Overseas'] 
  },
  basePrice: { 
    type: Number, 
    required: true // Price in Lakhs (e.g., 200 = 2 Crore)
  },
  desc: { 
    type: String,
    trim: true
  },
  stats: {
    match: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    avg: { type: String, default: "0.0" },
    sr: { type: String, default: "0.0" },
    wkts: { type: Number, default: 0 },
    econ: { type: String, default: "0.00" }
  },
  sold: { 
    type: Boolean, 
    default: false 
  },
  finalPrice: { 
    type: Number, 
    default: 0 // Price in Lakhs
  },
  boughtBy: { 
    type: String, 
    default: null // ShortName of the buying Franchise (e.g., "CSK")
  }
}, { timestamps: true });

// --- FRANCHISE SCHEMA ---
const FranchiseSchema = new mongoose.Schema({
  shortName: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true,
    trim: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  purse: { 
    type: Number, 
    default: 10000 // In Lakhs (10000 = ₹100 Crore)
  },
  squad: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Player' 
  }],
  RTM: { 
    type: Number, 
    default: 1 // Right To Match card count
  },
  isAI: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

// --- BID HISTORY SCHEMA ---
const BidHistorySchema = new mongoose.Schema({
  playerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Player', 
    required: true 
  },
  playerName: {
    type: String,
    required: true
  },
  biddingTeam: { 
    type: String, 
    required: true, // e.g. "RCB"
    uppercase: true,
    trim: true
  },
  amount: { 
    type: Number, 
    required: true // Bid in Lakhs
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

// Compile Models
const Player = mongoose.model('Player', PlayerSchema);
const Franchise = mongoose.model('Franchise', FranchiseSchema);
const BidHistory = mongoose.model('BidHistory', BidHistorySchema);

module.exports = {
  Player,
  Franchise,
  BidHistory
};
