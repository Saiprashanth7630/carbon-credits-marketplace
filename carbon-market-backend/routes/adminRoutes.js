const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/adminAuth');

// Example admin-only dashboard route
router.get('/dashboard', isAdmin, (req, res) => {
  res.json({ message: 'Welcome, admin!', user: req.user });
});

// Add more admin-only routes here

module.exports = router; 