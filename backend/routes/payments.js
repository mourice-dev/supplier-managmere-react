const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/payments — List all payments with supplier name
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                p.*,
                s.name AS supplier_name,
                s.contact_email AS supplier_email
            FROM payments p
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            ORDER BY p.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/payments/:id/complete — Mark payment as Completed
router.post('/:id/complete', async (req, res) => {
    try {
        const [[payment]] = await db.query('SELECT id FROM payments WHERE id = ?', [req.params.id]);
        if (!payment) return res.status(404).json({ message: 'Payment not found.' });

        await db.query("UPDATE payments SET status = 'Completed' WHERE id = ?", [req.params.id]);
        res.json({ message: 'Payment marked as completed.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/payments/:id/fail — Mark payment as Failed
router.post('/:id/fail', async (req, res) => {
    try {
        await db.query("UPDATE payments SET status = 'Failed' WHERE id = ?", [req.params.id]);
        res.json({ message: 'Payment marked as failed.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
