const Lobby = require('../models/lobbymodel');
const Room = require('../models/Room');

const activeGames = {}; // In-memory store: { lobbyId: { ...state } }

function getCleanGame(game) {
    if (!game) return null;
    const clean = { ...game };
    if (clean.timerInterval) {
        // Exclude the live Timer object to prevent Socket.io JSON serialization call stack overflows!
        delete clean.timerInterval;
    }
    if (clean.soldCountdownInterval) {
        delete clean.soldCountdownInterval;
    }
    // Remove the huge players array to save WebSocket bandwidth on every bid
    if (clean.players) {
        delete clean.players;
    }
    return clean;
}

module.exports = function (io) {
    io.on('connection', (socket) => {
        console.log(`🔌 New Socket Connection: ${socket.id}`);

        socket.on('join_lobby', async ({ lobbyId, roomCode, role, teamLocalId, playerName }) => {
            try {
            if (!lobbyId) {
                socket.emit('connection_error', { message: 'Lobby id missing. Please re-enter the room.' });
                return;
            }
            socket.join(lobbyId);
            console.log(`👥 Socket ${socket.id} joined lobby ${lobbyId} as ${role} (Name: ${playerName})`);

            const lobby = await Lobby.findById(lobbyId);
            if (!lobby) {
                socket.emit('connection_error', { message: 'Lobby not found. Ask the auctioneer to restart the room.' });
                return;
            }

            // Initialize in-memory game state if not present
                if (!activeGames[lobbyId]) {
                    activeGames[lobbyId] = {
                    status: lobby.status,
                    currentPlayer: lobby.currentPlayer,
                    teams: lobby.teams.map(t => t.toObject ? t.toObject() : t),
                    players: lobby.players.map(p => p.toObject ? p.toObject() : p),
                    auctionSeq: lobby.auctionSeq,
                    timer: 10,
                    timerInterval: null
                };
            } else {
                // Sync teams from DB to ensure late-added teams are present
                activeGames[lobbyId].teams = lobby.teams.map(t => t.toObject ? t.toObject() : t);
                activeGames[lobbyId].players = lobby.players.map(p => p.toObject ? p.toObject() : p);
                }

                const game = activeGames[lobbyId];
                if (game.status === 'LIVE' && game.currentPlayer?.localId && !game.currentPlayer.name) {
                    const activePlayer = lobby.players.find(p => String(p.localId) === String(game.currentPlayer.localId));
                    const activePlayerData = activePlayer?.toObject ? activePlayer.toObject() : activePlayer;
                    if (activePlayerData) {
                        game.currentPlayer = {
                            ...activePlayerData,
                            localId: game.currentPlayer.localId,
                            curBid: game.currentPlayer.curBid,
                            basePrice: activePlayerData.basePrice ?? game.currentPlayer.curBid,
                            topBidder: game.currentPlayer.topBidder,
                            biddingClosed: Boolean(game.currentPlayer.biddingClosed)
                        };
                    }
                }

                // Assign human owner
            if (role === 'player' && teamLocalId) {
                const teamIdStr = String(teamLocalId).toLowerCase();
                const team = game.teams.find(t => String(t.localId).toLowerCase() === teamIdStr || String(t.id).toLowerCase() === teamIdStr);
                if (team) {
                    team.owner = playerName || 'Player';
                    team.isAI = false;
                    
                    // Save to DB so it persists
                    const dbTeam = lobby.teams.find(t => String(t.localId).toLowerCase() === teamIdStr || String(t.id).toLowerCase() === teamIdStr);
                    if (dbTeam) {
                        dbTeam.owner = team.owner;
                        dbTeam.isAI = false;
                        
                        // Save to DB using atomic update to completely bypass Mongoose call stack overflow bugs
                        await Lobby.updateOne(
                            { _id: lobbyId, "teams.localId": dbTeam.localId },
                            { $set: { "teams.$.owner": team.owner, "teams.$.isAI": false } }
                        );
                    }

                    // Broadcast real-time toast to all users
                    io.to(lobbyId).emit('player_joined_toast', { playerName: team.owner, teamName: team.name, totalTeams: game.teams.length });
                }
            }

            // Assign AI to unclaimed teams (Disabled per request)
            game.teams.forEach(t => {
                // If it was previously an AI, clear it out.
                if (t.owner === 'AI') {
                    t.owner = '';
                }
                t.isAI = false;
            });

            // Broadcast state to everyone in lobby to instantly update Auctioneer screen
            io.to(lobbyId).emit('state_update', getCleanGame(game));
            } catch (err) {
                console.error('Socket join_lobby error:', err?.message || err);
                socket.emit('connection_error', {
                    message: 'Could not connect to the auction room. Please refresh in a few seconds.'
                });
            }
        });

        // Auctioneer starts the bidding for a player
        socket.on('start_auction', async ({ lobbyId, playerLocalId, basePrice, player: clientPlayer }) => {
            const game = activeGames[lobbyId];
            if (!game) return;

            // Dynamically scale basePrice from Lakhs to Rupees if stored in Lakhs
            let scaledBasePrice = basePrice;
            if (scaledBasePrice < 10000) {
                scaledBasePrice = scaledBasePrice * 100000;
            }

            game.status = 'LIVE';
            game.auctionSeq = (game.auctionSeq || 0) + 1;
            game.timer = 10;

            try {
                const lobby = await Lobby.findById(lobbyId);
                if (lobby) {
                    let dbPlayer = lobby.players.find(p => String(p.localId) === String(playerLocalId));
                    if (!dbPlayer && clientPlayer?.name) {
                        lobby.players.push({
                            localId: clientPlayer.localId ?? clientPlayer.id ?? playerLocalId,
                            name: clientPlayer.name,
                            country: clientPlayer.country,
                            age: clientPlayer.age,
                            role: clientPlayer.role,
                            basePrice: clientPlayer.basePrice ?? scaledBasePrice,
                            matches: clientPlayer.matches,
                            innings: clientPlayer.innings,
                            runs: clientPlayer.runs,
                            balls: clientPlayer.balls,
                            highest: clientPlayer.highest,
                            notOut: clientPlayer.notOut,
                            fours: clientPlayer.fours,
                            sixes: clientPlayer.sixes,
                            ducks: clientPlayer.ducks,
                            fifties: clientPlayer.fifties,
                            hundreds: clientPlayer.hundreds,
                            wickets: clientPlayer.wickets,
                            maidens: clientPlayer.maidens,
                            bbi: clientPlayer.bbi,
                            avg: clientPlayer.avg,
                            sr: clientPlayer.sr,
                            economy: clientPlayer.economy,
                            status: 'available',
                            soldTo: null,
                            soldPrice: 0
                        });
                        dbPlayer = lobby.players[lobby.players.length - 1];
                    } else if (dbPlayer && clientPlayer) {
                        // Ensure live fetched AI stats from client override old DB stats
                        dbPlayer.matches = clientPlayer.matches ?? dbPlayer.matches;
                        dbPlayer.innings = clientPlayer.innings ?? dbPlayer.innings;
                        dbPlayer.runs = clientPlayer.runs ?? dbPlayer.runs;
                        dbPlayer.balls = clientPlayer.balls ?? dbPlayer.balls;
                        dbPlayer.highest = clientPlayer.highest ?? dbPlayer.highest;
                        dbPlayer.notOut = clientPlayer.notOut ?? dbPlayer.notOut;
                        dbPlayer.fours = clientPlayer.fours ?? dbPlayer.fours;
                        dbPlayer.sixes = clientPlayer.sixes ?? dbPlayer.sixes;
                        dbPlayer.ducks = clientPlayer.ducks ?? dbPlayer.ducks;
                        dbPlayer.fifties = clientPlayer.fifties ?? dbPlayer.fifties;
                        dbPlayer.hundreds = clientPlayer.hundreds ?? dbPlayer.hundreds;
                        dbPlayer.wickets = clientPlayer.wickets ?? dbPlayer.wickets;
                        dbPlayer.maidens = clientPlayer.maidens ?? dbPlayer.maidens;
                        dbPlayer.bbi = clientPlayer.bbi ?? dbPlayer.bbi;
                        dbPlayer.avg = clientPlayer.avg ?? dbPlayer.avg;
                        dbPlayer.sr = clientPlayer.sr ?? dbPlayer.sr;
                        dbPlayer.economy = clientPlayer.economy ?? dbPlayer.economy;
                    }
                    if (dbPlayer) dbPlayer.status = 'in-auction';
                    const playerData = dbPlayer?.toObject ? dbPlayer.toObject() : (dbPlayer || clientPlayer);
                    game.currentPlayer = {
                        ...(playerData || {}),
                        localId: playerLocalId,
                        curBid: scaledBasePrice,
                        basePrice: scaledBasePrice,
                        topBidder: null,
                        biddingClosed: false
                    };
                    lobby.status = 'LIVE';
                    lobby.auctionSeq = game.auctionSeq;
                    lobby.currentPlayer = { localId: playerLocalId, curBid: scaledBasePrice, topBidder: null };
                    await lobby.save();

                    game.players = lobby.players.map(p => p.toObject ? p.toObject() : p);
                    game.teams = lobby.teams.map(t => {
                        let obj = t.toObject ? t.toObject() : t;
                        if (obj.owner === 'AI') {
                            obj.owner = '';
                        }
                        obj.isAI = false;
                        return obj;
                    });
                }
            } catch (err) {
                console.error("DB Save Error on Start:", err);
            }
            game.currentPlayer = { ...(clientPlayer || {}), localId: playerLocalId, curBid: scaledBasePrice, basePrice: scaledBasePrice, topBidder: null, biddingClosed: false };
            
            // Clear any existing timer
            if (game.timerInterval) clearInterval(game.timerInterval);

            io.to(lobbyId).emit('state_update', getCleanGame(game));

            // Start AI bidding interval (no auto close)
            game.timerInterval = setInterval(() => {
                simulateAIBid(lobbyId, io);
            }, 2000);
        });

        // Player places a bid
        socket.on('place_bid', ({ lobbyId, teamLocalId, amount }) => {
            handleBid(lobbyId, teamLocalId, amount);
        });

        function handleBid(lobbyId, teamLocalId, amount) {
            const game = activeGames[lobbyId];
            if (!game || game.status !== 'LIVE') return;
            if (game.currentPlayer?.biddingClosed) return;

            // Cancel any active sold countdown
            if (game.soldCountdownInterval) {
                clearInterval(game.soldCountdownInterval);
                game.soldCountdownInterval = null;
                io.to(lobbyId).emit('sold_countdown_cancelled');
            }

            // Dynamically scale basePrice and curBid from Lakhs to Rupees if stored in Lakhs
            if (game.currentPlayer.basePrice && game.currentPlayer.basePrice < 10000) {
                game.currentPlayer.basePrice = game.currentPlayer.basePrice * 100000;
            }
            if (game.currentPlayer.curBid && game.currentPlayer.curBid < 10000) {
                game.currentPlayer.curBid = game.currentPlayer.curBid * 100000;
            }

            // Basic validation: first bid can be exactly the basePrice!
            const isFirstBid = !game.currentPlayer.topBidder;
            if (isFirstBid) {
                if (amount < game.currentPlayer.basePrice) return;
            } else {
                if (amount <= game.currentPlayer.curBid) return;
            }

            game.currentPlayer.curBid = amount;
            game.currentPlayer.topBidder = teamLocalId;

            io.to(lobbyId).emit('state_update', getCleanGame(game));
            io.to(lobbyId).emit('bid_placed', { teamLocalId, amount });
        }

        socket.on('mark_sold', ({ lobbyId, playerLocalId, teamLocalId, amount }) => {
            const game = activeGames[lobbyId];
            if (game && game.soldCountdownInterval) {
                clearInterval(game.soldCountdownInterval);
                game.soldCountdownInterval = null;
            }
            if (game && game.timerInterval) {
                clearInterval(game.timerInterval);
                game.timerInterval = null;
            }
            handleSold(lobbyId, { playerLocalId, teamLocalId, amount });
        });

        socket.on('start_sold_countdown', ({ lobbyId }) => {
            const game = activeGames[lobbyId];
            if (!game || game.status !== 'LIVE') return;
            if (!game.currentPlayer || !game.currentPlayer.topBidder) return;
            
            if (game.soldCountdownInterval) clearInterval(game.soldCountdownInterval);
            
            let timeLeft = 5;
            io.to(lobbyId).emit('sold_countdown_tick', { timeLeft });
            
            game.soldCountdownInterval = setInterval(() => {
                timeLeft--;
                if (timeLeft > 0) {
                    io.to(lobbyId).emit('sold_countdown_tick', { timeLeft });
                } else {
                    clearInterval(game.soldCountdownInterval);
                    game.soldCountdownInterval = null;
                    if (game.timerInterval) {
                        clearInterval(game.timerInterval);
                        game.timerInterval = null;
                    }
                    handleSold(lobbyId);
                }
            }, 1000);
        });

        socket.on('mark_unsold', ({ lobbyId }) => {
            const game = activeGames[lobbyId];
            if (game && game.timerInterval) {
                clearInterval(game.timerInterval);
                game.timerInterval = null;
            }
            handleUnsold(lobbyId);
        });

        function parseIntSafe(val) {
            if (!val) return 0;
            const parsed = parseFloat(String(val).replace(/[^0-9.]/g, ''));
            return isNaN(parsed) ? 0 : parsed;
        }

        function calculatePlayerTrueValue(player) {
            let rating = 0;
            const role = player.role || 'BAT';
            const runs = parseIntSafe(player.runs);
            const wickets = parseIntSafe(player.wickets);
            const avg = parseIntSafe(player.avg);
            const sr = parseIntSafe(player.sr);
            const econ = parseIntSafe(player.economy);
            const matches = parseIntSafe(player.matches);
            let basePrice = parseIntSafe(player.basePrice) || 2000000;
            
            // Adjust basePrice if it's stored small (like 200 for 200L)
            if (basePrice < 10000) basePrice *= 100000;

            if (matches === 0) {
                // If no stats, base the value slightly above base price
                return basePrice * (1 + (Math.random() * 0.5));
            }

            if (role === 'BAT' || role === 'WK') {
                rating += Math.min(runs / 50, 40); 
                rating += Math.min(avg, 40);       
                rating += Math.max(0, Math.min((sr - 100) / 1.5, 20)); 
            } else if (role === 'BOWL') {
                rating += Math.min(wickets / 2, 50); 
                rating += Math.max(0, Math.min((10 - econ) * 10, 30)); 
                rating += Math.min(avg ? (400 / avg) : 0, 20); 
            } else if (role === 'AR') {
                rating += Math.min(runs / 100, 25);
                rating += Math.min(wickets / 4, 25);
                rating += Math.min(avg, 25);
                rating += Math.max(0, Math.min((10 - econ) * 5, 25));
            }

            rating = Math.min(100, rating);

            let val = basePrice;
            if (rating > 90) val = 150000000 + (Math.random() * 50000000);
            else if (rating > 70) val = 80000000 + (rating - 70) * 3500000;
            else if (rating > 50) val = 30000000 + (rating - 50) * 2500000;
            else if (rating > 30) val = Math.max(basePrice, 10000000 + (rating - 30) * 1000000);
            
            // Add slight randomness (+/- 15%)
            val = val * (0.85 + Math.random() * 0.3);
            return Math.max(basePrice, val);
        }

        function calculateNeedMultiplier(team, role) {
            const players = team.players || [];
            let count = players.filter(p => p.role === role).length;
            
            let expected = 8; // BAT
            if (role === 'BOWL') expected = 8;
            if (role === 'AR') expected = 5;
            if (role === 'WK') expected = 4;

            if (count === 0) return 1.5;
            
            let ratio = count / expected;
            if (ratio >= 1) return 0.2;
            if (ratio >= 0.7) return 0.6; 
            if (ratio >= 0.4) return 1.0;
            return 1.2;
        }

        function simulateAIBid(lobbyId, io) {
            return; // AI CPU feature removed as requested
            
            const game = activeGames[lobbyId];
            if (!game || game.status !== 'LIVE') return;
            
            const cp = game.currentPlayer;
            const currentBid = cp.curBid;
            const isFirstBid = !cp.topBidder;
            
            let increment = 1000000;
            if (currentBid >= 10000000) increment = 2500000;
            if (currentBid >= 50000000) increment = 5000000;

            const newBid = isFirstBid ? (cp.basePrice || currentBid) : (currentBid + increment);

            // Compute and cache True Value per player temporarily
            if (!cp._cachedTrueValue) {
                cp._cachedTrueValue = calculatePlayerTrueValue(cp);
            }

            const trueValue = cp._cachedTrueValue;
            const willingAIs = [];
            
            for (const ai of aiTeams) {
                const remBudget = ai.budget - ai.spent;
                
                // Hard cap: don't blow more than 40% of TOTAL budget on one player
                const hardCap = ai.budget * 0.4;
                
                // Keep 50 Lakhs reserve for remaining slots if needed
                const totalPlayers = (ai.players || []).length;
                const minReserve = Math.max(0, (20 - totalPlayers) * 5000000); 
                
                const needMult = calculateNeedMultiplier(ai, cp.role || 'BAT');
                let maxAiBid = trueValue * needMult;
                
                maxAiBid = Math.min(maxAiBid, hardCap);
                maxAiBid = Math.min(maxAiBid, remBudget - minReserve);

                if (newBid <= maxAiBid) {
                    willingAIs.push(ai);
                }
            }

            if (willingAIs.length > 0) {
                const randomAi = willingAIs[Math.floor(Math.random() * willingAIs.length)];
                handleBid(lobbyId, randomAi.localId, newBid);
            }
        }

        async function handleSold(lobbyId, fallback = {}) {
            const game = activeGames[lobbyId];
            if (!game) {
                socket.emit('sale_failed', { message: 'Auction state not ready. Refresh the lobby and try again.' });
                return;
            }

            const currentPlayer = game.currentPlayer || {};
            const soldPlayerLocalId = currentPlayer.localId ?? fallback.playerLocalId;
            const soldTeamLocalId = currentPlayer.topBidder ?? fallback.teamLocalId;
            const soldAmount = Number(currentPlayer.curBid ?? fallback.amount) || 0;
            if (soldPlayerLocalId == null) {
                socket.emit('sale_failed', { message: 'No current player found for sale.' });
                return;
            }
            if (!soldTeamLocalId) {
                socket.emit('sale_failed', { message: 'No highest bidder found. Place a bid before marking SOLD.' });
                return;
            }
            if (!soldAmount) {
                socket.emit('sale_failed', { message: 'No bid amount found for sale.' });
                return;
            }

            game.status = 'PAUSED';
            const soldPlayerData = game.players?.find(p => String(p.localId) === String(soldPlayerLocalId) || String(p.id) === String(soldPlayerLocalId))
                || currentPlayer;
            const soldGameTeam = game.teams?.find(t => String(t.localId) === String(soldTeamLocalId) || String(t.id) === String(soldTeamLocalId));

            if (soldPlayerData) {
                soldPlayerData.status = 'sold';
                soldPlayerData.soldTo = soldTeamLocalId;
                soldPlayerData.soldPrice = soldAmount;
            }

            if (soldGameTeam) {
                soldGameTeam.players = soldGameTeam.players || [];
                const alreadyInSquad = soldGameTeam.players.some(p => String(p.localId) === String(soldPlayerLocalId));
                if (!alreadyInSquad) {
                    soldGameTeam.spent += soldAmount;
                    soldGameTeam.players.push({
                        localId: soldPlayerLocalId,
                        name: soldPlayerData?.name || currentPlayer.name || `Player ${soldPlayerLocalId}`,
                        role: soldPlayerData?.role || currentPlayer.role || 'BAT',
                        soldPrice: soldAmount
                    });
                }
            }
            game.currentPlayer = { localId: null, curBid: 0, topBidder: null };

            // Persist to MongoDB (simplified for now, full logic in lobbyroutes.js can be called)
            try {
                const lobby = await Lobby.findById(lobbyId);
                if (lobby) {
                    const player = lobby.players.find(p => String(p.localId) === String(soldPlayerLocalId));
                    const team = lobby.teams.find(t => String(t.localId) === String(soldTeamLocalId) || String(t.id) === String(soldTeamLocalId));
                    if (player) {
                        player.status = 'sold';
                        player.soldTo = soldTeamLocalId;
                        player.soldPrice = soldAmount;
                    }
                    if (team) {
                        const alreadyInDbSquad = team.players.some(p => String(p.localId) === String(soldPlayerLocalId));
                        if (!alreadyInDbSquad) {
                            team.spent += soldAmount;
                            team.players.push({
                                localId: soldPlayerLocalId,
                                name: player?.name || soldPlayerData?.name || currentPlayer.name || `Player ${soldPlayerLocalId}`,
                                role: player?.role || soldPlayerData?.role || currentPlayer.role || 'BAT',
                                soldPrice: soldAmount
                            });
                        }
                    }
                    lobby.currentPlayer = { localId: null, curBid: 0, topBidder: null };
                    lobby.status = 'PAUSED';
                    await lobby.save();
                }
            } catch (err) {
                console.error("DB Save Error on Sold:", err);
            }

            io.to(lobbyId).emit('state_update', getCleanGame(game));
            io.to(lobbyId).emit('player_sold', {
                playerLocalId: soldPlayerLocalId,
                teamLocalId: soldTeamLocalId,
                amount: soldAmount,
                player: soldPlayerData
            });

            const fmtAmt = (v) => {
                if (v >= 10000000) return '₹' + (v / 10000000).toFixed(2).replace(/\.?0+$/, '') + ' Cr';
                if (v >= 100000) return '₹' + (v / 100000).toFixed(1).replace(/\.0$/, '') + 'L';
                return '₹' + v.toLocaleString();
            };
            const pName = soldPlayerData?.name || currentPlayer.name || `Player ${soldPlayerLocalId}`;
            const tName = soldGameTeam?.name || `Team ${soldTeamLocalId}`;
            io.to(lobbyId).emit('chat_message', {
                system: true,
                text: `🔨 <b>${pName}</b> sold to <b>${tName}</b> for <b>${fmtAmt(soldAmount)}</b>`
            });
        }

        socket.on('revert_sold', async ({ lobbyId, playerLocalId, teamLocalId, amount }) => {
            const game = activeGames[lobbyId];
            if (!game) return;
            
            try {
                const lobby = await Lobby.findById(lobbyId);
                if (!lobby) return;

                const player = lobby.players.find(p => String(p.localId) === String(playerLocalId));
                const team = lobby.teams.find(t => String(t.localId) === String(teamLocalId));

                if (player) {
                    player.status = 'in-auction';
                    player.soldTo = null;
                    player.soldPrice = 0;
                }
                if (team) {
                    team.spent -= amount;
                    team.players = team.players.filter(p => String(p.localId) !== String(playerLocalId));
                }

                lobby.status = 'LIVE';
                lobby.currentPlayer = { localId: playerLocalId, curBid: amount, topBidder: teamLocalId };
                await lobby.save();

                // Update in-memory state
                const gamePlayer = game.players.find(p => String(p.localId) === String(playerLocalId));
                if (gamePlayer) {
                    gamePlayer.status = 'in-auction';
                    gamePlayer.soldTo = null;
                    gamePlayer.soldPrice = 0;
                }
                const gameTeam = game.teams.find(t => String(t.localId) === String(teamLocalId));
                if (gameTeam) {
                    gameTeam.spent -= amount;
                    gameTeam.players = gameTeam.players.filter(p => String(p.localId) !== String(playerLocalId));
                }

                game.status = 'LIVE';
                game.currentPlayer = { 
                    ...(gamePlayer || {}),
                    localId: playerLocalId, 
                    curBid: amount, 
                    topBidder: teamLocalId,
                    biddingClosed: false
                };

                // Restart timer
                if (game.timerInterval) clearInterval(game.timerInterval);
                game.timerInterval = setInterval(() => {
                    simulateAIBid(lobbyId, io);
                }, 2000);

                io.to(lobbyId).emit('state_update', getCleanGame(game));

            } catch (err) {
                console.error("DB Save Error on Revert:", err);
            }
        });

        async function handleUnsold(lobbyId) {
            const game = activeGames[lobbyId];
            if (!game) return;

            const unsoldPlayerLocalId = game.currentPlayer.localId;
            game.status = 'PAUSED';
            const unsoldGamePlayer = game.players?.find?.(p => p.localId === unsoldPlayerLocalId || p.id === unsoldPlayerLocalId);
            if (unsoldGamePlayer) unsoldGamePlayer.status = 'unsold';
            game.currentPlayer = { localId: null, curBid: 0, topBidder: null };

            // Persist to MongoDB
            try {
                const lobby = await Lobby.findById(lobbyId);
                if (lobby) {
                    const player = lobby.players.find(p => String(p.localId) === String(unsoldPlayerLocalId));
                    if (player) {
                        player.status = 'unsold';
                    }
                    lobby.currentPlayer = { localId: null, curBid: 0, topBidder: null };
                    lobby.status = 'PAUSED';
                    await lobby.save();
                }
            } catch (err) {
                console.error("DB Save Error on Unsold:", err);
            }

            io.to(lobbyId).emit('state_update', getCleanGame(game));
            io.to(lobbyId).emit('player_unsold', {
                playerLocalId: unsoldPlayerLocalId
            });
        }

        socket.on('submit_playing_11', async ({ lobbyId, teamLocalId, playing11, bench = [] }) => {
            try {
                const game = activeGames[lobbyId];
                if (!game) return;

                const team = game.teams.find(t => String(t.localId) === String(teamLocalId) || String(t.id) === String(teamLocalId));
                if (team) {
                    team.playing11 = playing11;
                    team.bench = bench;
                }

                // Persist to MongoDB
                await Lobby.updateOne(
                    { _id: lobbyId, "teams.localId": teamLocalId },
                    { $set: { "teams.$.playing11": playing11, "teams.$.bench": bench } }
                );

                io.to(lobbyId).emit('state_update', getCleanGame(game));
            } catch (err) {
                console.error("submit_playing_11 Error:", err);
            }
        });

        socket.on('disconnect', () => {
            console.log(`❌ Socket disconnected: ${socket.id}`);
        });

        socket.on('chat_message', (data) => {
            if (!data.lobbyId || !data.text) return;
            io.to(data.lobbyId).emit('chat_message', {
                sender: data.sender || 'Unknown',
                text: data.text,
                system: data.system || false
            });
        });

        socket.on('broadcast_evaluation', ({ lobbyId, html }) => {
            const game = activeGames[lobbyId];
            if (game) {
                game.evaluationHtml = html;
                io.to(lobbyId).emit('evaluation_published', { html });
            }
        });

        // Start pre-game countdown (e.g., from lobby);
    });
};
