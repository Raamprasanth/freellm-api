// backend/src/controllers/roomController.js
const Room = require('../models/Room');

// @desc    Create auction room
exports.createRoom = async (req, res) => {
  try {
    const { name, rules } = req.body;

    // Check if user is auctioneer
    if (req.user.role !== 'auctioneer') {
      return res.status(403).json({
        success: false,
        message: 'Only auctioneers can create rooms'
      });
    }

    // Generate unique room ID
    let roomId;
    let roomExists = true;
    
    while (roomExists) {
      roomId = Room.generateRoomId();
      const existing = await Room.findOne({ roomId });
      if (!existing) roomExists = false;
    }

    // Create room
    const room = await Room.create({
      roomId,
      auctioneer: req.user.id,
      name,
      rules: rules || {}
    });

    res.status(201).json({
      success: true,
      room: {
        id: room._id,
        roomId: room.roomId,
        name: room.name,
        rules: room.rules
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Join auction room
exports.joinRoom = async (req, res) => {
  try {
    const { roomId, teamName } = req.body;

    // Check if user is contestant
    if (req.user.role !== 'contestant') {
      return res.status(403).json({
        success: false,
        message: 'Only contestants can join rooms'
      });
    }

    // Find room
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user already joined
    const alreadyJoined = room.teams.some(
      team => team.userId.toString() === req.user.id
    );
    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: 'You have already joined this room'
      });
    }

    // Add team to room
    room.teams.push({
      userId: req.user.id,
      teamName,
      purseRemaining: room.rules.totalPurse,
      players: []
    });

    await room.save();

    res.json({
      success: true,
      message: 'Successfully joined room',
      room: {
        id: room._id,
        roomId: room.roomId,
        name: room.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get room details
exports.getRoomDetails = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate('auctioneer', 'username email')
      .populate('teams.userId', 'username')
      .populate('players')
      .populate('currentPlayer');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all teams
exports.getTeams = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate('teams.userId', 'username')
      .populate({
        path: 'teams.players',
        model: 'Player'
      });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      teams: room.teams
    });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's rooms (created or joined)
exports.getMyRooms = async (req, res) => {
  try {
    let rooms;

    if (req.user.role === 'auctioneer') {
      // Get rooms created by this auctioneer
      rooms = await Room.find({ auctioneer: req.user.id })
        .populate('teams.userId', 'username')
        .sort({ createdAt: -1 })
        .limit(10);
    } else {
      // Get rooms where this user is a contestant
      rooms = await Room.find({ 'teams.userId': req.user.id })
        .populate('auctioneer', 'username')
        .populate('teams.userId', 'username')
        .sort({ createdAt: -1 })
        .limit(10);
    }

    res.json({
      success: true,
      rooms: rooms.map(room => ({
        id: room._id,
        roomId: room.roomId,
        name: room.name,
        status: room.auctionStatus,
        teamsCount: room.teams.length,
        playersCount: room.players.length,
        createdAt: room.createdAt
      }))
    });
  } catch (error) {
    console.error('Get my rooms error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update team's playing XI
exports.updatePlayingXI = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { players, captain, viceCaptain, wicketKeeper } = req.body;

    // Validate required fields
    if (!players || !Array.isArray(players) || players.length !== 11) {
      return res.status(400).json({
        success: false,
        message: 'Playing XI must have exactly 11 players'
      });
    }

    if (!captain || !viceCaptain || !wicketKeeper) {
      return res.status(400).json({
        success: false,
        message: 'Captain, Vice Captain, and Wicket Keeper are required'
      });
    }

    // Find room and team
    const room = await Room.findOne({ roomId })
      .populate({
        path: 'teams.players',
        model: 'Player'
      });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const team = room.teams.find(t => t.userId.toString() === req.user.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Validate all players belong to the team
    const teamPlayerIds = team.players.map(p => p._id.toString());
    const allPlayersValid = players.every(p => teamPlayerIds.includes(p));
    
    if (!allPlayersValid) {
      return res.status(400).json({
        success: false,
        message: 'All playing XI players must be from your squad'
      });
    }

    // Validate captain, vice captain, and wicket keeper are in playing XI
    if (!players.includes(captain) || !players.includes(viceCaptain) || !players.includes(wicketKeeper)) {
      return res.status(400).json({
        success: false,
        message: 'Captain, Vice Captain, and Wicket Keeper must be in Playing XI'
      });
    }

    // Count foreign players (non-Indian)
    const playingXIPlayers = team.players.filter(p => players.includes(p._id.toString()));
    const foreignCount = playingXIPlayers.filter(p => p.country && p.country.toLowerCase() !== 'india').length;
    
    if (foreignCount > 4) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 4 foreign players allowed in Playing XI'
      });
    }

    // Validate wicket keeper role
    const wkPlayer = team.players.find(p => p._id.toString() === wicketKeeper);
    if (wkPlayer && wkPlayer.role !== 'Wicket-Keeper') {
      return res.status(400).json({
        success: false,
        message: 'Selected wicket keeper must have Wicket-Keeper role'
      });
    }

    // Update playing XI
    team.playingXI = {
      players,
      captain,
      viceCaptain,
      wicketKeeper
    };

    await room.save();

    res.json({
      success: true,
      message: 'Playing XI updated successfully',
      playingXI: team.playingXI
    });
  } catch (error) {
    console.error('Update playing XI error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};