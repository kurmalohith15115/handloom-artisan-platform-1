const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with credentials and specified allowed origins
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "https://handloom-artisan-platform-1.vercel.app"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Express built-in body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (for Render ping)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Handloom Artisan Platform API is running' });
});

// API Routes FIRST
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// Root URL welcome message
app.get('/', (req, res) => {
  res.send('Welcome to the Handloom Artisan Support Platform Server API!');
});

// Wildcard 404 handler for /api requests
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ success: false, message: "API Endpoint not found." });
  }
  next();
});

// Global Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Global Error Middleware]:', err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`[Server] Handloom API Server running on port ${PORT}`);
});
