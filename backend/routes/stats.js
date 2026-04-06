const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/stats  — Dashboard summary
router.get('/', async (req, res) => {
    try {
        const [[{ total_suppliers }]] = await db.query('SELECT COUNT(*) AS total_suppliers FROM suppliers');
        const [[{ pending_requests }]] = await db.query(
            "SELECT COUNT(*) AS pending_requests FROM procurement_requests WHERE status = 'Pending'"
        );
        const [[{ total_orders }]] = await db.query('SELECT COUNT(*) AS total_orders FROM purchase_orders');
        const [[{ total_revenue }]] = await db.query(
            "SELECT COALESCE(SUM(amount), 0) AS total_revenue FROM payments WHERE status = 'Completed'"
        );
        res.json({ total_suppliers, pending_requests, total_orders, total_revenue });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
