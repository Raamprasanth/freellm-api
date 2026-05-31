/* ==========================================================================
   IPL Auction – Lobby Routes (lobbyroutes.js)
   Provides full CRUD for auction lobby sessions stored in MongoDB.

   Endpoints
   ─────────────────────────────────────────────────────────────────────────
   POST   /api/lobby                      Create a new lobby
   GET    /api/lobby/:id                  Get lobby by Mongo _id
   GET    /api/lobby/room/:code           Get lobby by room code
   PUT    /api/lobby/:id/players          Bulk-replace player pool
   POST   /api/lobby/:id/teams            Add a team
   DELETE /api/lobby/:id/teams/:teamId    Remove a team
   PATCH  /api/lobby/:id/auction/start    Put a player in auction
   PATCH  /api/lobby/:id/auction/bid      Place a bid
   PATCH  /api/lobby/:id/auction/sold     Mark sold
   PATCH  /api/lobby/:id/auction/unsold   Mark unsold
   PATCH  /api/lobby/:id/status           Update lobby status
   GET    /api/lobby/:id/state            Lightweight state poll
   ========================================================================== */

const express = require('express');
const router  = express.Router();
const Lobby   = require('../models/lobbymodel');

/* ── helpers ── */
function notFound(res) { return res.status(404).json({ success: false, message: 'Lobby not found.' }); }
function err500(res, e) { return res.status(500).json({ success: false, message: e.message }); }

/* ─────────────────────────────────────────────
   POST /api/lobby  — Create a new lobby
   Body: { roomCode?, createdBy?, teams? }
───────────────────────────────────────────── */
router.post('/lobby', async (req, res) => {
    try {
        const { roomCode, createdBy, teams, maxSquadSize, maxOverseas } = req.body;
        const normalizedRoomCode = roomCode ? String(roomCode).trim().toUpperCase() : undefined;
        const lobbyData = { roomCode: normalizedRoomCode, createdBy };
        if (maxSquadSize) lobbyData.maxSquadSize = maxSquadSize;
        if (maxOverseas) lobbyData.maxOverseas = maxOverseas;
        if (teams && Array.isArray(teams)) {
            lobbyData.teams = teams;
        }

        if (normalizedRoomCode) {
            const existing = await Lobby.findOne({ roomCode: normalizedRoomCode }).sort({ createdAt: -1 });
            if (existing) {
                existing.createdBy = createdBy || existing.createdBy;

                if (teams && Array.isArray(teams)) {
                    teams.forEach(team => {
                        const nextLocalId = String(team.localId || team.id || '').toUpperCase();
                        const current = existing.teams.find(t => String(t.localId).toUpperCase() === nextLocalId);

                        if (current) {
                            current.name = team.name || current.name;
                            current.budget = team.budget ?? current.budget;
                            current.color = team.color || current.color;
                            current.owner = team.owner || current.owner;
                            current.isAI = Boolean(team.isAI);
                        } else if (nextLocalId) {
                            existing.teams.push({
                                localId: team.localId || team.id,
                                name: team.name,
                                budget: team.budget,
                                color: team.color,
                                owner: team.owner || '',
                                isAI: Boolean(team.isAI),
                                spent: 0,
                                players: []
                            });
                        }
                    });
                }

                await existing.save();

                if (req.app.get('io')) {
                    req.app.get('io').to(existing._id.toString()).emit('state_update', existing);
                }

                return res.status(200).json({ success: true, data: existing });
            }
        }

        const lobby = await Lobby.create(lobbyData);
        res.status(201).json({ success: true, data: lobby });
    } catch (e) { err500(res, e); }
});

/* ─────────────────────────────────────────────
   GET /api/lobby/:id  — Get lobby by _id
───────────────────────────────────────────── */
router.get('/lobby/:id', async (req, res) => {
    try {
        const lobby = await Lobby.findById(req.params.id);
        if (!lobby) return notFound(res);
        res.json({ success: true, data: lobby });
    } catch (e) { err500(res, e); }
});

/* ─────────────────────────────────────────────
   GET /api/lobby/room/:code  — Get lobby by room code
───────────────────────────────────────────── */
router.get('/lobby/room/:code', async (req, res) => {
    try {
        const lobby = await Lobby.findOne({ roomCode: req.params.code.toUpperCase() })
            .sort({ createdAt: -1 });
        if (!lobby) return notFound(res);
        res.json({ success: true, data: lobby });
    } catch (e) { err500(res, e); }
});

/* ─────────────────────────────────────────────
   PUT /api/lobby/:id/players  — Bulk-replace player pool
   Body: { players: [...] }
───────────────────────────────────────────── */
router.put('/lobby/:id/players', async (req, res) => {
    try {
        const { players } = req.body;
        if (!Array.isArray(players)) {
            return res.status(400).json({ success: false, message: '`players` must be an array.' });
        }
        const lobby = await Lobby.findByIdAndUpdate(
            req.params.id,
            { $set: { players } },
            { new: true }
        );
        if (!lobby) return notFound(res);
        res.json({ success: true, data: lobby });
    } catch (e) {
        console.error("PUT /lobby/:id/players ERROR:", e);
        err500(res, e);
    }
});

