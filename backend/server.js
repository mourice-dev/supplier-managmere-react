const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

// ─── Middleware ──────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Route Files ─────────────────────────────────────
const authRoutes          = require('./routes/auth');
const statsRoutes         = require('./routes/stats');
const suppliersRoutes     = require('./routes/suppliers');
const requestsRoutes      = require('./routes/requests');
const ordersRoutes        = require('./routes/orders');
const paymentsRoutes      = require('./routes/payments');
const notificationsRoutes = require('./routes/notifications');

// ─── Mount Routes ─────────────────────────────────────
app.use('/api',               authRoutes);          // POST /api/login
app.use('/api/stats',         statsRoutes);         // GET  /api/stats
app.use('/api/suppliers',     suppliersRoutes);     // CRUD /api/suppliers
app.use('/api/requests',      requestsRoutes);      // CRUD /api/requests
app.use('/api/orders',        ordersRoutes);        // GET  /api/orders, POST /complete
app.use('/api/payments',      paymentsRoutes);      // GET  /api/payments, POST /complete
app.use('/api/notifications', notificationsRoutes); // GET  /api/notifications

// ─── Health Check ─────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'ProCureSys+ API', version: '2.0.0' });
});

// ─── 404 Handler ──────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.url} not found.` });
});

// ─── Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error.' });
});

// ─── Start Server ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅  ProCureSys+ API running → http://localhost:${PORT}`);
    console.log(`    Routes: /api/login | /api/stats | /api/suppliers | /api/requests | /api/orders | /api/payments | /api/notifications`);
});
