const express = require('express');
const router = express.Router();

// Mock Login Endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Simple mock authentication
        if (username && password) {
            res.status(200).json({ success: true, message: 'Login successful', username });
        } else {
            res.status(400).json({ success: false, message: 'Username and password are required' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Mock Register Endpoint
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (username && password) {
            res.status(201).json({ success: true, message: 'Registration successful', username });
        } else {
            res.status(400).json({ success: false, message: 'Username and password are required' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
