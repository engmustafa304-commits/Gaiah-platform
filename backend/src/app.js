const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Gaiah API is running', 
    timestamp: new Date().toISOString() 
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'المسار غير موجود' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message || 'حدث خطأ في الخادم' });
});

// Get port from environment or use 5001
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📱 Test endpoint: http://localhost:${PORT}/api/test`);
});

module.exports = app;
