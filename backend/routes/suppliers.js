const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/suppliers — List all suppliers
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM suppliers ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/suppliers — Add a new supplier
router.post('/', async (req, res) => {
    const { name, contact_email, phone, address } = req.body;
    if (!name || !contact_email) {
        return res.status(400).json({ message: 'Name and contact email are required.' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO suppliers (name, contact_email, phone, address) VALUES (?, ?, ?, ?)',
            [name, contact_email, phone || null, address || null]
        );
        res.status(201).json({ id: result.insertId, message: 'Supplier added successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/suppliers/:id — Update a supplier
router.put('/:id', async (req, res) => {
    const { name, contact_email, phone, address } = req.body;
    try {
        await db.query(
            'UPDATE suppliers SET name = ?, contact_email = ?, phone = ?, address = ? WHERE id = ?',
            [name, contact_email, phone || null, address || null, req.params.id]
        );
        res.json({ message: 'Supplier updated successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/suppliers/:id — Delete a supplier
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
        res.json({ message: 'Supplier deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
