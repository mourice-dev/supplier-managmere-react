const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Basic stats endpoint replacing the dashboard view
app.get('/api/stats', async (req, res) => {
    try {
        const [suppliers] = await db.query('SELECT COUNT(*) AS total_suppliers FROM suppliers');
        const [requests] = await db.query('SELECT COUNT(*) AS pending_requests FROM procurement_requests WHERE status = "Pending"');
        const [orders] = await db.query('SELECT COUNT(*) AS total_orders FROM purchase_orders');
        const [revenue] = await db.query('SELECT COALESCE(SUM(amount), 0) AS total_revenue FROM payments WHERE status = "Completed"');
        
        res.json({
            total_suppliers: suppliers[0].total_suppliers,
            pending_requests: requests[0].pending_requests,
            total_orders: orders[0].total_orders,
            total_revenue: revenue[0].total_revenue
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Auth endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.query('SELECT id, username, role FROM users WHERE username = ? AND password = ?', [username, password]);
        if (users.length > 0) {
            res.json({ success: true, user: users[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
