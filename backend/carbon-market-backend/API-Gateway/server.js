// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const routes = require('./routes/blockchainRoutes');
dotenv.config();
console.log('Private Key:', process.env.PRIVATE_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error'
    }
  });
});

app.listen(PORT, () => {
    console.log(`API Gateway server running on port ${PORT}`);
});
