const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/adminAuth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../config/default');

// Get all users
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get a specific user
router.get('/users/:id', isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Update a user
router.put('/users/:id', isAdmin, async (req, res) => {
  try {
    const { fullName, email, role } = req.body;
    const userId = req.params.id;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { fullName, email, role } },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete a user
router.delete('/users/:id', isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Check if attempting to delete an admin
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Promote a user to admin
router.put('/users/:id/make-admin', isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Update user role
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { role: 'admin' } },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    res.status(500).json({ message: 'Error promoting user to admin' });
  }
});

// Get all transactions
router.get('/transactions', isAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});

// Get a specific transaction
router.get('/transactions/:id', isAdmin, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Error fetching transaction' });
  }
});

// Get transactions for a specific user
router.get('/transactions/user/:userId', isAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({ message: 'Error fetching user transactions' });
  }
});

// Get transactions for a specific wallet
router.get('/transactions/wallet/:address', isAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find({ walletAddress: req.params.address }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    res.status(500).json({ message: 'Error fetching wallet transactions' });
  }
});

// Get dashboard stats (users count, transactions count)
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const transactionCount = await Transaction.countDocuments();
    
    // Calculate total volume
    const transactions = await Transaction.find();
    let totalVolume = 0;
    let totalCredits = 0;
    
    transactions.forEach(tx => {
      if (tx.amount) {
        totalCredits += parseFloat(tx.amount);
      }
      if (tx.ethAmount) {
        totalVolume += parseFloat(tx.ethAmount);
      }
    });
    
    res.json({
      userCount,
      transactionCount,
      totalVolume,
      totalCredits
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// Add a debug auth check endpoint
router.get('/debug/auth', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                status: 'error',
                message: 'No authorization header provided'
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'No token in authorization header'
            });
        }

        try {
            const secret = config.jwtSecret;
            const decoded = jwt.verify(token, secret);
            
            // Find user by decoded ID
            const user = await User.findById(decoded.id);
            
            if (!user) {
                return res.json({
                    status: 'error',
                    message: 'Token is valid but user not found',
                    decoded
                });
            }
            
            return res.json({
                status: 'success',
                message: 'Token is valid',
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    isAdmin: user.role === 'admin'
                },
                decoded
            });
        } catch (jwtError) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token',
                error: jwtError.message
            });
        }
    } catch (error) {
        console.error('Debug auth error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Server error checking authentication'
        });
    }
});

// Add a quick admin creation endpoint for testing
router.post('/debug/create-admin', async (req, res) => {
    try {
        // Check if test admin already exists
        let testAdmin = await User.findOne({ email: 'testadmin@example.com' });
        
        if (!testAdmin) {
            // Create a test admin user
            testAdmin = new User({
                username: 'testadmin',
                email: 'testadmin@example.com',
                password: '$2a$10$eBLJ/TF.3QG7aaWOQLA7aOBRVO1QMUimP.cn5J0sdJOgXsNr92.5W', // Hashed 'admin123'
                fullName: 'Test Admin',
                role: 'admin',
                permissions: ['manage_users', 'manage_credits', 'manage_prices', 'view_analytics'],
                adminMetadata: {
                    accessLevel: 'admin',
                    isContractOwner: true
                }
            });
            
            await testAdmin.save();
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { id: testAdmin._id, role: testAdmin.role },
            config.jwtSecret,
            { expiresIn: '24h' }
        );
        
        // Update user's token
        testAdmin.auth = testAdmin.auth || {};
        testAdmin.auth.token = token;
        testAdmin.auth.lastLogin = new Date();
        await testAdmin.save();
        
        res.json({
            message: 'Test admin account ready',
            user: {
                id: testAdmin._id,
                email: testAdmin.email,
                fullName: testAdmin.fullName,
                role: testAdmin.role
            },
            token,
            credentials: {
                email: 'testadmin@example.com',
                password: 'admin123'
            }
        });
    } catch (error) {
        console.error('Create test admin error:', error);
        res.status(500).json({ message: 'Error creating test admin' });
    }
});

module.exports = router; 