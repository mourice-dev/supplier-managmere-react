const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/notifications — Get unread notifications (max 10)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM notifications WHERE is_read = FALSE ORDER BY created_at DESC LIMIT 10'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/notifications/:id/read — Mark notification as read
router.post('/:id/read', async (req, res) => {
    try {
        await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [req.params.id]);
        res.json({ message: 'Notification marked as read.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/notifications/read-all — Mark all as read
router.post('/read-all', async (req, res) => {
    try {
        await db.query('UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE');
        res.json({ message: 'All notifications marked as read.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
