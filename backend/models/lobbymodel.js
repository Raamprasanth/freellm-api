/* ==========================================================================
   IPL Auction – Lobby Model (lobbymodel.js)
   Stores the entire state of one auction lobby session:
     • player pool (uploaded from Excel/CSV)
     • teams & their squads
     • bid history
     • auction settings & status
   ========================================================================== */

const mongoose = require('mongoose');

/* ── Sub-schema: single player ── */
const LobbyPlayerSchema = new mongoose.Schema({
    localId:   { type: Number,  required: true },   // index from the uploaded sheet
    name:      { type: String,  required: true, trim: true },
    country:   { type: String,  default: '—' },
    age:       { type: String,  default: '—' },
    role:      { type: String,  enum: ['BAT', 'BOWL', 'ALL-R', 'WK'], default: 'BAT' },
    basePrice: { type: Number,  default: 0 },       // in ₹ (rupees)
    matches:   { type: String,  default: '—' },
    innings:   { type: String,  default: '—' },
    runs:      { type: String,  default: '—' },
    balls:     { type: String,  default: '—' },
    highest:   { type: String,  default: '—' },
    notOut:    { type: String,  default: '—' },
    fours:     { type: String,  default: '—' },
    sixes:     { type: String,  default: '—' },
    ducks:     { type: String,  default: '—' },
    fifties:   { type: String,  default: '—' },
    hundreds:  { type: String,  default: '—' },
    wickets:   { type: String,  default: '—' },
    maidens:   { type: String,  default: '—' },
    bbi:       { type: String,  default: '—' },
    avg:       { type: String,  default: '—' },
    sr:        { type: String,  default: '—' },
    economy:   { type: String,  default: '—' },
    status:    { type: String,  enum: ['available', 'in-auction', 'sold', 'unsold'], default: 'available' },
    soldTo:    { type: String,  default: null },     // localId of the buying team (null if not sold)
    soldPrice: { type: Number,  default: 0 },
}, { _id: false });

/* ── Sub-schema: player entry inside a team's squad ── */
const SquadEntrySchema = new mongoose.Schema({
    localId:   { type: Number  },
    name:      { type: String  },
    role:      { type: String  },
    soldPrice: { type: Number, default: 0 },
}, { _id: false });

/* ── Sub-schema: team ── */
const LobbyTeamSchema = new mongoose.Schema({
    localId:  { type: String,  required: true },    // ID from IPL_TEAMS or Date.now()
    name:     { type: String,  required: true, trim: true, uppercase: true },
    budget:   { type: Number,  required: true },    // total budget in ₹
    spent:    { type: Number,  default: 0 },
    color:    { type: String,  default: '#FFD700' },
    isAI:     { type: Boolean, default: false },
    owner:    { type: String,  default: '' },
    players:  [SquadEntrySchema],
    playing11:[{ type: Number }],
    bench:    [{ type: Number }],
    expanded: { type: Boolean, default: false },
}, { _id: false });

/* ── Sub-schema: a single bid log entry ── */
const BidLogSchema = new mongoose.Schema({
    playerLocalId: { type: Number },
    playerName:    { type: String },
    teamLocalId:   { type: String },
    teamName:      { type: String },
    amount:        { type: Number },
    timestamp:     { type: Date, default: Date.now },
}, { _id: false });

/* ── Main Lobby Schema ── */
const LobbySchema = new mongoose.Schema({
    /* link to the room (optional, for multiplayer) */
    roomCode: {
        type: String,
        index: true,
        sparse: true,
        uppercase: true,
        trim: true,
    },

    /* who created the lobby */
    createdBy: {
        type: String,
        trim: true,
        default: 'Auctioneer',
    },

    /* auction state */
    status: {
        type: String,
        enum: ['SETUP', 'LIVE', 'PAUSED', 'FINISHED'],
        default: 'SETUP',
    },

    maxSquadSize: { type: Number, default: 25 },
    maxOverseas:  { type: Number, default: 8 },

    auctionSeq: { type: Number, default: 0 },   // how many players have been auctioned

    /* current player in the spotlight */
    currentPlayer: {
        localId:    { type: Number, default: null },
        curBid:     { type: Number, default: 0 },
        topBidder:  { type: String, default: null },  // team localId
    },

    /* data */
    players:  [LobbyPlayerSchema],
    teams:    [LobbyTeamSchema],
    bidLog:   [BidLogSchema],

    /* auto-expire lobbies after 7 days */
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        index: { expireAfterSeconds: 0 },
    },
}, { timestamps: true });

module.exports = mongoose.model('Lobby', LobbySchema);
