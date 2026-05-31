// backend/src/routes/player.routes.js
const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST /api/player/upload/:roomId
// @desc    Upload players via Excel
// @access  Private (Auctioneer only)
router.post('/upload/:roomId', auth, upload.single('file'), playerController.uploadPlayers);

// @route   GET /api/player/:roomId
// @desc    Get all players in room
// @access  Private
router.get('/:roomId', auth, playerController.getPlayers);

// @route   GET /api/player/details/:playerId
// @desc    Get player details
// @access  Private
router.get('/details/:playerId', auth, playerController.getPlayer);

module.exports = router;