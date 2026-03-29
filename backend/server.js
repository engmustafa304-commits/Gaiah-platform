const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes (مؤقتة)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Gaiah API is running' });
});

// Database connection (مؤقت)
console.log('Backend server is running');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
