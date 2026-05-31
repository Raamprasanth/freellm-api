// backend/src/controllers/playerController.js
const XLSX = require('xlsx');
const Player = require('../models/Player');
const Room = require('../models/Room');

// Upload players from Excel file
exports.uploadPlayers = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File:', req.file);
    console.log('Room ID:', req.params.roomId);

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    const { roomId } = req.params;

    // Verify room exists
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ 
        success: false,
        message: 'Room not found' 
      });
    }

    console.log('Parsing Excel file...');
    
    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log('Parsed rows:', data.length);

    if (data.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Excel file is empty' 
      });
    }

    // Delete existing players for this room
    const deleteResult = await Player.deleteMany({ room: roomId });
    console.log('Deleted existing players:', deleteResult.deletedCount);

    // Map and validate player data
    const players = data.map((row, index) => {
      // Convert field names to lowercase for case-insensitive matching
      const normalizedRow = {};
      Object.keys(row).forEach(key => {
        normalizedRow[key.toLowerCase().trim()] = row[key];
      });

      const player = {
        name: normalizedRow.name || normalizedRow.player || '',
        role: normalizedRow.role || '',
        country: normalizedRow.country || '',
        basePrice: parseFloat(normalizedRow.baseprice || normalizedRow['base price'] || 0),
        stats: {
          matches: parseInt(normalizedRow.matches || normalizedRow.mat || 0) || 0,
          runs: parseInt(normalizedRow.runs || 0) || 0,
          wickets: parseInt(normalizedRow.wickets || normalizedRow.wkts || 0) || 0,
          average: parseFloat(normalizedRow.average || normalizedRow.avg || 0) || 0
        },
        room: roomId,
        status: 'unsold',
        order: index // Add order field to preserve Excel row order
      };

      console.log(`Row ${index + 1}:`, player);
      return player;
    });

    // Validate required fields
    const invalidPlayers = players.filter(
      p => !p.name || !p.role || !p.country || !p.basePrice
    );

    if (invalidPlayers.length > 0) {
      console.log('Invalid players found:', invalidPlayers);
      return res.status(400).json({
        success: false,
        message: 'Some players have missing required fields (name, role, country, basePrice)',
        invalidPlayers: invalidPlayers.slice(0, 5), // Show first 5 invalid entries
        sampleRow: data[0] // Show a sample row to help debug
      });
    }

    console.log('Inserting players into database...');

    // Insert players into database
    const insertedPlayers = await Player.insertMany(players);

    console.log('Players inserted successfully:', insertedPlayers.length);

    res.status(200).json({
      success: true,
      message: 'Players uploaded successfully',
      count: insertedPlayers.length,
      players: insertedPlayers
    });

  } catch (error) {
    console.error('Error uploading players:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Failed to upload players',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all players for a room
exports.getPlayers = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Sort by order field to preserve Excel sheet order
    const players = await Player.find({ room: roomId }).sort({ order: 1 });
    
    res.status(200).json({
      success: true,
      count: players.length,
      players
    });
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch players',
      error: error.message 
    });
  }
};

// Get a single player
exports.getPlayer = async (req, res) => {
  try {
    const { playerId } = req.params;
    
    const player = await Player.findById(playerId);
    
    if (!player) {
      return res.status(404).json({ 
        success: false,
        message: 'Player not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      player
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch player',
      error: error.message 
    });
  }
};

// Update player status (sold/unsold)
exports.updatePlayerStatus = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { status, soldPrice, soldTo, soldToTeamId } = req.body;
    
    const updateData = { status };
    
    if (status === 'sold') {
      updateData.soldPrice = soldPrice;
      updateData.soldTo = soldTo;
      updateData.soldToTeamId = soldToTeamId;
    } else if (status === 'unsold') {
      updateData.soldPrice = null;
      updateData.soldTo = null;
      updateData.soldToTeamId = null;
    }
    
    const player = await Player.findByIdAndUpdate(
      playerId,
      updateData,
      { new: true }
    );
    
    if (!player) {
      return res.status(404).json({ 
        success: false,
        message: 'Player not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      player
    });
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update player',
      error: error.message 
    });
  }
};