require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with support for credentials
app.use(cors({
  origin: '*', // Allow all client headers
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true
}));

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Database Connection
connectDB();

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/list', require('./routes/listRoutes'));
app.use('/api/recipes', require('./routes/recipeRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/prices', require('./routes/priceRoutes'));

// Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    message: "Welcome to AetherGro Smart Inventory Server API Portal.",
    status: "online",
    activeMode: require('./config/db').isMongoActive() ? "MongoDB Cloud Database" : "Local JSON Engine"
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error: ", err.stack);
  res.status(500).json({
    message: "A serious internal server error occurred in AetherGro runtime.",
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start Server Listener
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 AETHERGRO SERVER UP AND RUNNING!`);
  console.log(`📡 Port: http://localhost:${PORT}`);
  console.log(`🛠️ Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`======================================================\n`);
});
