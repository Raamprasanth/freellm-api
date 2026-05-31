// backend/src/controllers/glsController.js
const Gls = require('../models/Gls');

// @desc    Save or update user's GLS role preference
// @route   POST /api/gls/role
// @access  Private
exports.saveRoleSelection = async (req, res) => {
  try {
    const { chosenRole } = req.body;
    
    // Upsert GLS record for the user
    let glsRecord = await Gls.findOne({ user: req.user.id });
    if (glsRecord) {
      glsRecord.chosenRole = chosenRole;
      glsRecord.lastActive = Date.now();
      await glsRecord.save();
    } else {
      glsRecord = await Gls.create({
        user: req.user.id,
        chosenRole
      });
    }

    res.status(200).json({
      success: true,
      data: glsRecord
    });
  } catch (error) {
    console.error('Error saving GLS role:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get user's current GLS state
// @route   GET /api/gls/state
// @access  Private
exports.getGlsState = async (req, res) => {
  try {
    const glsRecord = await Gls.findOne({ user: req.user.id });
    res.status(200).json({
      success: true,
      data: glsRecord || { chosenRole: 'none' }
    });
  } catch (error) {
    console.error('Error fetching GLS state:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
