// backend/src/routes/room.routes.js
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const auth = require('../middleware/auth');

// @route   POST /api/room/create
// @desc    Create auction room (Auctioneer only)
// @access  Private
router.post('/create', auth, roomController.createRoom);

// @route   POST /api/room/join
// @desc    Join auction room (Contestant)
// @access  Private
router.post('/join', auth, roomController.joinRoom);

// @route   GET /api/room/my-rooms
// @desc    Get user's rooms
// @access  Private
router.get('/my-rooms', auth, roomController.getMyRooms);

// @route   GET /api/room/:roomId
// @desc    Get room details
// @access  Private
router.get('/:roomId', auth, roomController.getRoomDetails);

// @route   GET /api/room/:roomId/teams
// @desc    Get all teams in room
// @access  Private
router.get('/:roomId/teams', auth, roomController.getTeams);

// @route   PUT /api/room/:roomId/playing-xi
// @desc    Update team's playing XI
// @access  Private (Contestant only)
router.put('/:roomId/playing-xi', auth, roomController.updatePlayingXI);

module.exports = router;