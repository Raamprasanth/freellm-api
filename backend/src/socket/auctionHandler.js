// backend/src/socket/auctionHandler.js
const Room = require('../models/Room');
const Player = require('../models/Player');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    // Join room
    socket.on('join-room', async ({ roomId, userId, username, role }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.userId = userId;
      socket.username = username;
      socket.role = role;

      console.log(`✅ ${username} (${role}) joined room ${roomId}`);

      // Notify others
      socket.to(roomId).emit('user-joined', {
        userId,
        username,
        role,
        message: `${username} joined the auction`
      });

      // Send current room state
      const room = await Room.findOne({ roomId })
        .populate('currentPlayer')
        .populate('teams.userId', 'username')
        .populate({
          path: 'teams.players',
          model: 'Player'
        });

      socket.emit('room-state', room);
      
      // Also send teams update to all clients when someone joins
      io.to(roomId).emit('teams-updated', {
        teams: room.teams
      });
    });

    // Start bidding for a player
    socket.on('start-bidding', async ({ roomId, playerId }) => {
      try {
        const room = await Room.findOne({ roomId });
        const player = await Player.findById(playerId);

        if (!room || !player) return;

        room.currentPlayer = playerId;
        room.auctionStatus = 'active';
        await room.save();

        io.to(roomId).emit('bidding-started', {
          player: {
            id: player._id,
            name: player.name,
            role: player.role,
            country: player.country,
            basePrice: player.basePrice,
            stats: player.stats
          },
          currentBid: player.basePrice,
          highestBidder: null
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Place bid
    socket.on('place-bid', async ({ roomId, playerId, bidAmount, teamName, userId }) => {
      try {
        const room = await Room.findOne({ roomId });
        const player = await Player.findById(playerId);

        if (!room || !player) return;

        // Find the team - convert both to string for comparison
        const team = room.teams.find(t => t.userId.toString() === userId.toString());
        if (!team) {
          socket.emit('bid-error', { message: 'Team not found' });
          return;
        }

        // Check if team has enough purse
        const purseRemaining = team.purseRemaining ?? room.rules.totalPurse;
        if (purseRemaining < bidAmount) {
          socket.emit('bid-error', { message: 'Insufficient purse remaining' });
          return;
        }

        // Broadcast bid to all users in room
        io.to(roomId).emit('new-bid', {
          playerId,
          bidAmount,
          teamName,
          userId,
          timestamp: new Date()
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Sold player
    socket.on('sell-player', async ({ roomId, playerId, soldPrice, teamId, teamName }) => {
      try {
        console.log('🎯 Sell player event received:', { roomId, playerId, soldPrice, teamId, teamName });
        
        const room = await Room.findOne({ roomId });
        const player = await Player.findById(playerId);

        if (!room || !player) {
          console.error('❌ Room or player not found');
          return;
        }

        console.log('📝 Selling player:', player.name, 'to team:', teamName, 'for:', soldPrice);
        console.log('🔍 Looking for team with userId:', teamId);

        // Update player
        player.status = 'sold';
        player.soldPrice = soldPrice;
        player.soldTo = teamName;
        player.soldToTeamId = teamId;
        await player.save();
        console.log('✅ Player updated in database');

        // Find and update team - convert both to string for comparison
        const teamIndex = room.teams.findIndex(t => {
          const teamUserId = t.userId._id ? t.userId._id.toString() : t.userId.toString();
          const targetTeamId = teamId.toString();
          console.log('🔍 Comparing:', teamUserId, 'with', targetTeamId);
          return teamUserId === targetTeamId;
        });

        if (teamIndex === -1) {
          console.error('❌ Team not found. Available teams:', room.teams.map(t => ({
            userId: t.userId._id || t.userId,
            teamName: t.teamName
          })));
          return;
        }

        const team = room.teams[teamIndex];
        console.log('📊 Before update - Team:', team.teamName, 'Purse:', team.purseRemaining, 'Players:', team.players.length);
        
        // Initialize purseRemaining if not set (for old teams)
        if (team.purseRemaining === undefined || team.purseRemaining === null) {
          team.purseRemaining = room.rules.totalPurse;
          console.log('💰 Initialized purse to:', team.purseRemaining);
        }
        
        // Deduct the sold price
        team.purseRemaining = parseFloat((team.purseRemaining - soldPrice).toFixed(2));
        
        // Add player to team
        team.players.push(playerId);
        
        console.log('📊 After update - Team:', team.teamName, 'Purse:', team.purseRemaining, 'Players:', team.players.length);

        room.currentPlayer = null;
        
        // Use markModified to ensure Mongoose detects the changes
        room.markModified('teams');
        await room.save();
        console.log('✅ Room saved to database');

        // Fetch updated room with populated data
        const updatedRoom = await Room.findOne({ roomId })
          .populate('teams.userId', 'username')
          .populate({
            path: 'teams.players',
            model: 'Player'
          });

        console.log('📤 Sending updated teams to clients. Teams count:', updatedRoom.teams.length);
        updatedRoom.teams.forEach(t => {
          console.log(`  - ${t.teamName}: ₹${t.purseRemaining} Cr (${t.players.length} players)`);
        });

        // Notify all users with complete player data
        io.to(roomId).emit('player-sold', {
          player: {
            id: player._id,
            name: player.name,
            role: player.role
          },
          soldPrice,
          teamName,
          teamId,
          teams: updatedRoom.teams
        });
        console.log('✅ Player sold event sent successfully');

        // Also send separate teams update
        io.to(roomId).emit('teams-updated', {
          teams: updatedRoom.teams
        });
        console.log('✅ Teams updated event sent successfully');
      } catch (error) {
        console.error('❌ Sell player error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Unsold player
    socket.on('unsold-player', async ({ roomId, playerId }) => {
      try {
        const room = await Room.findOne({ roomId });
        const player = await Player.findById(playerId);

        if (!room || !player) return;

        player.status = 'unsold';
        await player.save();

        room.currentPlayer = null;
        await room.save();

        io.to(roomId).emit('player-unsold', {
          player: {
            id: player._id,
            name: player.name
          }
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Chat message
    socket.on('send-message', ({ roomId, message, username }) => {
      io.to(roomId).emit('new-message', {
        username,
        message,
        timestamp: new Date()
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
      if (socket.roomId && socket.username) {
        socket.to(socket.roomId).emit('user-left', {
          username: socket.username,
          message: `${socket.username} left the auction`
        });
      }
    });
  });
};