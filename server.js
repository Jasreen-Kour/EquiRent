require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, getDbStatus } = require('./config/db');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database (with automatic fallback to Persistent FileStore)
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve frontend static assets
app.use(express.static(path.join(__dirname, 'public')));

// System info endpoint
app.get('/api/system/status', (req, res) => {
  res.json({
    success: true,
    platform: 'EquiRent — Rent Smart. Work Better.',
    version: '1.0.0',
    database: getDbStatus(),
    commissionRate: `${(Number(process.env.COMMISSION_RATE || 0.10) * 100).toFixed(0)}%`,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/earnings', require('./routes/earnings'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reviews', require('./routes/reviews'));

// Fallback to index.html for SPA client-side routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[EquiRent Server Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 EquiRent Server running on http://localhost:${PORT}`);
  console.log(`📦 Status: Ready for Renters and Equipment Owners`);
  console.log(`=======================================================`);
});
