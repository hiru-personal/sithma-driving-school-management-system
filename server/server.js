require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads', 'slips');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded payment slips
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check / Root Status Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Sithma Driving School API running smoothly',
    timestamp: new Date().toISOString(),
    branches: ['Maharagama', 'Werahara', 'Delgoda'],
    version: '1.0.0'
  });
});

// Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const packageRoutes = require('./routes/packages');
const slotRoutes = require('./routes/slots');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// Fallback 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[API Error]:', err.stack || err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`[Server] Sithma Driving School API running on port ${PORT}`);
});

module.exports = app;
