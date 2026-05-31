const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;
        
        if (!credential) {
            return res.status(400).json({ success: false, message: 'No credential provided' });
        }

        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Find or create the user in our database
        let user = await User.findOne({ googleId });
        if (!user) {
            user = new User({
                googleId,
                email,
                name,
                picture
            });
            await user.save();
        }

        // Generate our application JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({ 
            success: true, 
            message: 'Login successful', 
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ success: false, error: 'Authentication failed' });
    }
});

module.exports = router;