/* ─────────────────────────────────────────────
   POST /api/lobby/:id/teams  — Add a team
   Body: { localId, name, budget, color, owner }
───────────────────────────────────────────── */
router.post('/lobby/:id/teams', async (req, res) => {
    try {
        const { localId, name, budget, color, owner } = req.body;
        if (!name || budget == null) {
            return res.status(400).json({ success: false, message: 'name and budget are required.' });
        }
        const lobby = await Lobby.findById(req.params.id);
        if (!lobby) return notFound(res);

        const exists = lobby.teams.find(t => t.name === name.toUpperCase());
        if (exists) {
            return res.status(409).json({ success: false, message: 'Team already exists.' });
        }

        const isAI = (!owner || owner === 'AI');
        lobby.teams.push({ localId, name, budget, color, spent: 0, players: [], owner: owner || 'AI', isAI });
        await lobby.save();

        if (req.app.get('io')) {
            req.app.get('io').to(req.params.id).emit('state_update', lobby);
        }

        res.status(201).json({ success: true, data: lobby });
    } catch (e) { err500(res, e); }
});

/* ─────────────────────────────────────────────
   DELETE /api/lobby/:id/teams/:teamId  — Remove a team by localId
───────────────────────────────────────────── */
router.delete('/lobby/:id/teams/:teamId', async (req, res) => {
    try {
        const lobby = await Lobby.findById(req.params.id);
        if (!lobby) return notFound(res);

        const before = lobby.teams.length;
        lobby.teams = lobby.teams.filter(t => String(t.localId) !== req.params.teamId);
        if (lobby.teams.length === before) {
            return res.status(404).json({ success: false, message: 'Team not found.' });
        }
        await lobby.save();

        if (req.app.get('io')) {
            req.app.get('io').to(req.params.id).emit('state_update', lobby);
        }

        res.json({ success: true, data: lobby });
    } catch (e) { err500(res, e); }
});

/* ─────────────────────────────────────────────
   PATCH /api/lobby/:id/auction/start
   Body: { playerLocalId }  — Put a player in auction
───────────────────────────────────────────── */
router.patch('/lobby/:id/auction/start', async (req, res) => {
    try {
        const { playerLocalId } = req.body;
        const lobby = await Lobby.findById(req.params.id);
        if (!lobby) return notFound(res);

        const player = lobby.players.find(p => p.localId === playerLocalId);
        if (!player) {
            return res.status(404).json({ success: false, message: 'Player not found in lobby.' });
        }
        if (player.status !== 'available') {
            return res.status(400).json({ success: false, message: `Player is already ${player.status}.` });
        }

        player.status = 'in-auction';
        lobby.auctionSeq += 1;
        lobby.status = 'LIVE';

        // Scale player.basePrice to Rupees if stored in Lakhs
        let scaledBasePrice = player.basePrice;
        if (scaledBasePrice < 10000) {
            scaledBasePrice = scaledBasePrice * 100000;
        }

        lobby.currentPlayer = { localId: playerLocalId, curBid: scaledBasePrice, topBidder: null };
        await lobby.save();

        if (req.app.get('io')) {
            req.app.get('io').to(req.params.id).emit('state_update', lobby);
        }

        res.json({ success: true, data: lobby });
    } catch (e) { err500(res, e); }
});

/* ─────────────────────────────────────────────
   PATCH /api/lobby/:id/auction/bid
   Body: { teamLocalId, amount }
───────────────────────────────────────────── */
router.patch('/lobby/:id/auction/bid', async (req, res) => {
    try {
        const { teamLocalId, amount } = req.body;
        const lobby = await Lobby.findById(req.params.id);
        if (!lobby) return notFound(res);
        if (lobby.status !== 'LIVE') {
            return res.status(400).json({ success: false, message: 'No active auction.' });
        }

        const team = lobby.teams.find(t => t.localId === teamLocalId);
        if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

        // Normalize lobby.currentPlayer.curBid if stored in Lakhs
        if (lobby.currentPlayer.curBid && lobby.currentPlayer.curBid < 10000) {
            lobby.currentPlayer.curBid = lobby.currentPlayer.curBid * 100000;
        }

        const curBid = lobby.currentPlayer.curBid;
        const isFirstBid = !lobby.currentPlayer.topBidder;
        if (isFirstBid) {
            if (amount < curBid) {
                return res.status(400).json({ success: false, message: `First bid must be at least the base price of ${curBid}.` });
            }
        } else {
            if (amount <= curBid) {
                return res.status(400).json({ success: false, message: `Bid must be greater than ${curBid}.` });
            }
        }
        if (amount > team.budget - team.spent) {
            return res.status(400).json({ success: false, message: `${team.name} exceeds remaining budget.` });
        }

        lobby.currentPlayer.curBid    = amount;
        lobby.currentPlayer.topBidder = teamLocalId;

        /* log the bid */
        const player = lobby.players.find(p => p.localId === lobby.currentPlayer.localId);
        lobby.bidLog.push({
            playerLocalId: lobby.currentPlayer.localId,
            playerName:    player?.name || '—',
            teamLocalId,
            teamName:      team.name,
            amount,
        });

        await lobby.save();

        if (req.app.get('io')) {
            req.app.get('io').to(req.params.id).emit('state_update', lobby);
        }

        res.json({ success: true, data: lobby });
    } catch (e) { err500(res, e); }
});

