const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.query(
            'SELECT id, username, role FROM users WHERE username = ? AND password = ?',
            [username, password]
        );
        if (users.length > 0) {
            res.json({ success: true, user: users[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
