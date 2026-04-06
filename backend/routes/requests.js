const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/requests — List all procurement requests
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM procurement_requests ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/requests — Submit a new request
router.post('/', async (req, res) => {
    const { item_name, quantity, estimated_price, department, description } = req.body;
    if (!item_name || !quantity || !estimated_price) {
        return res.status(400).json({ message: 'Item name, quantity and estimated price are required.' });
    }
    try {
        const [result] = await db.query(
            "INSERT INTO procurement_requests (item_name, quantity, estimated_price, department, description, status) VALUES (?, ?, ?, ?, ?, 'Pending')",
            [item_name, quantity, estimated_price, department || null, description || null]
        );
        // Auto-create a notification
        await db.query(
            "INSERT INTO notifications (title, message, type, request_id) VALUES (?, ?, 'info', ?)",
            ['New Request Submitted', `A new request for "${item_name}" has been submitted and is awaiting approval.`, result.insertId]
        );
        res.status(201).json({ id: result.insertId, message: 'Request submitted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/requests/:id/approve — Approve request + auto-create purchase order
router.post('/:id/approve', async (req, res) => {
    const { supplier_id } = req.body;
    if (!supplier_id) {
        return res.status(400).json({ message: 'Supplier ID is required to approve.' });
    }
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // Fetch the request
        const [[request]] = await conn.query('SELECT * FROM procurement_requests WHERE id = ?', [req.params.id]);
        if (!request) {
            await conn.rollback();
            return res.status(404).json({ message: 'Request not found.' });
        }

        // Update status to Approved
        await conn.query(
            "UPDATE procurement_requests SET status = 'Approved', supplier_id = ? WHERE id = ?",
            [supplier_id, req.params.id]
        );

        // Auto-create a Purchase Order
        const total_amount = request.quantity * request.estimated_price;
        const [order] = await conn.query(
            "INSERT INTO purchase_orders (request_id, supplier_id, item_name, quantity, total_amount, status) VALUES (?, ?, ?, ?, ?, 'Pending')",
            [req.params.id, supplier_id, request.item_name, request.quantity, total_amount]
        );

        // Notification
        await conn.query(
            "INSERT INTO notifications (title, message, type, request_id) VALUES (?, ?, 'success', ?)",
            [
                'Request Approved',
                `Request for "${request.item_name}" approved. Purchase Order PO-${String(order.insertId).padStart(4, '0')} has been created.`,
                req.params.id
            ]
        );

        await conn.commit();
        res.json({ message: 'Request approved and purchase order created.', order_id: order.insertId });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// POST /api/requests/:id/reject — Reject a request
router.post('/:id/reject', async (req, res) => {
    try {
        const [[request]] = await db.query('SELECT item_name FROM procurement_requests WHERE id = ?', [req.params.id]);
        if (!request) return res.status(404).json({ message: 'Request not found.' });

        await db.query("UPDATE procurement_requests SET status = 'Rejected' WHERE id = ?", [req.params.id]);

        await db.query(
            "INSERT INTO notifications (title, message, type, request_id) VALUES (?, ?, 'error', ?)",
            ['Request Rejected', `Request for "${request.item_name}" has been rejected.`, req.params.id]
        );

        res.json({ message: 'Request rejected.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