/* ─────────────────────────────────────────────
   PATCH /api/lobby/:id/auction/sold
   Resolves the current player as SOLD to the top bidder.
───────────────────────────────────────────── */
router.patch('/lobby/:id/auction/sold', async (req, res) => {
    try {
        const lobby = await Lobby.findById(req.params.id);
        if (!lobby) return notFound(res);
        if (lobby.status !== 'LIVE') {
            return res.status(400).json({ success: false, message: 'No active auction.' });
        }
        if (!lobby.currentPlayer.topBidder) {
            return res.status(400).json({ success: false, message: 'No bids placed — cannot mark sold.' });
        }

        const { localId, curBid, topBidder: buyerLocalId } = lobby.currentPlayer;
        const player = lobby.players.find(p => p.localId === localId);
        const team   = lobby.teams.find(t => t.localId === buyerLocalId);

        if (!player || !team) {
            return res.status(404).json({ success: false, message: 'Player or team not found.' });
        }

        /* update player */
        player.status    = 'sold';
        player.soldTo    = buyerLocalId;
        player.soldPrice = curBid;

        /* update team */
        team.spent += curBid;
        team.players.push({ localId: player.localId, name: player.name, role: player.role, soldPrice: curBid });

        /* reset current player slot */
        lobby.currentPlayer = { localId: null, curBid: 0, topBidder: null };
        lobby.status        = 'PAUSED';

        await lobby.save();

        if (req.app.get('io')) {
            req.app.get('io').to(req.params.id).emit('state_update', lobby);
        }

        res.json({ success: true, soldTo: team.name, price: curBid, data: lobby });
    } catch (e) { err500(res, e); }
});

/* ─────────────────────────────────────────────
   PATCH /api/lobby/:id/auction/unsold
───────────────────────────────────────────── */
router.patch('/lobby/:id/auction/unsold', async (req, res) => {
    try {
        const lobby = await Lobby.findById(req.params.id);
        if (!lobby) return notFound(res);
        if (lobby.status !== 'LIVE') {
            return res.status(400).json({ success: false, message: 'No active auction.' });
        }

        const player = lobby.players.find(p => p.localId === lobby.currentPlayer.localId);
        if (player) player.status = 'unsold';

        lobby.currentPlayer = { localId: null, curBid: 0, topBidder: null };
        lobby.status        = 'PAUSED';
        await lobby.save();

        if (req.app.get('io')) {
            req.app.get('io').to(req.params.id).emit('state_update', lobby);
        }

        res.json({ success: true, data: lobby });
    } catch (e) { err500(res, e); }
});

/* ─────────────────────────────────────────────
   PATCH /api/lobby/:id/status
   Body: { status: 'SETUP' | 'LIVE' | 'PAUSED' | 'FINISHED' }
───────────────────────────────────────────── */
router.patch('/lobby/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ['SETUP', 'LIVE', 'PAUSED', 'FINISHED'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ success: false, message: `status must be one of: ${allowed.join(', ')}` });
        }
        const lobby = await Lobby.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!lobby) return notFound(res);

        if (req.app.get('io')) {
            req.app.get('io').to(req.params.id).emit('state_update', lobby);
        }

        res.json({ success: true, data: lobby });
    } catch (e) { err500(res, e); }
});

/* ─────────────────────────────────────────────
   GET /api/lobby/:id/state  — Lightweight poll
   Returns only the fields the frontend needs to stay in sync.
───────────────────────────────────────────── */
router.get('/lobby/:id/state', async (req, res) => {
    try {
        const lobby = await Lobby.findById(req.params.id,
            'status currentPlayer auctionSeq teams players updatedAt maxSquadSize maxOverseas'
        );
        if (!lobby) return notFound(res);
        res.json({ success: true, data: lobby });
    } catch (e) { err500(res, e); }
});

/* ─────────────────────────────────────────────
   POST /api/lobby/:id/team/:teamId/finalize
   Body: { playing11: [...localIds], bench: [...localIds] }
───────────────────────────────────────────── */
router.post('/lobby/:id/team/:teamId/finalize', async (req, res) => {
    try {
        const { playing11, bench } = req.body;
        if (!Array.isArray(playing11) || !Array.isArray(bench)) {
            return res.status(400).json({ success: false, message: 'playing11 and bench must be arrays of localIds.' });
        }

        const lobby = await Lobby.findById(req.params.id);
        if (!lobby) return notFound(res);

        const team = lobby.teams.find(t => String(t.localId) === req.params.teamId);
        if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

        team.playing11 = playing11;
        team.bench = bench;
        await lobby.save();

        if (req.app.get('io')) {
            req.app.get('io').to(req.params.id).emit('state_update', lobby);
        }

        res.json({ success: true, data: lobby });
    } catch (e) { err500(res, e); }
});

module.exports = router;
