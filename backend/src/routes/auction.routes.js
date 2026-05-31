// backend/src/routes/auction.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Placeholder for auction-related REST endpoints
// Most auction logic will be handled via Socket.io

// @route   GET /api/auction/:roomId/status
// @desc    Get auction status
// @access  Private
router.get('/:roomId/status', auth, async (req, res) => {
  res.json({ success: true, message: 'Auction status endpoint' });
});

module.exports = router;