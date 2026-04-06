const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/orders — List all purchase orders with supplier name
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                po.*,
                s.name AS supplier_name,
                s.contact_email AS supplier_email
            FROM purchase_orders po
            LEFT JOIN suppliers s ON po.supplier_id = s.id
            ORDER BY po.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/orders/:id/complete — Mark order as complete + auto-create payment
router.post('/:id/complete', async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [[order]] = await conn.query('SELECT * FROM purchase_orders WHERE id = ?', [req.params.id]);
        if (!order) {
            await conn.rollback();
            return res.status(404).json({ message: 'Order not found.' });
        }

        // Mark order as Completed
        await conn.query("UPDATE purchase_orders SET status = 'Completed' WHERE id = ?", [req.params.id]);

        // Auto-create a Payment record
        const [payment] = await conn.query(
            "INSERT INTO payments (order_id, supplier_id, amount, payment_method, status) VALUES (?, ?, ?, 'Bank Transfer', 'Pending')",
            [req.params.id, order.supplier_id, order.total_amount]
        );

        await conn.commit();
        res.json({
            message: 'Order marked as completed. Payment record created.',
            payment_id: payment.insertId
        });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

module.exports = router;
