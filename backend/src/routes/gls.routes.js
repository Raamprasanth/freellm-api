// backend/src/routes/gls.routes.js
const express = require('express');
const router = express.Router();
const glsController = require('../controllers/glsController');
const auth = require('../middleware/auth');

// Apply auth middleware to all GLS routes
router.use(auth);

// @route   POST /api/gls/role
router.post('/role', glsController.saveRoleSelection);

// @route   GET /api/gls/state
router.get('/state', glsController.getGlsState);

module.exports = router;
